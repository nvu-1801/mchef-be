"use client";
import React from "react";
import Image from "next/image";
import { DishFull } from "@/modules/dishes/dish-public";

type Props = {
  cover: string;
  dish: DishFull;
};

export default function DishCover({ cover, dish }: Props) {
  const dietIcons: Record<string, string> = {
    veg: "🥗",
    nonveg: "🍖",
    vegan: "🌱",
  };
  const dietLabels: Record<string, string> = {
    veg: "Vegetarian",
    nonveg: "Non-Veg",
    vegan: "Vegan",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl mx-auto max-w-xl">
      <div className="aspect-square relative">
        <Image
          src={cover}
          alt={dish.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 640px) 100vw, 576px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {dish.diet && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
              <span className="text-base">{dietIcons[dish.diet]}</span>
              {dietLabels[dish.diet]}
            </span>
          )}
          {dish.time_minutes && dish.time_minutes > 0 && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
              <span className="text-base">⏱️</span>
              {dish.time_minutes} phút
            </span>
          )}
          {dish.servings && dish.servings > 0 && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
              <span className="text-base">👥</span>
              {dish.servings} người
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
