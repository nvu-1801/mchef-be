// src/lib/startCheckout.ts
export async function startCheckout(planId: string, userId: string) {
  const r = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ planId, userId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Checkout failed");

  console.log("✅ PayOS checkout data:", data); // <== thêm dòng này để debug

  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl; // <== dòng redirect
    return;
  }

  // fallback hiển thị QR code nếu có
  if (data.qrCode) {
    alert("Dán QR vào trang UI nếu muốn thanh toán qua quét QR");
  }

  return data;
}
