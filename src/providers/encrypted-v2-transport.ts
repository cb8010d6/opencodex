import type { OcxProviderConfig } from "../types";
import { getOAuthCredentialApiBaseUrl } from "../oauth";
import { sameUpstreamOrigin } from "../lib/provider-url";
import { canReceiveEncryptedV2AgentTasks } from "./openai-tiers";
import { resolveFinalWireProtocolOverride } from "../server/adapter-resolve";
import { type InboundWire } from "./registry";
import { resolveProviderTransport } from "./xai-transport";

/**
 * Whether an opaque encrypted V2 agent task may be sent to the final destination of
 * `route`. The opt-in (canonical ChatGPT forwarding or an explicit
 * `allowEncryptedV2AgentTasks` trust) is consent for the origin the operator reviewed,
 * so the transport-resolved endpoint must stay on the approved base URL's origin before
 * the final wire override is checked. Model-aware callers pass the request's inbound
 * wire, and optional request context (prompt cache key) reaches providers whose
 * transport needs it.
 */
export function canRouteEncryptedV2AgentTasks(
  route: { providerName: string; modelId: string; provider: OcxProviderConfig },
  inboundWire: InboundWire,
  approvedBaseUrl: string,
  promptCacheKey?: string,
): boolean {
  const transportProvider = resolveProviderTransport(
    route.providerName,
    route.provider,
    promptCacheKey,
    route.providerName === "github-copilot" ? getOAuthCredentialApiBaseUrl(route.providerName) : undefined,
  );
  if (!sameUpstreamOrigin(approvedBaseUrl, String(transportProvider.baseUrl ?? ""))) return false;
  const resolvedProvider = resolveFinalWireProtocolOverride(
    route.providerName,
    route.modelId,
    transportProvider,
    inboundWire,
  );
  return canReceiveEncryptedV2AgentTasks(resolvedProvider);
}
