'use client';

import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

function isMobile() {
  return typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);
}


type Pin = {
  id: string;
  xRatio: number;
  yRatio: number;
  video: string;
};

const pins: Pin[] = [
  { id: 'pin1', xRatio: 0.3, yRatio: 0.38, video: '/videos/dandong.mp4' },
  { id: 'pin2', xRatio: 0.65, yRatio: 0.25, video: '/videos/paju.mp4' },
  { id: 'pin3', xRatio: 0.75, yRatio: 0.7, video: '/videos/gold.mp4' },
  { id: 'pin4', xRatio: 0.14, yRatio: 0.83, video: '/videos/tumen.mp4' },
];

export default function CanvasImageGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
  const [radius, setRadius] = useState(400); // 초기 반경

  const [drawState, setDrawState] = useState({
    offsetX: 0,
    offsetY: 0,
    drawWidth: 0,
    drawHeight: 0,
  });

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = '/images/home-map.png';
    image.onload = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = vw;
      canvas.height = vh;

      const imgRatio = image.width / image.height;
      const winRatio = vw / vh;

      let drawWidth = vw;
      let drawHeight = vh;
      let offsetX = 0;
      let offsetY = 0;

      if (winRatio > imgRatio) {
        drawHeight = vw / imgRatio;
        offsetY = (vh - drawHeight) / 2;
      } else {
        drawWidth = vh * imgRatio;
        offsetX = (vw - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      const rows = 5;
      const cols = 8;
      const cellWidth = drawWidth / cols;
      const cellHeight = drawHeight / rows;

      ctx.strokeStyle = '#92F90E';
      ctx.lineWidth = 1;

      for (let r = 0; r <= rows; r++) {
        const y = offsetY + r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + drawWidth, y);
        ctx.stroke();
      }
      for (let c = 0; c <= cols; c++) {
        const x = offsetX + c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + drawHeight);
        ctx.stroke();
      }

      setDrawState({ offsetX, offsetY, drawWidth, drawHeight });
    };
  };
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  useEffect(() => {
    drawCanvas();
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, []);

  
  // 마스크 마우스 추적 및 휠 반경 조절
  useEffect(() => {
    if (isMobileDevice) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setRadius((prev) => {
        const next = prev - e.deltaY * 0.1;
        return Math.max(80, Math.min(500, next)); // 최소 50, 최대 400
      });
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      // 🔽 페더 효과 추가
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
      gradient.addColorStop(0.0, 'rgba(0, 0, 0, 1)');  // 중심 완전 삭제
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');  // 빠르게 페이드아웃
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [mouse, radius, isMobileDevice]);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModalSrc(null);
      setIsClosing(false);
    }, 300);
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />

      <div ref={containerRef} className="fixed top-0 left-0 w-full h-full z-10 pointer-events-none">
        {pins.map((pin) => {
          const { offsetX, offsetY, drawWidth, drawHeight } = drawState;
          const left = offsetX + pin.xRatio * drawWidth;
          const top = offsetY + pin.yRatio * drawHeight;
          return (
            <div
              key={pin.id}
              className="absolute w-10 h-10 cursor-pointer pointer-events-auto"
              style={{ left, top, transform: 'translate(-50%, -100%)' }}
              onClick={() => setModalSrc(pin.video)}
            >
              <NextImage src="/images/pin.png" alt="pin" width={40} height={40} className="twinkle" />
            </div>
          );
        })}

        {/* WORKS 버튼 */}
        {(() => {
          const { offsetX, offsetY, drawWidth, drawHeight } = drawState;
          const cellWidth = drawWidth / 8;
          const cellHeight = drawHeight / 5;
          const left = offsetX + 3 * cellWidth;
          const top = offsetY + 2 * cellHeight;

          return (
            <div
              className="absolute z-20 pointer-events-auto cursor-pointer bg-[#92F90E]
                         text-white font-bold flex items-center justify-center"
              style={{
                left,
                top,
                width: cellWidth * 2,
                height: isMobile() ? cellHeight * 2 : cellHeight * 1,
              }}
              onClick={() => router.push('/diagram')}
            >
              <span className="text-4xl">WORKS →</span>
            </div>
          );
        })()}
      </div>

          {!isMobileDevice && (
        <canvas
          ref={maskCanvasRef}
          className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
        />
      )}

      {modalSrc && (
        <div
          className={`fixed inset-0 z-50 flex justify-center items-center 
                      bg-[rgba(0,0,0,0.5)] backdrop-blur-sm transition-opacity duration-300 
                      ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={closeModal}
        >
          <div
            className={`relative z-60 transition-transform duration-300 
                        ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <video src={modalSrc} controls autoPlay className="w-[80vw] max-w-[900px] rounded shadow-lg" />
            <button className="absolute top-4 right-4 text-white text-3xl" onClick={closeModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
