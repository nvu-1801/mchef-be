"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.6" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.6" />
  </svg>
);

type Suggestion = {
  id?: string;
  slug: string;
  title: string;
  image: string;
};

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const qParam = sp.get("q") ?? "";
  const catParam = sp.get("cat") ?? "all";

  const [q, setQ] = useState(qParam);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const [showBox, setShowBox] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🧠 Sync khi back/forward
  useEffect(() => setQ(qParam), [qParam]);

  // 📂 Load history
  useEffect(() => {
    const stored = localStorage.getItem("search_history");
    setHistory(stored ? JSON.parse(stored) : []);
  }, []);

  const saveHistory = (term: string) => {
    if (!term.trim()) return;
    const stored = localStorage.getItem("search_history");
    let h: string[] = stored ? JSON.parse(stored) : [];
    h = [term, ...h.filter((x: string) => x !== term)].slice(0, 6);
    localStorage.setItem("search_history", JSON.stringify(h));
    setHistory(h);
  };

  // 🔎 Suggest API
  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim()) return setSuggestions([]);
    const res = await fetch(`/api/dishes/suggest?q=${encodeURIComponent(text)}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data as Suggestion[]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(q), 200);
    return () => clearTimeout(t);
  }, [q, fetchSuggestions]);

  const buildUrl = useMemo(
    () => (next: { q?: string; cat?: string; page?: number }) => {
      const params = new URLSearchParams(sp.toString());
      if (typeof next.q === "string") {
        const val = next.q.trim();
        if (val) params.set("q", val);
        else params.delete("q");
      }
      if (typeof next.cat === "string") {
        if (next.cat && next.cat !== "all") params.set("cat", next.cat);
        else params.delete("cat");
      }
      params.set("page", String(next.page ?? 1));
      return `${pathname}?${params.toString()}`;
    },
    [pathname, sp]
  );

  const goToDish = (slug: string) => {
    setShowBox(false);
    setSuggestions([]);
    setHighlight(-1);
    setQ("");
    router.push(`/home/${slug}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0 && highlight >= 0) {
      goToDish(suggestions[highlight].slug);
      return;
    }
    saveHistory(q);
    router.push(buildUrl({ q, cat: catParam, page: 1 }));
    setShowBox(false);
  };

  const onClear = () => {
    setQ("");
    router.push(buildUrl({ q: "", cat: catParam, page: 1 }));
  };

  const onResetAll = () => {
    setQ("");
    const params = new URLSearchParams(sp.toString());
    params.delete("q");
    params.delete("cat");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeys = (e: React.KeyboardEvent) => {
    if (!showBox) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      goToDish(suggestions[highlight].slug);
    }
  };

  const highlightText = (t: string) =>
    t.replace(new RegExp(`(${q})`, "gi"), "<b class='text-purple-600'>$1</b>");

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2 relative">
      <div className="relative w-full">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setShowBox(true); }}
          onFocus={() => setShowBox(true)}
          onKeyDown={handleKeys}
          placeholder="Tìm món ăn, nguyên liệu, đầu bếp…"
          className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 pr-20 text-sm shadow-sm focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
        />

        {/* 🔍 nút search giữ NGUYÊN chỗ */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-2 text-xs font-bold text-white shadow-md hover:brightness-110"
        >
          🔍
        </button>

        {/* 📦 Suggest box */}
        {showBox && (suggestions.length > 0 || history.length > 0) && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-auto">
            
            {/* 🕓 lịch sử */}
            {!q && history.length > 0 && (
              <div className="p-2 text-sm">
                <div className="mb-1 text-xs text-gray-500">Lịch sử tìm kiếm</div>
                {history.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className="w-full p-2 text-left hover:bg-gray-50 rounded"
                    onClick={() => { setQ(h); fetchSuggestions(h); setShowBox(true); }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}

            {q && suggestions.map((s, i) => (
              <button
                key={s.id ?? s.slug}
                type="button"
                className={`flex w-full items-center gap-3 p-2 text-left ${
                  highlight === i ? "bg-purple-50" : "hover:bg-gray-50"
                }`}
                onClick={() => goToDish(s.slug)}
              >
                <img src={s.image} alt={s.title} className="h-10 w-10 rounded object-cover" />
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: highlightText(s.title) }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔁 nút Reset giữ NGUYÊN chỗ */}
      <button
        type="button"
        onClick={onResetAll}
        className="hidden sm:inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        <ResetIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

// "use client";

// import { useEffect, useMemo, useState, useCallback, useRef } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";

// const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
//     strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 2v6h-6" />
//     <path d="M3 12a9 9 0 0 1 15-6.6" />
//     <path d="M3 22v-6h6" />
//     <path d="M21 12a9 9 0 0 1-15 6.6" />
//   </svg>
// );

// export default function SearchBar() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const sp = useSearchParams();

//   const qParam = sp.get("q") ?? "";
//   const catParam = sp.get("cat") ?? "all";

//   const [q, setQ] = useState(qParam);
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [highlight, setHighlight] = useState(-1);
//   const [showBox, setShowBox] = useState(false);
//   const [history, setHistory] = useState<string[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // 🧠 Sync khi back/forward
//   useEffect(() => setQ(qParam), [qParam]);

//   // 📂 Load history
//   useEffect(() => {
//     setHistory(JSON.parse(localStorage.getItem("search_history") || "[]"));
//   }, []);

//   const saveHistory = (term: string) => {
//     if (!term.trim()) return;
//     let h = JSON.parse(localStorage.getItem("search_history") || "[]");
//     h = [term, ...h.filter((x: string) => x !== term)].slice(0, 6);
//     localStorage.setItem("search_history", JSON.stringify(h));
//     setHistory(h);
//   };

//   // 🔎 Suggest API
//   const fetchSuggestions = useCallback(async (text: string) => {
//     if (!text.trim()) return setSuggestions([]);
//     const res = await fetch(`/api/dishes/suggest?q=${encodeURIComponent(text)}`);
//     if (res.ok) setSuggestions(await res.json());
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => fetchSuggestions(q), 200);
//     return () => clearTimeout(t);
//   }, [q, fetchSuggestions]);

//   const buildUrl = useMemo(
//     () => (next: { q?: string; cat?: string; page?: number }) => {
//       const params = new URLSearchParams(sp.toString());
//       if (typeof next.q === "string") {
//         const val = next.q.trim();
//         if (val) params.set("q", val);
//         else params.delete("q");
//       }
//       if (typeof next.cat === "string") {
//         if (next.cat && next.cat !== "all") params.set("cat", next.cat);
//         else params.delete("cat");
//       }
//       params.set("page", String(next.page ?? 1));
//       return `${pathname}?${params.toString()}`;
//     },
//     [pathname, sp]
//   );

//   const goToDish = (slug: string) => {
//     setShowBox(false);
//     setSuggestions([]);
//     setHighlight(-1);
//     setQ("");
//     router.push(`/home/${slug}`);
//   };

//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (suggestions.length > 0 && highlight >= 0) {
//       goToDish(suggestions[highlight].slug);
//       return;
//     }
//     saveHistory(q);
//     router.push(buildUrl({ q, cat: catParam, page: 1 }));
//     setShowBox(false);
//   };

//   const onClear = () => {
//     setQ("");
//     router.push(buildUrl({ q: "", cat: catParam, page: 1 }));
//   };

//   const onResetAll = () => {
//     setQ("");
//     const params = new URLSearchParams(sp.toString());
//     params.delete("q");
//     params.delete("cat");
//     params.set("page", "1");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handleKeys = (e: React.KeyboardEvent) => {
//     if (!showBox) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlight((i) => Math.min(i + 1, suggestions.length - 1));
//     }
//     if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlight((i) => Math.max(i - 1, 0));
//     }
//     if (e.key === "Enter" && highlight >= 0) {
//       e.preventDefault();
//       goToDish(suggestions[highlight].slug);
//     }
//   };

//   const highlightText = (t: string) =>
//     t.replace(new RegExp(`(${q})`, "gi"), "<b class='text-purple-600'>$1</b>");

//   return (
//     <form onSubmit={onSubmit} className="flex w-full items-center gap-2 relative">
//       <div className="relative w-full">
//         <input
//           ref={inputRef}
//           value={q}
//           onChange={(e) => { setQ(e.target.value); setShowBox(true); }}
//           onFocus={() => setShowBox(true)}
//           onKeyDown={handleKeys}
//           placeholder="Tìm món ăn, nguyên liệu, đầu bếp…"
//           className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 pr-20 text-sm shadow-sm focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
//         />

//         {/* 🔍 nút search giữ NGUYÊN chỗ */}
//         <button
//           type="submit"
//           className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-2 text-xs font-bold text-white shadow-md hover:brightness-110"
//         >
//           🔍
//         </button>

//         {/* 📦 Suggest box */}
//         {showBox && (suggestions.length > 0 || history.length > 0) && (
//           <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-xl max-h-72 overflow-auto">
            
//             {/* 🕓 lịch sử */}
//             {!q && history.length > 0 && (
//               <div className="p-2 text-sm">
//                 <div className="mb-1 text-xs text-gray-500">Lịch sử tìm kiếm</div>
//                 {history.map((h) => (
//                   <button
//                     key={h}
//                     className="w-full p-2 text-left hover:bg-gray-50 rounded"
//                     onClick={() => { setQ(h); fetchSuggestions(h); setShowBox(true); }}
//                   >
//                     {h}
//                   </button>
//                 ))}
//               </div>
//             )}

//             {q && suggestions.map((s, i) => (
//               <button
//                 key={s.id ?? s.slug}
//                 className={`flex w-full items-center gap-3 p-2 text-left ${
//                   highlight === i ? "bg-purple-50" : "hover:bg-gray-50"
//                 }`}
//                 onClick={() => goToDish(s.slug)}
//               >
//                 <img src={s.image} className="h-10 w-10 rounded object-cover" />
//                 <div className="text-sm" dangerouslySetInnerHTML={{ __html: highlightText(s.title) }} />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* 🔁 nút Reset giữ NGUYÊN chỗ */}
//       <button
//         type="button"
//         onClick={onResetAll}
//         className="hidden sm:inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//       >
//         <ResetIcon className="h-5 w-5" />
//       </button>
//     </form>
//   );
// }
