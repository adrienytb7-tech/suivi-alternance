"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Table as TableIcon,
  Columns3,
  ArrowUpDown,
  ExternalLink,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useApplications } from "@/context/applications-context";
import {
  AlternanceApplication,
  ApplicationSource,
  ApplicationStatus,
  APPLICATION_SOURCES,
  STATUS_CONFIG,
} from "@/types/application";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityStars } from "@/components/ui/priority-stars";
import { formatShortDateFr } from "@/lib/utils";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { ApplicationFormModal } from "@/components/applications/application-form-modal";
import { ApplicationDetailModal } from "@/components/applications/application-detail-modal";
import { exportApplicationsToXLSX } from "@/lib/export-import";

type SortField =
  | "company"
  | "role"
  | "status"
  | "appliedDate"
  | "city"
  | "source"
  | "priority";

function CandidaturesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applications, allContacts, updateStatus } = useApplications();

  const viewParam = searchParams.get("view");
  const [viewMode, setViewMode] = useState<"table" | "kanban">(
    viewParam === "kanban" ? "kanban" : "table"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedApp, setSelectedApp] = useState<AlternanceApplication | null>(
    null
  );
  const [editingApp, setEditingApp] = useState<AlternanceApplication | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Synchronise toujours l'onglet actif avec le paramètre URL ?view=kanban
  useEffect(() => {
    setViewMode(viewParam === "kanban" ? "kanban" : "table");
  }, [viewParam]);

  const handleSwitchView = (mode: "table" | "kanban") => {
    setViewMode(mode);
    if (mode === "kanban") {
      router.push("/candidatures?view=kanban");
    } else {
      router.push("/candidatures");
    }
  };

  const cities = useMemo(() => {
    return [
      "Nantes & Agglo",
      "Angers & Agglo",
      "Autres (Cholet, Rennes, etc.)",
    ];
  }, []);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((app) => {
      if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
      if (sourceFilter !== "ALL" && app.source !== sourceFilter) return false;

      if (cityFilter !== "ALL") {
        const c = app.city.toLowerCase();
        const isNantes =
          c.includes("nantes") ||
          c.includes("herblain") ||
          c.includes("rezé") ||
          c.includes("orvault") ||
          c.includes("carquefou") ||
          c.includes("chevrolière") ||
          c.includes("bouguenais");
        const isAngers = c.includes("angers") || c.includes("montreuil");
        if (cityFilter === "Nantes & Agglo" && !isNantes) return false;
        if (cityFilter === "Angers & Agglo" && !isAngers) return false;
        if (
          cityFilter === "Autres (Cholet, Rennes, etc.)" &&
          (isNantes || isAngers)
        )
          return false;
      }

      if (!q) return true;
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.sector.toLowerCase().includes(q) ||
        app.city.toLowerCase().includes(q) ||
        app.notes.toLowerCase().includes(q) ||
        (app.contact?.name?.toLowerCase().includes(q) ?? false) ||
        (app.contact?.email?.toLowerCase().includes(q) ?? false)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "company":
          comparison = a.company.localeCompare(b.company, "fr");
          break;
        case "role":
          comparison = a.role.localeCompare(b.role, "fr");
          break;
        case "city":
          comparison = a.city.localeCompare(b.city, "fr");
          break;
        case "source":
          comparison = a.source.localeCompare(b.source, "fr");
          break;
        case "status":
          comparison =
            STATUS_CONFIG[a.status].order - STATUS_CONFIG[b.status].order;
          break;
        case "priority":
          comparison = a.priority - b.priority;
          break;
        case "appliedDate":
        default:
          comparison = a.appliedDate.localeCompare(b.appliedDate);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [
    applications,
    searchQuery,
    statusFilter,
    cityFilter,
    sourceFilter,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCityFilter("ALL");
    setSourceFilter("ALL");
  };

  const currentSelected = useMemo(() => {
    if (!selectedApp) return null;
    return applications.find((a) => a.id === selectedApp.id) || null;
  }, [applications, selectedApp]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {viewMode === "kanban"
              ? `Vue Kanban (${filteredAndSorted.length})`
              : `Mes Candidatures (${filteredAndSorted.length} / ${applications.length})`}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {viewMode === "kanban"
              ? "Glissez-déposez vos cartes d'une colonne à l'autre pour mettre à jour le statut"
              : "Filtrez, triez et consultez le détail de chaque candidature"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Table / Kanban */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => handleSwitchView("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-slate-900 text-white dark:bg-teal-600 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Tableau
            </button>
            <button
              type="button"
              onClick={() => handleSwitchView("kanban")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-slate-900 text-white dark:bg-teal-600 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              exportApplicationsToXLSX(filteredAndSorted, allContacts)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingApp(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une entreprise, poste, ville, contact..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Tous les statuts</option>
              {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Toutes les villes</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Toutes les sources</option>
              {APPLICATION_SOURCES.map((src: ApplicationSource) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery ||
          statusFilter !== "ALL" ||
          cityFilter !== "ALL" ||
          sourceFilter !== "ALL") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Main Content : Table or Kanban */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          applications={filteredAndSorted}
          onSelect={(app) => setSelectedApp(app)}
          onStatusChange={(id, status) => updateStatus(id, status)}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th
                    onClick={() => toggleSort("company")}
                    className="py-3.5 pl-5 pr-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Entreprise
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("role")}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Poste & Secteur
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("city")}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Ville
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("status")}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Statut
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("source")}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Canal / Source
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("appliedDate")}
                    className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort("priority")}
                    className="py-3.5 pl-3 pr-5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      Priorité
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400 text-sm"
                    >
                      Aucune candidature ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="group cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 pl-5 pr-3 align-top">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{app.company}</span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                              title="Ouvrir le lien"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {app.contact?.name && (
                          <div className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                            Contact : {app.contact.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 align-top max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                          {app.role}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {app.sector}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 align-top text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {app.city}
                      </td>

                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-3 align-top text-xs text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                        {app.channelDetail || app.source}
                      </td>

                      <td className="py-3.5 px-3 align-top text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatShortDateFr(app.appliedDate)}
                      </td>

                      <td className="py-3.5 pl-3 pr-5 align-top text-right whitespace-nowrap">
                        <PriorityStars priority={app.priority} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

export default function CandidaturesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">
          Chargement des candidatures...
        </div>
      }
    >
      <CandidaturesContent />
    </Suspense>
  );
}
