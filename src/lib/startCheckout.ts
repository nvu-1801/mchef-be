export async function startCheckout(planId: string, userId: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ planId, userId }),
  });

  const j = await res.json();
  if (!res.ok) throw new Error(j?.error || `Checkout failed (HTTP ${res.status})`);

  const url = j?.checkoutUrl;
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new Error("Missing checkoutUrl from PayOS");
  }
  window.location.assign(url);
}
