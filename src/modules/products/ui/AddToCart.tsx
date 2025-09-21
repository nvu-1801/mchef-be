"use client";
import { useEffect, useState } from "react";
import type { Product } from "../product-public";

type Line = { id: string; name: string; slug: string; price: number; qty: number; image?: string };

function readCart(): Line[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}
function writeCart(lines: Line[]) {
  localStorage.setItem("cart", JSON.stringify(lines));
}

export function AddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const image = product.images?.[0];

  const add = () => {
    const current = readCart();
    const i = current.findIndex((l) => l.id === product.id);
    if (i >= 0) current[i].qty += qty;
    else current.push({ id: product.id, name: product.name, slug: product.slug, price: product.price, qty, image });
    writeCart(current);
    alert("Đã thêm vào giỏ");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border rounded-xl overflow-hidden">
        <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
        <input className="w-12 text-center outline-none" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}/>
        <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>+</button>
      </div>
      <button onClick={add} className="px-5 py-2 rounded-xl bg-black text-white">Thêm vào giỏ</button>
    </div>
  );
}
