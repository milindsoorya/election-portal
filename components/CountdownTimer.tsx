"use client";

import { useState, useEffect } from "react";
import { getTimeUntil } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string;
  label: string;
  isPastLabel?: string;
}

export default function CountdownTimer({ targetDate, label, isPastLabel }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntil(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-kerala-gold">{isPastLabel || "Voting Day Has Passed"}</div>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div>
      <p className="text-green-200 text-sm mb-3 font-medium">{label}</p>
      <div className="flex items-center gap-3 justify-center">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            <div className="text-center bg-white/10 backdrop-blur rounded-xl px-4 py-3 min-w-[60px] border border-white/20">
              <div className="text-3xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="text-green-200 text-xs font-medium mt-0.5">{unit.label}</div>
            </div>
            {i < units.length - 1 && (
              <span className="text-white/50 text-2xl font-light">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
