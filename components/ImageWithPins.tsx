'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const rows = 5;
  const cols = 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !containerRef.current) return;

    const image = new Image();
    image.src = '/images/home-map.png';
    image.onload = () => {
      const draw = () => {
        const { width: containerW, height: containerH } = containerRef.current!.getBoundingClientRect();
        const imgRatio = image.width / image.height;
        const containerRatio = containerW / containerH;

        let drawW, drawH, offsetX = 0, offsetY = 0;

        if (containerRatio > imgRatio) {
          drawH = containerH;
          drawW = drawH * imgRatio;
          offsetX = (containerW - drawW) / 2;
        } else {
          drawW = containerW;
          drawH = drawW / imgRatio;
          offsetY = (containerH - drawH) / 2;
        }

        canvas.width = containerW;
        canvas.height = containerH;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, offsetX, offsetY, drawW, drawH);

        // 그리드
        ctx.strokeStyle = 'rgba(0,255,0,0.3)';
        const cellW = drawW / cols;
        const cellH = drawH / rows;
        for (let i = 0; i <= cols; i++) {
          const x = offsetX + i * cellW;
          ctx.beginPath();
          ctx.moveTo(x, offsetY);
          ctx.lineTo(x, offsetY + drawH);
          ctx.stroke();
        }
        for (let j = 0; j <= rows; j++) {
          const y = offsetY + j * cellH;
          ctx.beginPath();
          ctx.moveTo(offsetX, y);
          ctx.lineTo(offsetX + drawW, y);
          ctx.stroke();
        }

        // 핀
        pins.forEach(pin => {
          const px = offsetX + pin.xRatio * drawW;
          const py = offsetY + pin.yRatio * drawH;
          const pinImg = new Image();
          pinImg.src = '/images/pin.png';
          pinImg.onload = () => ctx.drawImage(pinImg, px - 20, py - 40, 40, 40); // center align
        });
      };

      draw();
      window.addEventListener('resize', draw);
      return () => window.removeEventListener('resize', draw);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const image = new Image();
    image.src = '/images/home-map.png';
    image.onload = () => {
      const imgRatio = image.width / image.height;
      const containerRatio = rect.width / rect.height;

      let drawW, drawH, offsetX = 0, offsetY = 0;

      if (containerRatio > imgRatio) {
        drawH = rect.height;
        drawW = drawH * imgRatio;
        offsetX = (rect.width - drawW) / 2;
      } else {
        drawW = rect.width;
        drawH = drawW / imgRatio;
        offsetY = (rect.height - drawH) / 2;
      }

      pins.forEach(pin => {
        const px = offsetX + pin.xRatio * drawW;
        const py = offsetY + pin.yRatio * drawH;
        if (Math.abs(px - x) < 25 && Math.abs(py - y) < 25) {
          setModalSrc(pin.video);
        }
      });
    };
  };

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} onClick={handleClick} />
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
