"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Building2, User, FileText, Calendar } from "lucide-react";
import {
  AlternanceApplication,
  APPLICATION_SOURCES,
  STATUS_CONFIG,
  ApplicationStatus,
} from "@/types/application";
import {
  applicationFormSchema,
  ApplicationFormValues,
} from "@/lib/validations";
import { useApplications } from "@/context/applications-context";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AlternanceApplication | null;
}

export function ApplicationFormModal({
  isOpen,
  onClose,
  initialData,
}: ApplicationFormModalProps) {
  const { createApplication, updateApplication } = useApplications();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      company: "",
      sector: "ESN / Services IT & Infrastructures",
      role: "Alternance Administrateur Systèmes, Réseaux & Cybersécurité",
      city: "Nantes",
      status: "ENVOYEE",
      priority: 3,
      source: "Candidature spontanée (Mail)",
      channelDetail: "",
      jobUrl: "",
      contractType: "Apprentissage",
      rhythm: "3 sem. entreprise / 1 sem. école",
      appliedDate: new Date().toISOString().split("T")[0],
      followUpDate: "",
      interviewDate: "",
      contactName: "",
      contactRole: "",
      contactEmail: "",
      contactLinkedin: "",
      cvVersion: "CV_Adrien_Bechu_SysReseaux_Cyber_2026.pdf",
      coverLetter: true,
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        company: initialData.company,
        sector: initialData.sector,
        role: initialData.role,
        city: initialData.city,
        status: initialData.status,
        priority: initialData.priority,
        source: initialData.source,
        channelDetail: initialData.channelDetail || "",
        jobUrl: initialData.jobUrl || "",
        contractType: initialData.contractType,
        rhythm: initialData.rhythm || "",
        appliedDate: initialData.appliedDate,
        followUpDate: initialData.followUpDate || "",
        interviewDate: initialData.interviewDate || "",
        contactName: initialData.contact?.name || "",
        contactRole: initialData.contact?.role || "",
        contactEmail: initialData.contact?.email || "",
        contactLinkedin: initialData.contact?.linkedin || "",
        cvVersion:
          initialData.documents?.cvVersion ||
          "CV_Adrien_Bechu_SysReseaux_Cyber_2026.pdf",
        coverLetter: initialData.documents?.coverLetter ?? true,
        notes: initialData.notes || "",
      });
    } else {
      reset({
        company: "",
        sector: "ESN / Services IT & Infrastructures",
        role: "Alternance Administrateur Systèmes, Réseaux & Cybersécurité",
        city: "Nantes",
        status: "ENVOYEE",
        priority: 3,
        source: "Candidature spontanée (Mail)",
        channelDetail: "",
        jobUrl: "",
        contractType: "Apprentissage",
        rhythm: "3 sem. entreprise / 1 sem. école",
        appliedDate: new Date().toISOString().split("T")[0],
        followUpDate: "",
        interviewDate: "",
        contactName: "",
        contactRole: "",
        contactEmail: "",
        contactLinkedin: "",
        cvVersion: "CV_Adrien_Bechu_SysReseaux_Cyber_2026.pdf",
        coverLetter: true,
        notes: "",
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: ApplicationFormValues) => {
    const payload = {
      company: values.company,
      sector: values.sector,
      role: values.role,
      city: values.city,
      status: values.status,
      priority: values.priority,
      source: values.source,
      channelDetail: values.channelDetail || values.source,
      jobUrl: values.jobUrl || undefined,
      contractType: values.contractType,
      rhythm: values.rhythm || undefined,
      appliedDate: values.appliedDate,
      followUpDate: values.followUpDate || undefined,
      interviewDate: values.interviewDate || undefined,
      contact: {
        name: values.contactName || undefined,
        role: values.contactRole || undefined,
        email: values.contactEmail || undefined,
        linkedin: values.contactLinkedin || undefined,
      },
      documents: {
        cvVersion: values.cvVersion,
        coverLetter: values.coverLetter,
      },
      notes: values.notes || "",
    };

    if (initialData) {
      await updateApplication(initialData.id, payload);
    } else {
      await createApplication({
        ...payload,
        timeline: [
          {
            id: `ev-${Date.now()}`,
            date: values.appliedDate,
            type: values.status === "A_POSTULER" ? "creation" : "envoi",
            title:
              values.status === "A_POSTULER"
                ? "Candidature ajoutée à préparer"
                : `Candidature envoyée (${values.source})`,
            content: values.notes || undefined,
          },
        ],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {initialData
                ? `Modifier — ${initialData.company}`
                : "Nouvelle candidature d'alternance"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Renseignez les informations de l&apos;entreprise, du poste et du suivi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-6 flex-1"
        >
          {/* Section 1 : Entreprise & Poste */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Entreprise & Poste visé
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Entreprise *
                </label>
                <input
                  {...register("company")}
                  placeholder="Ex: MICROEJ, Adista, CHU d'Angers..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                {errors.company && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.company.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ville / Localisation *
                </label>
                <input
                  {...register("city")}
                  placeholder="Ex: Nantes, Angers, Saint-Herblain..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                {errors.city && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intitulé du poste *
                </label>
                <input
                  {...register("role")}
                  placeholder="Ex: Alternance Administrateur Systèmes, Réseaux & Cybersécurité"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                {errors.role && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Secteur d&apos;activité *
                </label>
                <input
                  {...register("sector")}
                  placeholder="Ex: ESN / Infogérance & Cloud"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lien de l&apos;offre ou site web
                </label>
                <input
                  {...register("jobUrl")}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Statut, Canal & Dates */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Statut, Canal & Dates clés
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Statut actuel *
                </label>
                <select
                  {...register("status")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(
                    (st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Source principale *
                </label>
                <select
                  {...register("source")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  {APPLICATION_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priorité (1 à 3 étoiles)
                </label>
                <select
                  {...register("priority")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value={3}>★★★ Haute priorité</option>
                  <option value={2}>★★☆ Priorité moyenne</option>
                  <option value={1}>★☆☆ Priorité normale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date de candidature / contact *
                </label>
                <input
                  type="date"
                  {...register("appliedDate")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date de relance
                </label>
                <input
                  type="date"
                  {...register("followUpDate")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date d&apos;entretien
                </label>
                <input
                  type="date"
                  {...register("interviewDate")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3 : Contact & Contrat */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Contact RH / Opérationnel & Contrat
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom du contact
                </label>
                <input
                  {...register("contactName")}
                  placeholder="Ex: Jérôme Leroux, Jordan Trochu..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email du contact / RH
                </label>
                <input
                  {...register("contactEmail")}
                  placeholder="recrutement@entreprise.fr"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
                {errors.contactEmail && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profil LinkedIn
                </label>
                <input
                  {...register("contactLinkedin")}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type de contrat
                </label>
                <select
                  {...register("contractType")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="Apprentissage">Contrat d&apos;apprentissage</option>
                  <option value="Professionnalisation">
                    Contrat de professionnalisation
                  </option>
                  <option value="Indifférent">Indifférent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rythme d&apos;alternance
                </label>
                <input
                  {...register("rhythm")}
                  placeholder="Ex: 3 sem. entreprise / 1 sem. école"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Version du CV envoyée
                </label>
                <input
                  {...register("cvVersion")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 4 : Notes */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Notes de suivi
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("coverLetter")}
                  className="rounded border-slate-300"
                />
                Lettre de motivation jointe
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes détaillées
              </label>
              <textarea
                rows={3}
                {...register("notes")}
                placeholder="Détails de l'envoi, retours RH, informations clés sur l'équipe IT..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              <Save className="w-4 h-4" />
              {initialData
                ? "Enregistrer les modifications"
                : "Ajouter la candidature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
