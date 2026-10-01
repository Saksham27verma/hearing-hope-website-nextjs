/** Retry only transient network and provider failures.  Callers retain control of
 * permanent validation/authentication errors, which must never be retried. */
export type BackoffOptions = {
  delaysMs?: readonly number[];
  sleep?: (milliseconds: number) => Promise<void>;
  shouldRetry?: (error: unknown) => boolean;
};

export class RetryableHttpError extends Error {
  constructor(readonly status: number, message = `External request failed (${status}).`) {
    super(message);
    this.name = "RetryableHttpError";
  }
}

export function isTransientFailure(error: unknown) {
  if (error instanceof RetryableHttpError) return error.status === 408 || error.status === 425 || error.status === 429 || error.status >= 500;
  return error instanceof TypeError; // fetch network failures
}

export async function withBackoff<T>(request: () => Promise<T>, options: BackoffOptions = {}) {
  const delays = options.delaysMs ?? [1_000, 5_000, 25_000];
  const sleep = options.sleep ?? ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const shouldRetry = options.shouldRetry ?? isTransientFailure;
  let lastError: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try { return await request(); } catch (error) {
      lastError = error;
      if (attempt === delays.length || !shouldRetry(error)) throw error;
      await sleep(delays[attempt]);
    }
  }
  throw lastError;
}

export async function fetchWithBackoff(fetcher: typeof fetch, input: RequestInfo | URL, init?: RequestInit) {
  return withBackoff(async () => {
    const response = await fetcher(input, init);
    if (!response.ok && (response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500)) throw new RetryableHttpError(response.status);
    return response;
  });
}
