/**
 * Simple exponential-backoff retry — replaces p-retry to avoid ESM issues.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    minTimeout?: number;
    onFailedAttempt?: (err: Error, attempt: number) => void;
    shouldRetry?: (err: Error) => boolean;
  } = {}
): Promise<T> {
  const { retries = 3, minTimeout = 2000, onFailedAttempt, shouldRetry } = options;

  let lastErr: Error = new Error("Unknown error");
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e as Error;
      if (shouldRetry && !shouldRetry(lastErr)) throw lastErr;
      if (attempt > retries) throw lastErr;
      onFailedAttempt?.(lastErr, attempt);
      await sleep(minTimeout * attempt);
    }
  }
  throw lastErr;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
