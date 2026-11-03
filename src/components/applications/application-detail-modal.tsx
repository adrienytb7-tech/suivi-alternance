"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  FileCheck,
  Send,
  Edit3,
  Trash2,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import {
  AlternanceApplication,
  ApplicationStatus,
  STATUS_CONFIG,
} from "@/types/application";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityStars } from "@/components/ui/priority-stars";
import { formatDateFr, daysSince } from "@/lib/utils";
import { useApplications } from "@/context/applications-context";

interface ApplicationDetailModalProps {
  application: AlternanceApplication | null;
  onClose: () => void;
  onEdit: (app: AlternanceApplication) => void;
}

export function ApplicationDetailModal({
  application,
  onClose,
  onEdit,
}: ApplicationDetailModalProps) {
  const {
    updateStatus,
    markAsFollowedUp,
    addNoteToTimeline,
    deleteApplication,
  } = useApplications();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  if (!application) return null;

  const elapsedDays = daysSince(application.appliedDate);

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    await addNoteToTimeline(
      application.id,
      newNoteTitle.trim(),
      newNoteContent.trim() || undefined,
      "note"
    );
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Supprimer définitivement la candidature chez ${application.company} ?`
      )
    ) {
      await deleteApplication(application.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Bar */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={application.status} />
              <PriorityStars priority={application.priority} size="md" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {application.sector}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {application.company}
            </h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {application.role}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(application)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Status Switcher & Follow-up Action */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Changer rapidement le statut
              </span>
              {application.status === "ENVOYEE" && (
                <button
                  onClick={() => markAsFollowedUp(application.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Marquer comme relancée aujourd&apos;hui
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((st) => {
                const active = application.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => updateStatus(application.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "ring-2 ring-slate-900 dark:ring-teal-500 " +
                          STATUS_CONFIG[st].badgeClass
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Informations clés
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{application.city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {application.contractType} •{" "}
                  {application.rhythm || "Rythme standard"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Send className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Canal : {application.channelDetail || application.source}
                </span>
              </div>
              {application.jobUrl && (
                <div className="pt-1">
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ouvrir l&apos;offre / le site de l&apos;entreprise
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dates & Contact
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Dernier contact :{" "}
                  <strong>{formatDateFr(application.appliedDate)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Il y a {elapsedDays} jour(s)</span>
              </div>
              {application.contact?.name && (
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Contact : {application.contact.name}
                </div>
              )}
              {application.contact?.email && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${application.contact.email}`}
                    className="text-teal-600 dark:text-teal-400 hover:underline break-all"
                  >
                    {application.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Documents envoyés */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Documents transmis
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                <FileCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {application.documents?.cvVersion ||
                  "CV_Adrien_Bechu_SysReseaux_Cyber_2026.pdf"}
              </span>
              {application.documents?.coverLetter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Lettre de motivation personnalisée
                </span>
              )}
            </div>
          </div>

          {/* Notes globales */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Notes & Synthèse des démarches
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {application.notes || "Aucune note enregistrée."}
            </p>
          </div>

          {/* Timeline Historique */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Historique des échanges & Timeline
            </div>

            {/* Formulaire d'ajout d'événement timeline */}
            <form
              onSubmit={handleAddTimelineNote}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
            >
              <input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Ajouter une étape (ex: Appel téléphonique RH, Relance LinkedIn...)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center gap-2">
                <input
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Détails ou compte-rendu (optionnel)..."
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-teal-600 text-white text-xs font-medium hover:opacity-90"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
            </form>

            {/* Liste timeline */}
            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {application.timeline.map((ev) => (
                <div key={ev.id} className="relative">
                  <span className="absolute -left-[15px] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400 ring-4 ring-white dark:ring-slate-900" />
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {ev.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateFr(ev.date)}
                      </span>
                    </div>
                    {ev.content && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {ev.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
