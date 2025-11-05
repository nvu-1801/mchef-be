"use client";

import { useEffect, useState } from "react";

export default function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (list: string[]) => {
    setWishlist(list);
    localStorage.setItem("wishlist", JSON.stringify(list));
  };

  const toggle = (id: string) => {
    if (wishlist.includes(id)) save(wishlist.filter(x => x !== id));
    else save([...wishlist, id]);
  };

  const remove = (id: string) => save(wishlist.filter(x => x !== id));
  const clear = () => save([]);

  const isInWishlist = (id: string) => wishlist.includes(id);

  return { wishlist, toggle, remove, clear, isInWishlist };
}
