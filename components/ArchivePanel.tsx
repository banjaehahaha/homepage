"use client";
import { motion } from "framer-motion";
import React from "react";
import { archiveList } from "@/components/archiveList";

export default function ArchivePanel({ onClose }: { onClose: () => void }) {
    const sortedList = [...archiveList].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
        aria-label="Close archive panel"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-full md:w-[70vw] max-w-5xl bg-[#222] z-50 shadow-2xl overflow-y-auto"
        style={{ willChange: "transform" }}
      >
        <button
          className="absolute top-6 right-6 text-3xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="max-w-5xl mx-auto py-16 px-14">
          <h1 className="text-3xl font-bold mb-8 text-left">Archive</h1>
          <ul>
            {sortedList.map((item, idx) => (
                <li key={idx} className="mb-4 flex flex-col">
                <div className="flex items-center space-x-2">
                {/* 설명글: 작고 회색, 링크 바깥! */}
                <span className="text-sm text-gray-400 mr-2">
                    {item.desc}
                </span>
                {/* 제목: 굵고 흰색 링크 */}
                {item.type === "pdf" ? (
                    <a
                    href={`/pdfs/${item.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-white font-bold hover:text-[#92F90E]"
                    >
                    {item.label}
                    </a>
                ) : (
                    <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-white font-bold hover:text-[#92F90E]"
                    >
                    {item.label}
                    </a>
                )}
                {/* 아이콘 */}
                <span>
                    {item.type === "pdf" ? "📄" : "🔗"}
                </span>
                <div className="text-sm text-gray-400 mt-1">
                    {item.source}
                </div>
                </div>
                
                </li>
            ))}
            </ul>

        </div>
      </motion.div>
    </>
  );
}
