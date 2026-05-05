"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

const welcomeMessages = [
  "Time to crush your goals, {name}.",
  "Welcome back. Let's make today count.",
  "Ready for a productive session, {name}?",
  "Keep moving forward. You've got this.",
  "Focus on the process, results will follow.",
  "Small steps lead to big changes.",
  "Your potential is limitless.",
  "Consistency is the key to success.",
  "Be the best version of yourself today.",
  "Success is the sum of small efforts.",
  "Make today so awesome yesterday gets jealous.",
  "Believe in yourself, {name}.",
  "The only bad workout is the one that didn't happen.",
  "Fuel your body, feed your mind.",
  "Stay hungry, stay foolish.",
  "The secret of getting ahead is getting started.",
  "Don't stop until you're proud.",
  "Your future self will thank you.",
  "Great things never come from comfort zones.",
  "Dream big. Work hard. Stay focused."
];

export default function AlternatingWelcome() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * welcomeMessages.length);
    const firstName = user?.displayName?.split(" ")[0] || "there";
    setMessage(welcomeMessages[randomIdx].replace("{name}", firstName));
  }, [user]);

  return (
    <div className="space-y-2 animate-fade-in">
      <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
        {message}
      </h2>
      <p className="text-slate-400 font-medium text-lg">
        Here's a quick look at your progress today.
      </p>
    </div>
  );
}
