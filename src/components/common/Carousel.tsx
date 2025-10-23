"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
  src:"/anna-pelzer-IGfIGP5ONV0-unsplash.jpg",
  title: "Món Ăn Tươi Ngon",
  desc: "Khám phá những món ăn tươi ngon được chế biến từ nguyên liệu chất lượng cao.",
  },
  {
  src:"/sergey-kotenev-PiizAdrUf8Y-unsplash.jpg",
  title: "Công Thức Độc Đáo",
  desc: "Thử ngay các công thức nấu ăn độc đáo, sáng tạo để làm mới bữa ăn hàng ngày của bạn.",
  },
  {
  src:"/kirill-tonkikh-NFQi_2HUNRI-unsplash.jpg",
  title: "Dinh Dưỡng Cân Bằng",
  desc: "Tận hưởng những món ăn không chỉ ngon mà còn cung cấp đầy đủ dinh dưỡng cho cơ thể.",
  },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chuyển slide tự động sau mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

 return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-xl mt-4">
      {/* Ảnh */}
      <div className="relative h-[320px] md:h-[420px] w-full">
        {images.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <Image
              src={item.src}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Caption (chữ giới thiệu món ăn) */}
            <div
              className={`absolute bottom-10 left-10 text-white transition-all duration-700 ${
                index === currentIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <h3 className="text-2xl md:text-3xl font-semibold drop-shadow-lg">
                {item.title}
              </h3>
              <p className="text-sm md:text-base opacity-90 mt-1 drop-shadow-md">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Chấm chỉ số */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3.5 h-3.5 rounded-full border border-white transition-all ${
              i === currentIndex
                ? "bg-white scale-125 shadow-md"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
