"use client";

import React, { useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Briefcase,
  Columns3,
  Users,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  X,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { useApplications } from "@/context/applications-context";
import {
  exportApplicationsToCSV,
  exportApplicationsToJSON,
  exportApplicationsToXLSX,
  parseImportedJSON,
} from "@/lib/export-import";
import { cn } from "@/lib/utils";

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const { theme, setTheme } = useTheme();
  const {
    applications,
    allContacts,
    importApplications,
    resetToDemoData,
  } = useApplications();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      href: "/",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      badge: undefined,
      isActive: pathname === "/",
    },
    {
      id: "table",
      href: "/candidatures",
      label: "Liste des candidatures",
      icon: Briefcase,
      badge: applications.length,
      isActive: pathname === "/candidatures" && currentView !== "kanban",
    },
    {
      id: "kanban",
      href: "/candidatures?view=kanban",
      label: "Vue Kanban",
      icon: Columns3,
      badge: undefined,
      isActive: pathname === "/candidatures" && currentView === "kanban",
    },
    {
      id: "contacts",
      href: "/contacts",
      label: "Réseau & Contacts",
      icon: Users,
      badge: allContacts.length,
      isActive: pathname.startsWith("/contacts"),
    },
  ];

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseImportedJSON(file);
      await importApplications(imported);
      alert(`${imported.length} candidatures importées avec succès.`);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'import du fichier JSON."
      );
    } finally {
      e.target.value = "";
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Réinitialiser les données avec la base complète d'Adrien Bechu (81 candidatures mises à jour au 03/11/2026) ?"
      )
    ) {
      await resetToDemoData();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                AlternanceTracker
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Adrien Bechu • Sys / Réseaux / Cyber
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  item.isActive
                    ? "bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full font-semibold",
                      item.isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Data Tools (Export XLSX / CSV / JSON / Import) */}
        <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Export & Sauvegarde
          </div>
          <button
            type="button"
            onClick={() =>
              exportApplicationsToXLSX(applications, allContacts)
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Exporter en Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => exportApplicationsToCSV(applications)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Exporter en CSV
          </button>
          <button
            type="button"
            onClick={() => exportApplicationsToJSON(applications)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Exporter en JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Importer un fichier JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurer base du 03/11/2026
          </button>
        </div>
      </div>

      {/* Bottom Theme & Profile Card */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </span>
          <span className="text-[10px] text-slate-400">Thème</span>
        </button>

        <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-3 text-xs space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Cible : Nantes • Angers (44/49)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Admin Systèmes, Réseaux, Cloud & Cybersécurité
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-teal-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            AlternanceTracker — Adrien Bechu
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside className="hidden lg:block w-68 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen" />
      }
    >
      <SidebarInner />
    </Suspense>
  );
}
