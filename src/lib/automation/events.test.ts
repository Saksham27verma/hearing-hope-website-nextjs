import { describe, expect, it } from "vitest";
import {
  AUTOMATION_EVENTS,
  eventSubscriberCount,
  publishAutomationEvent,
  subscribeAutomationEvents,
} from "@/lib/automation/events";

describe("automation events", () => {
  it("delivers an event to a subscriber and keeps going if one fails", async () => {
    const seen: string[] = [];
    const unsubscribe = subscribeAutomationEvents((event) => {
      seen.push(event.name);
    });
    const unsubscribeFail = subscribeAutomationEvents(() => {
      throw new Error("listener down");
    });
    const result = await publishAutomationEvent("page.published", { pageId: "1" });
    unsubscribe();
    unsubscribeFail();
    expect(seen).toContain("page.published");
    expect(result.failures).toBe(1);
  });
});

it("registers a subscriber for each declared event", () => {
  for (const event of AUTOMATION_EVENTS) {
    expect(eventSubscriberCount(event)).toBeGreaterThan(0);
  }
});
