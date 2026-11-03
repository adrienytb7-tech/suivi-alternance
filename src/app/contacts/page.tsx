"use client";

import React, { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Copy,
  Check,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  Briefcase,
  Trash2,
  X,
  Save,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { useApplications } from "@/context/applications-context";
import {
  AlternanceApplication,
  ContactCategory,
  NetworkContact,
} from "@/types/application";
import { formatDateFr } from "@/lib/utils";
import { ApplicationDetailModal } from "@/components/applications/application-detail-modal";
import { ApplicationFormModal } from "@/components/applications/application-form-modal";
import { exportApplicationsToXLSX } from "@/lib/export-import";

const CATEGORIES: ContactCategory[] = [
  "Réseau & Cooptation",
  "Manager IT / Opérationnel",
  "Tuteur / Ancien stage",
  "RH & Recrutement",
];

const CATEGORY_BADGES: Record<ContactCategory, string> = {
  "Réseau & Cooptation":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
  "Manager IT / Opérationnel":
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  "Tuteur / Ancien stage":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  "RH & Recrutement":
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
};

export default function ContactsPage() {
  const {
    applications,
    allContacts,
    addNetworkContact,
    deleteNetworkContact,
  } = useApplications();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<AlternanceApplication | null>(
    null
  );
  const [editingApp, setEditingApp] = useState<AlternanceApplication | null>(
    null
  );
  const [isAppFormOpen, setIsAppFormOpen] = useState(false);

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<{
    name: string;
    role: string;
    company: string;
    city: string;
    category: ContactCategory;
    email: string;
    phone: string;
    linkedin: string;
    notes: string;
  }>({
    name: "",
    role: "",
    company: "",
    city: "Nantes",
    category: "Réseau & Cooptation",
    email: "",
    phone: "",
    linkedin: "",
    notes: "",
  });

  const stats = useMemo(() => {
    const total = allContacts.length;
    const cooptation = allContacts.filter(
      (c) => c.category === "Réseau & Cooptation"
    ).length;
    const operationnelsEtStages = allContacts.filter(
      (c) =>
        c.category === "Manager IT / Opérationnel" ||
        c.category === "Tuteur / Ancien stage"
    ).length;
    const rh = allContacts.filter(
      (c) => c.category === "RH & Recrutement"
    ).length;
    return { total, cooptation, operationnelsEtStages, rh };
  }, [allContacts]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allContacts.filter((contact) => {
      if (selectedCategory !== "ALL" && contact.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.company.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q) ||
        contact.city.toLowerCase().includes(q) ||
        (contact.email?.toLowerCase().includes(q) ?? false) ||
        (contact.notes?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allContacts, searchQuery, selectedCategory]);

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.company.trim()) return;
    addNetworkContact({
      name: newContact.name.trim(),
      role: newContact.role.trim() || "Contact Réseau IT",
      company: newContact.company.trim(),
      city: newContact.city.trim() || "Nantes",
      category: newContact.category,
      email: newContact.email.trim() || undefined,
      phone: newContact.phone.trim() || undefined,
      linkedin: newContact.linkedin.trim() || undefined,
      notes: newContact.notes.trim() || undefined,
      lastContactDate: new Date().toISOString().split("T")[0],
    });
    setNewContact({
      name: "",
      role: "",
      company: "",
      city: "Nantes",
      category: "Réseau & Cooptation",
      email: "",
      phone: "",
      linkedin: "",
      notes: "",
    });
    setIsAddContactOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mon Réseau & Contacts ({filteredContacts.length})
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contacts directs, cooptation, anciens tuteurs de stage, managers IT
            et contacts RH
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportApplicationsToXLSX(applications, allContacts)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Exporter Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={() => setIsAddContactOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un contact
          </button>
        </div>
      </div>

      {/* KPIs Réseau */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Total Contacts</span>
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Carnet d&apos;adresses complet
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Réseau & Cooptation</span>
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
            {stats.cooptation}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Relais internes & recommandations
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Opérationnels & Stages</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.operationnelsEtStages}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Managers IT & anciens maîtres de stage
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Contacts RH & DSI</span>
            <Mail className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.rh}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Services recrutement & RH identifiés
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un nom (Jordan Trochu, Margot Cathelineau...), entreprise, email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white dark:bg-teal-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Tous ({allContacts.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white dark:bg-teal-600"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredContacts.map((contact: NetworkContact) => {
          const linkedApp = contact.applicationId
            ? applications.find((a) => a.id === contact.applicationId)
            : applications.find(
                (a) =>
                  a.company.toLowerCase() === contact.company.toLowerCase()
              );

          const isCustom = contact.id.startsWith("net-");

          return (
            <div
              key={contact.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      CATEGORY_BADGES[contact.category]
                    }`}
                  >
                    {contact.category}
                  </span>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Supprimer le contact ${contact.name} ?`
                          )
                        ) {
                          deleteNetworkContact(contact.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                      title="Supprimer ce contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {contact.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {contact.role}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {contact.company}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {contact.city}
                  </span>
                </div>

                {contact.email && (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200/70 dark:border-slate-800">
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline truncate flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(contact.id, contact.email!)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 shrink-0"
                    >
                      {copiedId === contact.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                )}

                {contact.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {contact.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {contact.lastContactDate
                    ? formatDateFr(contact.lastContactDate)
                    : "—"}
                </span>

                {linkedApp ? (
                  <button
                    type="button"
                    onClick={() => setSelectedApp(linkedApp)}
                    className="inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Voir la candidature
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout de contact réseau */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ajouter un contact à mon réseau
              </h2>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    required
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    placeholder="Ex: Thomas Moreau"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entreprise / École *
                  </label>
                  <input
                    required
                    value={newContact.company}
                    onChange={(e) =>
                      setNewContact({ ...newContact, company: e.target.value })
                    }
                    placeholder="Ex: Emineo, Airbus, Sigma..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fonction / Rôle
                  </label>
                  <input
                    value={newContact.role}
                    onChange={(e) =>
                      setNewContact({ ...newContact, role: e.target.value })
                    }
                    placeholder="Ex: Ingénieur Sécurité, RSSI, RH..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newContact.category}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        category: e.target.value as ContactCategory,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    placeholder="prenom.nom@entreprise.fr"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ville
                  </label>
                  <input
                    value={newContact.city}
                    onChange={(e) =>
                      setNewContact({ ...newContact, city: e.target.value })
                    }
                    placeholder="Nantes / Angers"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes & contexte de la relation
                </label>
                <textarea
                  rows={3}
                  value={newContact.notes}
                  onChange={(e) =>
                    setNewContact({ ...newContact, notes: e.target.value })
                  }
                  placeholder="Comment vous connaissez-vous, recommandations possibles..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-teal-600 text-white text-xs font-medium hover:opacity-90"
                >
                  <Save className="w-3.5 h-3.5" />
                  Enregistrer le contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Edit Modals for linked application */}
      <ApplicationDetailModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onEdit={(app) => {
          setSelectedApp(null);
          setEditingApp(app);
          setIsAppFormOpen(true);
        }}
      />

      <ApplicationFormModal
        isOpen={isAppFormOpen}
        onClose={() => {
          setIsAppFormOpen(false);
          setEditingApp(null);
        }}
        initialData={editingApp}
      />
    </div>
  );
}
