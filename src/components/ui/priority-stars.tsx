"use client";

import React from "react";
import { Star } from "lucide-react";
import { PriorityLevel } from "@/types/application";
import { cn } from "@/lib/utils";

interface PriorityStarsProps {
  priority: PriorityLevel;
  onChange?: (value: PriorityLevel) => void;
  size?: "sm" | "md";
}

export function PriorityStars({
  priority,
  onChange,
  size = "sm",
}: PriorityStarsProps) {
  const stars: PriorityLevel[] = [1, 2, 3];
  const labels: Record<PriorityLevel, string> = {
    1: "Normale",
    2: "Moyenne",
    3: "Haute",
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      title={`Priorité ${labels[priority]}`}
    >
      {stars.map((level) => {
        const filled = level <= priority;
        return (
          <button
            key={level}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(level)}
            className={cn(
              "transition-transform",
              onChange
                ? "cursor-pointer hover:scale-110 focus:outline-none"
                : "cursor-default"
            )}
          >
            <Star
              className={cn(
                size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 dark:text-slate-700"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
