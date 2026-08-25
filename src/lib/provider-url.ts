/** Strip credentials and non-routing URL components before displaying a provider URL. */
export function publicProviderBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "(invalid URL)";
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, baseUrl.endsWith("/") ? "/" : "");
  } catch {
    return "(invalid URL)";
  }
}

/**
 * Whether two upstream URL strings resolve to the same origin (protocol + host + port).
 * Capability consent is granted to the destination origin an operator configured; this
 * predicate is what lets a later transport-level check (for example OAuth credential
 * endpoint metadata) prove the resolved endpoint has not left that origin. Invalid or
 * empty inputs fail closed by reporting a mismatch.
 */
export function sameUpstreamOrigin(left: string, right: string): boolean {
  try {
    return new URL(left.trim()).origin === new URL(right.trim()).origin;
  } catch {
    return false;
  }
}
