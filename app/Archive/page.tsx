"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ArchivePage() {
  const router = useRouter();

  return (
    <>
      {/* 반투명 오버레이 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => router.back()}
        aria-label="Close archive panel"
      />
      {/* 우측 패널 */}
      <div
        className="fixed top-0 right-0 h-full w-full md:w-1/2 max-w-2xl bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          willChange: "transform",
          transform: "translateX(0)" // 필요하다면 초기값 animate로 바꿀 수 있음
        }}
      >
        <button
          className="absolute top-6 right-6 text-3xl"
          onClick={() => router.back()}
          aria-label="Close"
        >
          ×
        </button>
        <div className="max-w-xl mx-auto py-16 px-6">
          <h1 className="text-3xl font-bold mb-8">Archive</h1>
          <ul>
            <li className="mb-4">
              <h3 className="text-lg font-semibold">[인터뷰] 매체와 경계에 관하여</h3>
              <p className="text-sm text-gray-500">2023.09.13 / 작가 인터뷰</p>
            </li>
            <li className="mb-4">
              <h3 className="text-lg font-semibold">[기사] 전시 ‘북중 무역의 허점’ 리뷰</h3>
              <p className="text-sm text-gray-500">2024.03.15 / 한국일보</p>
            </li>
            {/* ... */}
          </ul>
        </div>
      </div>
    </>
  );
}

