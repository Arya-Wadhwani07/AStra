"use client";
import { useEffect, useRef, useState } from "react";
import { createParticleRenderer } from "../lib/particle-scene";
import { Icon } from "./icons";

const pauseKey = "astra-paused:particle-hero";

/** Motion is decorative; the page and its calls to action never depend on WebGL. */
export function ParticleHero() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sync = useRef<() => void>(() => {});
  const paused = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!canvas.current || !box.current) return;
    const surface = canvas.current;
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
      if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      renderer?.draw(elapsed);
      frame = requestAnimationFrame(draw);
    };
    const update = () => {
      const allowed = !motion.matches && !connection?.saveData && !broken;
      if (!allowed) {
        stop();
        renderer?.dispose();
        renderer = undefined;
        setReady(false);
        return;
      }
      if (visible && !renderer) {
        try {
          renderer = createParticleRenderer(surface);
          renderer.resize();
          renderer.draw(elapsed);
          setReady(true);
        } catch {
          broken = true;
          setReady(false);
          return;
        }
      }
      if (renderer && visible && !document.hidden && !paused.current) {
        if (!frame) {
          frame = requestAnimationFrame(draw);
          setPlaying(true);
        }
      } else stop();
    };
    sync.current = update;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.15;
        update();
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(box.current);
    const resize = new ResizeObserver(() => {
      renderer?.resize();
      renderer?.draw(elapsed);
    });
    resize.observe(box.current);
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
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      sync.current = () => {};
    };
  }, []);
  function toggle() {
    paused.current = !paused.current;
    try {
      sessionStorage.setItem(pauseKey, paused.current ? "1" : "0");
    } catch {}
    sync.current();
  }
  return (
    <div
      ref={box}
      className={`as-motion stage-film particle-hero${ready ? " particle-hero--ready" : ""}`}
    >
      <img
        className="as-motion__media particle-hero__poster"
        src="/media/motion/astra-hero-poster-16x9.jpg"
        alt=""
        aria-hidden="true"
      />
      <div className="particle-hero__halo" aria-hidden="true" />
      <canvas
        ref={canvas}
        className="particle-hero__canvas"
        aria-hidden="true"
      />
      <span className="as-sr">
        Decorative blue particle sculpture rotating between a prism and
        intertwined strands above luminous floor rings.
      </span>
      {ready && (
        <button
          className="as-motion__ctl"
          type="button"
          onClick={toggle}
          aria-label={
            playing ? "Pause background animation" : "Play background animation"
          }
          aria-pressed={!playing}
        >
          <Icon name={playing ? "pause" : "play"} weight="fill" />
        </button>
      )}
    </div>
  );
}
