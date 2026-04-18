"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExhibitionData {
  id: string;
  title_en: string;
  title_ko: string;
  year: string;
  date_en: string;
  date_ko: string;
  venue_en: string;
  venue_ko: string;
  city_en: string;
  city_ko: string;
  country_en: string;
  country_ko: string;
  description_en: string;
  description_ko: string;
  participatingWorks: string[];
  images: string[];
}

export default function ExhibitionPanel({
  id,
  onClose,
  zIndex = 50,
}: {
  id: string;
  onClose: () => void;
  zIndex?: number;
}) {
  const router = useRouter();
  const [data, setData] = useState<ExhibitionData | null>(null);
  const [lang, setLang] = useState<"en" | "ko">("en");

  useEffect(() => {
    fetch("/data/exhibitions.json")
      .then((r) => r.json())
      .then((list: ExhibitionData[]) => {
        const item = list.find((e) => e.id === id);
        setData(item || null);
      });
  }, [id]);

  return (
    <>
      <div
        style={{ zIndex }}
        className="fixed left-0 top-0 w-full h-[calc(100vh-40px)] bg-black/70"
        onClick={onClose}
        aria-label="Close exhibition panel"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
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
          style={{ cursor: "pointer" }}
          aria-label="Close"
        >
          x
        </button>

        {!data ? (
          <div className="text-white text-center py-20">Loading...</div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {data.title_en}
            </h1>
            {data.title_ko && data.title_ko !== data.title_en && (
              <h2 className="text-2xl font-bold mb-4 text-white/80">
                {data.title_ko}
              </h2>
            )}

            <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-400">
              <span>{lang === "en" ? data.date_en : data.date_ko}</span>
              <span>|</span>
              <span>{lang === "en" ? data.venue_en : data.venue_ko}</span>
              <span>|</span>
              <span>
                {lang === "en"
                  ? `${data.city_en}, ${data.country_en}`
                  : `${data.city_ko}, ${data.country_ko}`}
              </span>
            </div>

            {/* 언어 전환 */}
            {data.description_en && data.description_ko && (
              <div className="flex gap-4 mb-4">
                <span
                  onClick={() => setLang("en")}
                  className={`cursor-pointer text-sm ${
                    lang === "en"
                      ? "text-white font-bold underline"
                      : "text-gray-500"
                  }`}
                >
                  English
                </span>
                <span
                  onClick={() => setLang("ko")}
                  className={`cursor-pointer text-sm ${
                    lang === "ko"
                      ? "text-white font-bold underline"
                      : "text-gray-500"
                  }`}
                >
                  한국어
                </span>
              </div>
            )}

            {(data.description_en || data.description_ko) && (
              <p className="text-gray-300 leading-relaxed mb-8">
                {lang === "en" ? data.description_en : data.description_ko}
              </p>
            )}

            {/* 이미지 */}
            {data.images.length > 0 && (
              <div className="space-y-4 mb-8">
                {data.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${data.title_en} - ${i + 1}`}
                    className="w-full rounded"
                  />
                ))}
              </div>
            )}

            {/* 참여 작품 */}
            {data.participatingWorks.length > 0 && (
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Participating Works
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.participatingWorks.map((pid) => (
                    <button
                      key={pid}
                      onClick={() => {
                        onClose();
                        router.push(`/projects/${pid}`);
                      }}
                      className="text-[#C084FC] hover:underline text-sm cursor-pointer"
                    >
                      {pid} →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
