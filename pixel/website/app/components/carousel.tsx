"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SLIDE_MS = 9000;

export type Demo = {
  label: string;
  media: { kind: "video"; src: string; poster?: string } | { kind: "image"; src: string; alt: string };
  caption: ReactNode;
};

export default function Carousel({ demos }: { demos: Demo[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  function show(index: number) {
    setCurrent((index + demos.length) % demos.length);
    setCycle((n) => n + 1);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videos.current[current];
    if (video) video.currentTime = 0;
  }, [current, cycle]);

  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (visible && i === current) video.play().catch(() => {});
      else video.pause();
    });
  }, [current, cycle, visible]);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => show(current + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [current, cycle, paused]);

  return (
    <div
      ref={root}
      className={paused ? "carousel paused" : "carousel"}
      style={{ "--slide-ms": `${SLIDE_MS}ms` } as React.CSSProperties}
    >
      <div className="tabs">
        {demos.map((demo, i) => (
          <button
            key={demo.label}
            data-slide={i}
            className={i === current ? "on" : undefined}
            onClick={() => {
              setPaused(true);
              show(i);
            }}
          >
            {demo.label}
          </button>
        ))}
      </div>
      <div className="stage">
        <div className="slides">
          {demos.map((demo, i) => (
            <div key={demo.label} className={i === current ? "slide on" : "slide"}>
              {demo.media.kind === "video" ? (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  src={demo.media.src}
                  poster={demo.media.poster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={demo.media.src} alt={demo.media.alt} />
              )}
            </div>
          ))}
        </div>
        <div className="progress">
          <i key={cycle} />
        </div>
      </div>
      <div className="captions">
        {demos.map((demo, i) => (
          <p key={demo.label} className={i === current ? "on" : undefined}>
            {demo.caption}
          </p>
        ))}
      </div>
    </div>
  );
}
