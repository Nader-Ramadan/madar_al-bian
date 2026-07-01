import { ok } from "@/lib/api-response";
import { getPayPalClientId } from "@/lib/paypal";

export async function GET() {
  return ok({ clientId: getPayPalClientId() });
}
