"use client";

import { useEffect, useRef } from "react";

const TRIAD_CSS_PX = 6;
const SCALE = 2;
const TRIAD = TRIAD_CSS_PX / SCALE;
const PER_CLUSTER = 14;
const CLUSTERS = 7;
const STRAYS = 45;
const FALLOFF_FRACTION = 0.5;
const TEXT_PAD_CSS_PX = 8;
const KEEP_ON_TEXT = 0.08;
const STRAY_TRIES = 6;
const FPS = 12;
const TRAIL_STEP_CSS_PX = 24;
const TRAIL_CHANCE = 0.5;
const TRAIL_RADIUS = 2;
const TRAIL_MIN_MS = 150;
const TRAIL_MAX_MS = 400;
const TRAIL_ALPHA = 0.14;
const TRAIL_MAX = 10;
const TRAIL_AVOID = "[data-component], header, #wordmark, .lede, a, button";
const CHANNEL_SETS = [[0], [1], [2], [0, 1], [1, 2], [0, 2], [0, 1, 2]];

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Pixel = { x: number; y: number; channels: number[]; phase: number; speed: number };
type TrailPixel = { x: number; y: number; channels: number[]; until: number };

function startBackground(canvas: HTMLCanvasElement, trailCanvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const trailCtx = trailCanvas.getContext("2d")!;
  let trail: TrailPixel[] = [];
  let lastSpawn: { x: number; y: number } | null = null;
  let cols = 0;
  let rows = 0;
  let tints: string[] = [];
  let pixels: Pixel[] = [];
  let keepOut: Rect[] = [];
  let components: Rect[] = [];

  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const gaussian = () => (random() + random() + random() - 1.5) / 1.5;

  function readTints() {
    const css = getComputedStyle(document.documentElement);
    tints = ["--r", "--g", "--b"].map((name) => css.getPropertyValue(name).trim());
  }

  function measureText() {
    const origin = canvas.getBoundingClientRect();
    const toTriads = (rect: DOMRect): Rect => ({
      x0: (rect.left - origin.left - TEXT_PAD_CSS_PX) / TRIAD_CSS_PX,
      y0: (rect.top - origin.top - TEXT_PAD_CSS_PX) / TRIAD_CSS_PX,
      x1: (rect.right - origin.left + TEXT_PAD_CSS_PX) / TRIAD_CSS_PX,
      y1: (rect.bottom - origin.top + TEXT_PAD_CSS_PX) / TRIAD_CSS_PX,
    });
    const rects: Rect[] = [];
    const push = (rect: DOMRect) => {
      if (rect.width && rect.height) rects.push(toTriads(rect));
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const range = document.createRange();
    while (walker.nextNode()) {
      range.selectNodeContents(walker.currentNode);
      for (const rect of range.getClientRects()) push(rect);
    }
    const wordmark = document.getElementById("wordmark");
    if (wordmark) push(wordmark.getBoundingClientRect());
    keepOut = rects;
    components = [...document.querySelectorAll("[data-component]")].map((el) => toTriads(el.getBoundingClientRect()));
  }

  const inside = (rects: Rect[], x: number, y: number) =>
    rects.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);
  const onText = (x: number, y: number) => inside(keepOut, x, y);
  const onComponent = (x: number, y: number) => inside(components, x, y);

  function place() {
    seed = 7;
    pixels = [];
    const add = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= cols || y >= rows || onComponent(x, y)) return;
      if (onText(x, y) && random() > KEEP_ON_TEXT) return;
      pixels.push({
        x: Math.round(x),
        y: Math.round(y),
        channels: CHANNEL_SETS[Math.floor(random() * CHANNEL_SETS.length)],
        phase: random() * Math.PI * 2,
        speed: 0.07 + random() * 0.25,
      });
    };
    const falloff = rows * FALLOFF_FRACTION;
    const decay = 1 - Math.exp(-rows / falloff);
    const sampleY = () => -falloff * Math.log(1 - random() * decay);
    for (let c = CLUSTERS; c > 0; c--) {
      const cx = random() * cols;
      const cy = sampleY();
      const spread = 3 + random() * 9;
      for (let i = 0; i < PER_CLUSTER; i++) add(cx + gaussian() * spread * 1.6, cy + gaussian() * spread);
    }
    for (let i = STRAYS; i > 0; i--) {
      let x = random() * cols;
      let y = sampleY();
      for (let tries = 0; tries < STRAY_TRIES && (onText(x, y) || onComponent(x, y)); tries++) {
        x = random() * cols;
        y = sampleY();
      }
      add(x, y);
    }
  }

  function resize() {
    cols = Math.ceil(canvas.clientWidth / TRIAD_CSS_PX);
    rows = Math.ceil(canvas.clientHeight / TRIAD_CSS_PX);
    canvas.width = cols * TRIAD;
    canvas.height = rows * TRIAD;
    measureText();
    place();
  }

  function resizeTrail() {
    trailCanvas.width = Math.ceil(window.innerWidth / TRIAD_CSS_PX) * TRIAD;
    trailCanvas.height = Math.ceil(window.innerHeight / TRIAD_CSS_PX) * TRIAD;
  }

  function spawnTrail(event: PointerEvent) {
    const now = performance.now();
    if (lastSpawn && Math.hypot(event.clientX - lastSpawn.x, event.clientY - lastSpawn.y) < TRAIL_STEP_CSS_PX) return;
    lastSpawn = { x: event.clientX, y: event.clientY };
    if (Math.random() > TRAIL_CHANCE || trail.length >= TRAIL_MAX) return;
    const x = Math.floor(event.clientX / TRIAD_CSS_PX + (Math.random() * 2 - 1) * TRAIL_RADIUS);
    const y = Math.floor(event.clientY / TRIAD_CSS_PX + (Math.random() * 2 - 1) * TRAIL_RADIUS);
    const under = document.elementFromPoint((x + 0.5) * TRIAD_CSS_PX, (y + 0.5) * TRIAD_CSS_PX);
    if (!under || under.closest(TRAIL_AVOID)) return;
    trail.push({
      x,
      y,
      channels: CHANNEL_SETS[Math.floor(Math.random() * CHANNEL_SETS.length)],
      until: now + TRAIL_MIN_MS + Math.random() * (TRAIL_MAX_MS - TRAIL_MIN_MS),
    });
  }

  function drawTrail(now: number) {
    trail = trail.filter((pixel) => pixel.until > now);
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    trailCtx.globalAlpha = TRAIL_ALPHA;
    for (const pixel of trail) {
      for (const c of pixel.channels) {
        trailCtx.fillStyle = tints[c];
        trailCtx.fillRect(pixel.x * TRIAD + c, pixel.y * TRIAD, 1, TRIAD - 1);
      }
    }
  }

  function frame(now: number) {
    const t = now / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.8;
    for (const pixel of pixels) {
      if (Math.sin(t * pixel.speed + pixel.phase) < 0.35) continue;
      for (const c of pixel.channels) {
        ctx.fillStyle = tints[c];
        ctx.fillRect(pixel.x * TRIAD + c, pixel.y * TRIAD, 1, TRIAD - 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scheme = matchMedia("(prefers-color-scheme: light)");
  let last = 0;
  let raf = 0;
  let stopped = false;
  function loop(now: number) {
    if (stopped) return;
    if (!still) raf = requestAnimationFrame(loop);
    if (now - last < 1000 / FPS) return;
    last = now;
    frame(now);
    drawTrail(performance.now());
  }

  readTints();
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resizeTrail();
  window.addEventListener("resize", resizeTrail);
  if (!still) window.addEventListener("pointermove", spawnTrail, { passive: true });
  document.fonts.ready.then(() => !stopped && resize());
  scheme.addEventListener("change", readTints);
  raf = requestAnimationFrame(loop);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener("resize", resizeTrail);
    window.removeEventListener("pointermove", spawnTrail);
    scheme.removeEventListener("change", readTints);
  };
}

export default function PixelBackground() {
  const dither = useRef<HTMLCanvasElement>(null);
  const trail = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!dither.current || !trail.current) return;
    return startBackground(dither.current, trail.current);
  }, []);

  return (
    <>
      <canvas id="dither" ref={dither} aria-hidden />
      <canvas id="trail" ref={trail} aria-hidden />
    </>
  );
}
