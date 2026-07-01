import { createHash } from "node:crypto";

type PayPalMode = "sandbox" | "live";

function getPayPalMode(): PayPalMode {
  return process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
}

function getPayPalBaseUrl(): string {
  return getPayPalMode() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function requirePayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }
  return { clientId, clientSecret };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const { clientId, clientSecret } = requirePayPalCredentials();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? "Failed to obtain PayPal access token.");
  }

  cachedToken = {
    value: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 300) * 1000,
  };
  return payload.access_token;
}

async function paypalRequest<T extends Record<string, unknown>>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const token = await getPayPalAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  const text = await response.text();
  let payload: T & { message?: string; details?: { issue: string }[] };
  try {
    payload = (text ? JSON.parse(text) : {}) as T & {
      message?: string;
      details?: { issue: string }[];
    };
  } catch {
    throw new Error(`PayPal API returned invalid JSON (${response.status}).`);
  }

  if (!response.ok) {
    const detail = payload.details?.[0]?.issue;
    throw new Error(detail ?? payload.message ?? `PayPal API error (${response.status}).`);
  }

  return payload;
}

export function getPayPalClientId(): string | null {
  return process.env.PAYPAL_CLIENT_ID ?? null;
}

export async function createPayPalOrder(params: {
  amount: string;
  currency: string;
  referenceId: string;
  description: string;
}): Promise<{ orderId: string }> {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
  const payload = await paypalRequest<{
    id: string;
  }>("/v2/checkout/orders", {
    method: "POST",
    json: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description,
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
        },
      ],
      application_context: {
        brand_name: "Madar Al-Bian",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${siteUrl}/request-for-publication-of-a-study`,
        cancel_url: `${siteUrl}/request-for-publication-of-a-study`,
      },
    },
  });

  if (!payload.id) throw new Error("PayPal did not return an order id.");
  return { orderId: payload.id };
}

export type PayPalCaptureResult = {
  captureId: string;
  payerEmail: string | null;
  payerName: string | null;
  amount: string;
  currency: string;
};

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  const payload = await paypalRequest<{
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id?: string;
          status?: string;
          amount?: { value?: string; currency_code?: string };
        }>;
      };
    }>;
    payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  }>(`/v2/checkout/orders/${orderId}/capture`, { method: "POST" });

  const capture = payload.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture?.id) throw new Error("PayPal capture id missing.");

  const given = payload.payer?.name?.given_name ?? "";
  const family = payload.payer?.name?.surname ?? "";
  const payerName = `${given} ${family}`.trim() || null;

  return {
    captureId: capture.id,
    payerEmail: payload.payer?.email_address ?? null,
    payerName,
    amount: capture.amount?.value ?? "0.00",
    currency: capture.amount?.currency_code ?? "USD",
  };
}

export async function refundPayPalCapture(
  captureId: string,
  amount?: string,
  currency?: string,
): Promise<{ refundId: string }> {
  const body =
    amount && currency
      ? { amount: { value: amount, currency_code: currency } }
      : undefined;

  const payload = await paypalRequest<{ id?: string }>(
    `/v2/payments/captures/${captureId}/refund`,
    { method: "POST", json: body ?? {} },
  );

  if (!payload.id) throw new Error("PayPal did not return a refund id.");
  return { refundId: payload.id };
}

type WebhookHeaders = {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
};

export function parsePayPalWebhookHeaders(headers: Headers): WebhookHeaders | null {
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return null;
  }
  return { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig };
}

export async function verifyPayPalWebhook(
  headers: WebhookHeaders,
  body: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const payload = await paypalRequest<{ verification_status?: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      json: {
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      },
    },
  );

  return payload.verification_status === "SUCCESS";
}

export function stableWebhookEventId(body: string): string {
  return createHash("sha256").update(body).digest("hex").slice(0, 32);
}
