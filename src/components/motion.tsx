"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
export function MotionLoop({
  src,
  webm,
  poster,
  label,
  className = "",
  still = false,
}: {
  src: string;
  webm?: string;
  poster: string;
  label: string;
  className?: string;
  still?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const paused = useRef(false);
  const visible = useRef(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setAllowed(
        !still &&
          !query.matches &&
          !(navigator as Navigator & { connection?: { saveData: boolean } })
            .connection?.saveData,
      );
    update();
    query.addEventListener("change", update);
    try {
      paused.current = sessionStorage.getItem("astra-paused:" + src) === "1";
    } catch {}
    return () => query.removeEventListener("change", update);
  }, [still, src]);
  useEffect(() => {
    if (!box.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        visible.current = entries[0].intersectionRatio >= 0.15;
        if (entries[0].isIntersecting) setNear(true);
        if (visible.current && !document.hidden && !paused.current)
          video.current?.play().catch(() => setPlaying(false));
        else video.current?.pause();
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const sync = () => {
      if (video.current) {
        if (visible.current && !document.hidden && !paused.current && allowed)
          video.current.play().catch(() => setPlaying(false));
        else video.current.pause();
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [near, allowed]);
  function toggle() {
    // A rejected autoplay attempt must still permit a manual play attempt.
    paused.current = playing;
    try {
      sessionStorage.setItem("astra-paused:" + src, paused.current ? "1" : "0");
    } catch {}
    if (paused.current) video.current?.pause();
    else video.current?.play().catch(() => setPlaying(false));
  }
  const show = near && allowed && !failed;
  return (
    <div ref={box} className={`as-motion ${className}`}>
      <img
        className="as-motion__media"
        src={poster}
        alt=""
        aria-hidden="true"
      />
      {show && (
        <video
          ref={video}
          className="as-motion__media"
          muted
          playsInline
          loop
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          onError={() => setFailed(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {webm && <source src={webm} type="video/webm" />}
          <source src={src} type="video/mp4" />
        </video>
      )}
      <span className="as-sr">{label}</span>
      {show && (
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
export function Mascot() {
  return (
    <div className="mascot">
      <MotionLoop
        src="/media/mascot/astra-mascot-wave-1x1.mp4"
        webm="/media/mascot/astra-mascot-wave-1x1.webm"
        poster="/media/mascot/astra-mascot-poster-1x1.jpg"
        label="Animation: the AStra pixel robot mascot waves and types ASTRA on its visor."
      />
    </div>
  );
}
