"use client";

import { useRef } from "react";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (url: string = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    }
    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
  };

  return { play };
}
