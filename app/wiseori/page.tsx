'use client';

export default function WiseoriPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center items-end space-x-16 mb-12">
          <div className="text-center">
            <div className="text-8xl font-bold text-white">僞</div>
            <div className="text-lg text-gray-400 mt-2">거짓 <span className="text-white font-bold">위</span></div>
          </div>
          <div className="text-center">
            <div className="text-8xl font-bold text-white">恕</div>
            <div className="text-lg text-gray-400 mt-2">용서할 <span className="text-white font-bold">서</span></div>
          </div>
          <div className="text-center">
            <div className="text-8xl font-bold text-white">里</div>
            <div className="text-lg text-gray-400 mt-2">마을 <span className="text-white font-bold">리</span></div>
          </div>
        </div>
        <div className="text-xl text-white">
          거짓으로 속여서 죄송합니다. 용서를 바랍니다.
        </div>
      </div>
    </div>
  );
}
