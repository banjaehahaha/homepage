"use client";
import { motion } from "framer-motion";
import React from "react";
import { archiveList } from "@/components/archiveList";

export default function ArchivePanel({
    onClose,
    zIndex = 50, // 기본값 50
  }: {
    onClose: () => void;
    zIndex?: number;
  }) {
    const sortedList = [...archiveList].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div
        style={{ zIndex }}
        className="fixed     
        left-0 
        top-0
        w-full
        h-[calc(100vh-40px)]  
        bg-black/70"
        onClick={onClose}
        aria-label="Close archive panel"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 right-0
        w-full md:w-[70vw] max-w-5xl
        bg-[#222] z-50 shadow-2xl overflow-y-auto
        p-3 sm:p-3 md:p-8 lg:p-8
        [height:calc(100vh-40px)] md:h-full
        [bottom:40px] md:bottom-0
        rounded-t-xl"
        style={{ zIndex, willChange: "transform" }}
      >
        <button
          className="absolute top-6 right-6 text-3xl"
          onClick={onClose}
          style={{cursor: "pointer"}}
          aria-label="Close"
        >
          ×
        </button>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-left">Archive</h1>
          <ul>
            {sortedList.map((item, idx) => (
                <li key={idx} className="mb-4 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
                {/* 설명글: 작고 회색, 링크 바깥! */}
                <span className="text-sm text-lime-400 md:mr-2">
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
                <span className="hidden md:inline">
                    {item.type === "pdf" ? "📄" : "🔗"}
                    </span>
                <div className="text-sm text-gray-400 md:mt-0 mt-1">
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
