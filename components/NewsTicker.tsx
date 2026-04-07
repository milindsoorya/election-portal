"use client";

import { NEWS_ITEMS } from "@/data";

export default function NewsTicker() {
  const text = NEWS_ITEMS.join("   •   ");

  return (
    <div className="bg-kerala-dark border-b border-green-800">
      <div className="flex items-stretch">
        <div className="bg-kerala-saffron px-4 py-2 text-white font-bold text-xs flex-shrink-0 flex items-center">
          📰 LATEST
        </div>
        <div className="ticker-wrapper flex-1 py-2 bg-gray-900">
          <div className="ticker-content text-green-300 text-xs">
            {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
          </div>
        </div>
      </div>
    </div>
  );
}
