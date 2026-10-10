"use client";

import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  initialSplit?: number;
  className?: string;
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Drag-to-compare: the customer's front photo on the left, the preview on the right. */
export function BeforeAfter({ beforeSrc, afterSrc, initialSplit = 50, className }: Props) {
  const [split, setSplit] = useState(clamp(initialSplit));
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function moveTo(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
    if (step !== undefined) setSplit((s) => clamp(s + step));
    else if (e.key === "Home") setSplit(0);
    else if (e.key === "End") setSplit(100);
    else return;
    e.preventDefault();
  }

  return (
    <div
      ref={frame}
      className={cn(
        "relative aspect-[2/3] w-full touch-pan-y overflow-hidden rounded-xl bg-chart-5 shadow-md select-none",
        className,
      )}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Image src={beforeSrc} alt="Your photo before the cut" fill sizes="430px" unoptimized draggable={false} className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <Image src={afterSrc} alt="Preview of the new cut" fill sizes="430px" unoptimized draggable={false} className="object-cover" />
      </div>

      <span className="type-label absolute top-3 left-3 rounded-sm bg-card px-2 py-1 text-foreground">Before</span>
      <span className="type-label absolute top-3 right-3 rounded-sm bg-card px-2 py-1 text-foreground">Preview</span>

      <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-card" style={{ left: `${split}%` }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare before and preview"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(split)}
          aria-valuetext={`${Math.round(100 - split)}% preview showing`}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 left-1/2 flex size-11 -translate-1/2 cursor-ew-resize items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-card text-foreground shadow-md">
            <ArrowLeftRight className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
