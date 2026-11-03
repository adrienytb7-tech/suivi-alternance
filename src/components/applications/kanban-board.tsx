"use client";

import React, { useState } from "react";
import {
  AlternanceApplication,
  ApplicationStatus,
  STATUS_CONFIG,
} from "@/types/application";
import { PriorityStars } from "@/components/ui/priority-stars";
import { formatShortDateFr } from "@/lib/utils";
import { MapPin, ExternalLink, GripVertical } from "lucide-react";

interface KanbanBoardProps {
  applications: AlternanceApplication[];
  onSelect: (app: AlternanceApplication) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

const KANBAN_COLUMNS: ApplicationStatus[] = [
  "A_POSTULER",
  "ENVOYEE",
  "RELANCEE",
  "ENTRETIEN",
  "OFFRE",
  "ACCEPTEE",
  "REFUSEE",
];

export function KanbanBoard({
  applications,
  onSelect,
  onStatusChange,
}: KanbanBoardProps) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatus | null>(
    null
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent,
    status: ApplicationStatus
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedAppId;
    if (id) {
      onStatusChange(id, targetStatus);
    }
    setDraggedAppId(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[640px]">
      {KANBAN_COLUMNS.map((status) => {
        const config = STATUS_CONFIG[status];
        const items = applications.filter((a) => a.status === status);
        const isOver = dragOverCol === status;

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex-shrink-0 w-72 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 ${
              config.kanbanBorder
            } bg-slate-50/70 dark:bg-slate-900/60 flex flex-col transition-colors ${
              isOver
                ? "ring-2 ring-teal-500/60 bg-teal-50/30 dark:bg-teal-950/20"
                : ""
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {config.label}
                </h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {items.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto max-h-[68vh] flex-1">
              {items.length === 0 ? (
                <div className="h-28 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                  Glisser une carte ici
                </div>
              ) : (
                items.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onClick={() => onSelect(app)}
                    className="group cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {app.company}
                        </h4>
                      </div>
                      <PriorityStars priority={app.priority} />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">
                      {app.role}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {app.city}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>{formatShortDateFr(app.appliedDate)}</span>
                        {app.jobUrl && (
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
