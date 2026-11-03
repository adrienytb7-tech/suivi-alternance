"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  MessageSquare,
  XCircle,
  Award,
  TrendingUp,
  BellRing,
  Plus,
  ArrowRight,
  Send,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { useApplications } from "@/context/applications-context";
import { AlternanceApplication } from "@/types/application";
import { daysSince, formatShortDateFr } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityStars } from "@/components/ui/priority-stars";
import { WeeklyEvolutionChart } from "@/components/dashboard/weekly-chart";
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart";
import { ApplicationFormModal } from "@/components/applications/application-form-modal";
import { ApplicationDetailModal } from "@/components/applications/application-detail-modal";
import { exportApplicationsToXLSX } from "@/lib/export-import";

export default function DashboardPage() {
  const { applications, allContacts, markAsFollowedUp } = useApplications();
  const [selectedApp, setSelectedApp] = useState<AlternanceApplication | null>(
    null
  );
  const [editingApp, setEditingApp] = useState<AlternanceApplication | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const stats = useMemo(() => {
    const total = applications.length;
    const toApply = applications.filter(
      (a) => a.status === "A_POSTULER"
    ).length;
    const waiting = applications.filter(
      (a) => a.status === "ENVOYEE" || a.status === "RELANCEE"
    ).length;
    const interviews = applications.filter(
      (a) => a.status === "ENTRETIEN"
    ).length;
    const rejected = applications.filter((a) => a.status === "REFUSEE").length;
    const offers = applications.filter(
      (a) => a.status === "OFFRE" || a.status === "ACCEPTEE"
    ).length;

    const sentTotal = total - toApply;
    const answered = interviews + rejected + offers;
    const responseRate =
      sentTotal > 0 ? Math.round((answered / sentTotal) * 100) : 0;

    return {
      total,
      toApply,
      waiting,
      interviews,
      rejected,
      offers,
      sentTotal,
      responseRate,
    };
  }, [applications]);

  // Candidatures envoyées sans réponse depuis > 10 jours
  const followUpCandidates = useMemo(() => {
    return applications
      .filter(
        (app) =>
          app.status === "ENVOYEE" && daysSince(app.appliedDate) >= 10
      )
      .sort(
        (a, b) =>
          b.priority - a.priority ||
          daysSince(a.appliedDate) - daysSince(b.appliedDate)
      );
  }, [applications]);

  const currentSelected = useMemo(() => {
    if (!selectedApp) return null;
    return applications.find((a) => a.id === selectedApp.id) || null;
  }, [applications, selectedApp]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tableau de bord — Recherche d&apos;Alternance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Adrien Bechu • Administrateur Systèmes, Réseaux, Cloud &
            Cybersécurité (Nantes / Angers)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportApplicationsToXLSX(applications, allContacts)
            }
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 text-sm font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Exporter (.xlsx)
          </button>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Réseau ({allContacts.length})
          </Link>
          <button
            onClick={() => {
              setEditingApp(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-teal-500 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle candidature
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total candidatures</span>
            <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            dont {stats.toApply} à postuler
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">En attente</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.waiting}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Envoyées ou relancées
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Entretiens</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.interviews}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Échanges RH / Techniques
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Offres reçues</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.offers}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Propositions d&apos;alternance
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Refus</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.rejected}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Retours négatifs reçus
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Taux de réponse</span>
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
            {stats.responseRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur {stats.sentTotal} candidatures transmises
          </p>
        </div>
      </div>

      {/* Main Grid : Weekly Evolution Chart + Status/City Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Graphique d'évolution hebdomadaire */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Évolution hebdomadaire des candidatures
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Volume des démarches et relances enregistrées par semaine
              </p>
            </div>
          </div>
          <WeeklyEvolutionChart applications={applications} />
        </div>

        {/* Graphique de répartition (Donut Statuts / Barres Villes) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <StatusDistributionChart applications={applications} />
        </div>
      </div>

      {/* Relances à effectuer (> 10 jours sans réponse) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Relances à effectuer ({followUpCandidates.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidatures envoyées sans réponse depuis plus de 10 jours (par
                ordre de priorité et de récence)
              </p>
            </div>
          </div>
        </div>

        {followUpCandidates.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Aucune candidature en attente de relance (&gt; 10 jours).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {followUpCandidates.slice(0, 12).map((app) => {
              const days = daysSince(app.appliedDate);
              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-slate-50/40 dark:bg-slate-800/20"
                >
                  <div
                    className="cursor-pointer space-y-1.5"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {app.company}
                      </h3>
                      <PriorityStars priority={app.priority} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {app.role}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.city}
                      </span>
                      <span>
                        • Envoyée le {formatShortDateFr(app.appliedDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      Sans réponse depuis {days} j
                    </span>
                    <div className="flex items-center gap-2">
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Ouvrir le lien"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => markAsFollowedUp(app.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-teal-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Send className="w-3 h-3" />
                        Relancer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dernières démarches */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Dernières démarches enregistrées
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cliquez sur une ligne pour ouvrir la fiche détaillée et la
              timeline
            </p>
          </div>
          <Link
            href="/candidatures"
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            Voir les {applications.length} candidatures
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4">Entreprise</th>
                <th className="py-2.5 px-4">Poste visé</th>
                <th className="py-2.5 px-4">Ville</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4">Dernier contact</th>
                <th className="py-2.5 pl-4 text-right">Priorité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {applications.slice(0, 8).map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                    {app.company}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {app.role}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {app.city}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatShortDateFr(app.appliedDate)}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <PriorityStars priority={app.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ApplicationDetailModal
        application={currentSelected}
        onClose={() => setSelectedApp(null)}
        onEdit={(app) => {
          setSelectedApp(null);
          setEditingApp(app);
          setIsFormOpen(true);
        }}
      />

      <ApplicationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingApp(null);
        }}
        initialData={editingApp}
      />
    </div>
  );
}
