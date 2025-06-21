// components/GridTile.tsx
'use client';

import Link from 'next/link';

type GridTileProps = {
  colSpan: number;
  rowSpan: number;
  href: string;
  label: string;
  bgColor?: string; // 선택값
};

export default function GridTile({
  colSpan,
  rowSpan,
  href,
  label,
  bgColor = 'bg-gray-500',
}: GridTileProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center text-white text-xl font-light border border-white ${bgColor} col-span-${colSpan} row-span-${rowSpan}`}
    >
      {label}
    </Link>
  );
}
