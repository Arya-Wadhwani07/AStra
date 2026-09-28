"use client";
import { useEffect, useRef, useState } from "react";
import {
  createParticleRenderer,
  createParticleGeometry,
  type ParticleVariant,
} from "../lib/particle-scene";
import { Icon } from "./icons";
import { scrollProgress, easeSculpture } from "../lib/scroll-sculpture";

/** Motion is decorative; the page and its calls to action never depend on WebGL. */
export function ParticleHero({
  variant = "hero",
  continuous = false,
}: {
  variant?: ParticleVariant;
  continuous?: boolean;
}) {
  const pauseKey = `astra-paused:particle-${continuous ? "journey" : variant}`;
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sync = useRef<() => void>(() => {});
  const paused = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    if (!canvas.current || !box.current) return;
    const surface = canvas.current;
    const container = box.current;
    const landing = container.closest(".landing");
    let target = 0,
      progress = 0;
    const pointer = [0.5, 0.5, 0],
      desiredPointer = [0.5, 0.5, 0];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    let renderer: ReturnType<typeof createParticleRenderer> | undefined;
    let frame = 0,
      previous = 0,
      elapsed = 0;
    let visible = false,
      broken = false;
    try {
      paused.current = sessionStorage.getItem(pauseKey) === "1";
    } catch {}
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      setPlaying(false);
    };
    const draw = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
      elapsed += dt;
      previous = now;
      progress = easeSculpture(progress, target, dt);
      for (let i = 0; i < 3; i++)
        pointer[i] = easeSculpture(pointer[i], desiredPointer[i], dt);
      renderer?.draw(elapsed, continuous ? progress : -1, pointer);
      container.dataset.progress = progress.toFixed(4);
      container.dataset.pointer = pointer[2].toFixed(3);
      frame = requestAnimationFrame(draw);
    };
    const scroll = () => {
      if (!continuous || !landing) return;
      const bounds = landing.getBoundingClientRect();
      target = scrollProgress(bounds.top, bounds.height, innerHeight);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || motion.matches || paused.current)
        return;
      const bounds = surface.getBoundingClientRect();
      desiredPointer[0] =
        (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      desiredPointer[1] =
        (event.clientY - bounds.top) / Math.max(bounds.height, 1);
      desiredPointer[2] = (event.target as Element)?.closest?.(
        "a, button, input, select, textarea",
      )
        ? 0
        : 1;
    };
    const leave = () => {
      desiredPointer[2] = 0;
    };
    const update = () => {
      const allowed = !connection?.saveData && !broken;
      setMotionAllowed(!motion.matches && allowed);
      if (!allowed) {
        stop();
        renderer?.dispose();
        renderer = undefined;
        setReady(false);
        return;
      }
      if (visible && !renderer) {
        try {
          renderer = createParticleRenderer(surface, variant);
          renderer.resize();
          renderer.draw(elapsed, continuous ? progress : -1, pointer);
          setReady(true);
        } catch {
          broken = true;
          setReady(false);
          return;
        }
      }
      if (
        renderer &&
        visible &&
        !document.hidden &&
        !paused.current &&
        !motion.matches
      ) {
        if (!frame) {
          frame = requestAnimationFrame(draw);
          setPlaying(true);
        }
      } else stop();
    };
    sync.current = update;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = continuous
          ? entry.isIntersecting
          : entry.intersectionRatio >= 0.15;
        update();
      },
      { threshold: continuous ? [0] : [0, 0.15] },
    );
    observer.observe(continuous && landing ? landing : box.current);
    const resize = new ResizeObserver(() => {
      renderer?.resize();
      scroll();
      renderer?.draw(elapsed, continuous ? progress : -1, pointer);
    });
    resize.observe(box.current);
    if (landing) resize.observe(landing);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    const lost = (event: Event) => {
      event.preventDefault();
      broken = true;
      update();
    };
    const restored = () => {
      broken = false;
      update();
    };
    surface.addEventListener("webglcontextlost", lost);
    surface.addEventListener("webglcontextrestored", restored);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(frame);
      renderer?.dispose();
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      sync.current = () => {};
    };
  }, [variant, continuous, pauseKey]);
  function toggle() {
    paused.current = !paused.current;
    try {
      sessionStorage.setItem(pauseKey, paused.current ? "1" : "0");
    } catch {}
    sync.current();
  }
  const control = ready && motionAllowed && (
    <button
      className={`as-motion__ctl${continuous ? " landing-motion-control" : ""}`}
      type="button"
      onClick={toggle}
      aria-label={
        playing ? "Pause background animation" : "Play background animation"
      }
      aria-pressed={!playing}
    >
      <Icon name={playing ? "pause" : "play"} weight="fill" />
    </button>
  );
  return (
    <>
      <div
        ref={box}
        className={`as-motion ${continuous ? "landing-sculpture" : "stage-film"} particle-hero${ready ? " particle-hero--ready" : ""}`}
        data-sculpture={continuous ? "journey" : variant}
      >
        <svg
          className="particle-hero__poster particle-hero__still"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          {Array.from({ length: 480 }, (_, i) => {
            const data = stills[variant];
            const offset = i * 8;
            const x = data[offset],
              y = data[offset + 1],
              z = data[offset + 2];
            return (
              <circle
                key={i}
                cx={300 + (x * 0.86 + z * 0.5) * 110}
                cy={280 - (y * 0.94 - z * 0.34) * 110}
                r={1.2 + data[offset + 6]}
                fill={i % 31 === 0 ? "#ff795d" : "#71b7ff"}
                opacity={0.7}
              />
            );
          })}
        </svg>
        <div className="particle-hero__halo" aria-hidden="true" />
        <canvas
          ref={canvas}
          className="particle-hero__canvas"
          aria-hidden="true"
        />
        <span className="as-sr">
          Decorative blue sculpture flowing from a prism into intertwined
          strands and shared orbits as you scroll. Pointer movement gently parts
          the particles.
        </span>
        {!continuous && control}
      </div>
      {continuous && control}
    </>
  );
}

const stills = Object.fromEntries(
  ["hero", "collab", "loyalty"].map((variant) => [
    variant,
    createParticleGeometry(480, variant as ParticleVariant),
  ]),
) as Record<ParticleVariant, Float32Array>;
