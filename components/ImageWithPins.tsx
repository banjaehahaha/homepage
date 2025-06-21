'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Pin = {
  id: string;
  xRatio: number;
  yRatio: number;
  video: string;
};

const pins: Pin[] = [
  { id: 'pin1', xRatio: 0.3, yRatio: 0.35, video: '/videos/video1.mp4' },
  { id: 'pin2', xRatio: 0.65, yRatio: 0.15, video: '/videos/video2.mp4' },
  { id: 'pin3', xRatio: 0.75, yRatio: 0.7, video: '/videos/video2.mp4' },
  { id: 'pin4', xRatio: 0.14, yRatio: 0.83, video: '/videos/video2.mp4' },
];

export default function ImageWithPins() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBox, setImageBox] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({ width: 0, height: 0, left: 0, top: 0 });

  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const rows = 5;
  const cols = 8;
  const IMAGE_RATIO = 1440 / 1024; // 실제 이미지 비율

  useEffect(() => {
    const updateImageBox = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      const containerRatio = containerWidth / containerHeight;

      let width = 0;
      let height = 0;
      let left = 0;
      let top = 0;

      if (containerRatio > IMAGE_RATIO) {
        // 좌우 여백 없이 꽉 채움 (상하 잘림)
        height = containerHeight;
        width = height * IMAGE_RATIO;
        left = (containerWidth - width) / 2;
        top = 0;
      } else {
        // 상하 여백 없이 꽉 채움 (좌우 잘림)
        width = containerWidth;
        height = width / IMAGE_RATIO;
        top = (containerHeight - height) / 2;
        left = 0;
      }

      setImageBox({ width, height, left, top });
    };

    updateImageBox();
    window.addEventListener('resize', updateImageBox);
    return () => window.removeEventListener('resize', updateImageBox);
  }, []);

  const cellWidth = imageBox.width / cols;
  const cellHeight = imageBox.height / rows;

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      {/* 배경 이미지 */}
      <img
        ref={imgRef}
        src="/images/home-map.png"
        alt="Satellite"
        className="absolute object-cover"
        style={{
          width: imageBox.width,
          height: imageBox.height,
          top: imageBox.top,
          left: imageBox.left,
        }}
      />

      {/* 핀 */}
      {pins.map((pin) => {
        const left = imageBox.left + pin.xRatio * imageBox.width;
        const top = imageBox.top + pin.yRatio * imageBox.height;
        return (
          <button
            key={pin.id}
            onClick={() => setModalSrc(pin.video)}
            className="absolute z-10"
            style={{
              left,
              top,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Image src="/images/pin.png" alt="pin" width={40} height={40} />
          </button>
        );
      })}

      {/* 그리드 */}
      {[...Array(rows * cols)].map((_, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        return (
          <div
            key={idx}
            className="absolute border border-green-500/30 z-0 pointer-events-none"
            style={{
              top: imageBox.top + row * cellHeight,
              left: imageBox.left + col * cellWidth,
              width: cellWidth,
              height: cellHeight,
            }}
          />
        );
      })}

      {/* 모달 */}
      {modalSrc && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center">
          <video src={modalSrc} controls autoPlay className="w-[80vw] max-w-[900px]" />
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setModalSrc(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
