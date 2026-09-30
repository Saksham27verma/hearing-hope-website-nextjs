export const AUTOMATION_EVENTS = [
  "page.published",
  "page.updated",
  "page.archived",
  "review.received",
  "review.reply_published",
  "ticket.draft_ready",
  "ticket.brief_ready",
  "technical.cwv_regression",
] as const;

export type AutomationEventName = (typeof AUTOMATION_EVENTS)[number];

export type AutomationEvent = {
  name: AutomationEventName;
  payload: Record<string, unknown>;
};

type Listener = (event: AutomationEvent) => void | Promise<void>;

const listeners = new Set<Listener>();
const listenersByEvent = new Map<AutomationEventName, Set<Listener>>(
  AUTOMATION_EVENTS.map((name) => [name, new Set<Listener>()]),
);

export function subscribeAutomationEvents(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function subscribeAutomationEvent(name: AutomationEventName, listener: Listener) {
  const eventListeners = listenersByEvent.get(name);
  if (!eventListeners) throw new Error(`Unknown automation event: ${name}`);
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}

export function eventSubscriberCount(name: AutomationEventName) {
  return listenersByEvent.get(name)?.size ?? 0;
}

export async function publishAutomationEvent(name: AutomationEventName, payload: Record<string, unknown> = {}) {
  const event = { name, payload };
  const failures: string[] = [];
  const eventListeners = listenersByEvent.get(name) ?? new Set<Listener>();
  for (const listener of [...listeners, ...eventListeners]) {
    try {
      await listener(event);
    } catch (error) {
      const message = error instanceof Error ? error.message : "listener failed";
      failures.push(message);
      console.error("[automation-event]", name, message);
    }
  }
  const listenerCount = listeners.size + eventListeners.size;
  console.info("[automation-event]", name, { listeners: listenerCount, failures: failures.length });
  return { listeners: listenerCount, failures: failures.length };
}

function logEvent(event: AutomationEvent) {
  console.info("[automation-event:log]", event.name, event.payload);
}

for (const name of AUTOMATION_EVENTS) {
  subscribeAutomationEvent(name, logEvent);
}
