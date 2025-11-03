"use client";
import React, { useState } from "react";
import Image from "next/image";
import { DishFull } from "@/modules/dishes/dish-public";

type Props = {
  dish: DishFull;
  proxied: (u?: string | null, fallback?: string) => string;
};

export default function DishTabs({ dish, proxied }: Props) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50/50 px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "ingredients"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🥕 Nguyên liệu ({dish.dish_ingredients?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("steps")}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "steps"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📝 Cách làm ({dish.recipe_steps?.length || 0} bước)
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "ingredients" && (
          <div className="space-y-3">
            {dish.dish_ingredients && dish.dish_ingredients.length > 0 ? (
              <>
                <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <p className="text-sm text-violet-900 font-medium">
                    📋 Tổng cộng:{" "}
                    <span className="font-bold">
                      {dish.dish_ingredients.length}
                    </span>{" "}
                    nguyên liệu
                  </p>
                </div>
                {dish.dish_ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border bg-gray-50/50 p-4 hover:bg-gray-50 hover:border-violet-200 transition group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 group-hover:from-violet-200 group-hover:to-fuchsia-200 flex items-center justify-center text-xl flex-shrink-0 transition">
                      🥘
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">
                        {idx + 1}. {ing.ingredient?.name ?? "Nguyên liệu"}
                      </div>
                      {(ing.amount || ing.ingredient?.unit) && (
                        <div className="text-sm text-violet-600 font-medium mt-1">
                          {[ing.amount, ing.ingredient?.unit]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      )}
                      {ing.note && (
                        <div className="text-xs text-gray-500 mt-1">
                          {ing.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥘</div>
                <p className="text-gray-400 font-medium">Chưa có nguyên liệu</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "steps" && (
          <div className="space-y-6">
            {dish.recipe_steps && dish.recipe_steps.length > 0 ? (
              <>
                <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <p className="text-sm text-violet-900 font-medium">
                    👨‍🍳 Tổng cộng:{" "}
                    <span className="font-bold">
                      {dish.recipe_steps.length}
                    </span>{" "}
                    bước thực hiện
                  </p>
                </div>
                {dish.recipe_steps.map((step, index) => (
                  <div key={step.step_no} className="relative">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
                          {step.step_no}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">
                              Bước {step.step_no}
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {step.content}
                            </p>
                          </div>
                        </div>
                        {step.image_url && (
                          <div className="relative aspect-square rounded-xl overflow-hidden border shadow-sm max-w-xs hover:shadow-lg transition">
                            <Image
                              src={proxied(step.image_url)}
                              alt={`Bước ${step.step_no}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 320px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {index !== dish.recipe_steps!.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 to-transparent" />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-400 font-medium">Chưa có hướng dẫn</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
