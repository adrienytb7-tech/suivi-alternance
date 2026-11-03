export type ApplicationStatus =
  | "A_POSTULER"
  | "ENVOYEE"
  | "RELANCEE"
  | "ENTRETIEN"
  | "REFUSEE"
  | "OFFRE"
  | "ACCEPTEE";

export type ContractType = "Apprentissage" | "Professionnalisation" | "Indifférent";

export type PriorityLevel = 1 | 2 | 3;

export type ApplicationSource =
  | "Candidature spontanée (Mail)"
  | "HelloWork"
  | "Indeed"
  | "LinkedIn"
  | "Welcome to the Jungle"
  | "Site entreprise / Portail Carrière"
  | "Réseau / Cooptation"
  | "Dépôt physique (CV en main propre)"
  | "Plateforme MStaff / Publique"
  | "Autre";

export interface TimelineEvent {
  id: string;
  date: string; // ISO YYYY-MM-DD
  type: "creation" | "envoi" | "relance" | "entretien" | "retour" | "note";
  title: string;
  content?: string;
}

export interface ContactInfo {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export type ContactCategory =
  | "Réseau & Cooptation"
  | "Manager IT / Opérationnel"
  | "Tuteur / Ancien stage"
  | "RH & Recrutement";

export interface NetworkContact {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  category: ContactCategory;
  email?: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
  lastContactDate?: string;
  applicationId?: string;
}

export interface SentDocuments {
  cvVersion: string;
  coverLetter: boolean;
  coverLetterNote?: string;
  portfolioOrAttachment?: string;
}

export interface AlternanceApplication {
  id: string;
  company: string;
  sector: string;
  role: string;
  city: string;
  status: ApplicationStatus;
  priority: PriorityLevel; // 1 = Normale, 2 = Moyenne, 3 = Haute
  source: ApplicationSource;
  channelDetail?: string;
  jobUrl?: string;
  contractType: ContractType;
  rhythm?: string; // ex: "3 sem. entreprise / 1 sem. école"
  appliedDate: string; // ISO YYYY-MM-DD (Date de candidature ou dernier contact)
  followUpDate?: string; // ISO YYYY-MM-DD (Date de relance effectuée ou prévue)
  interviewDate?: string; // ISO YYYY-MM-DD
  contact: ContactInfo;
  documents: SentDocuments;
  notes: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    dotClass: string;
    kanbanBorder: string;
    hexColor: string;
    order: number;
  }
> = {
  A_POSTULER: {
    label: "À postuler",
    shortLabel: "À postuler",
    badgeClass:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dotClass: "bg-slate-400",
    kanbanBorder: "border-t-slate-400",
    hexColor: "#94a3b8",
    order: 1,
  },
  ENVOYEE: {
    label: "Envoyée",
    shortLabel: "Envoyée",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    dotClass: "bg-blue-500",
    kanbanBorder: "border-t-blue-500",
    hexColor: "#3b82f6",
    order: 2,
  },
  RELANCEE: {
    label: "Relancée",
    shortLabel: "Relancée",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    dotClass: "bg-amber-500",
    kanbanBorder: "border-t-amber-500",
    hexColor: "#f59e0b",
    order: 3,
  },
  ENTRETIEN: {
    label: "Entretien",
    shortLabel: "Entretien",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    dotClass: "bg-purple-500",
    kanbanBorder: "border-t-purple-500",
    hexColor: "#a855f7",
    order: 4,
  },
  OFFRE: {
    label: "Offre reçue",
    shortLabel: "Offre",
    badgeClass:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
    dotClass: "bg-teal-500",
    kanbanBorder: "border-t-teal-500",
    hexColor: "#14b8a6",
    order: 5,
  },
  ACCEPTEE: {
    label: "Acceptée",
    shortLabel: "Acceptée",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    kanbanBorder: "border-t-emerald-500",
    hexColor: "#10b981",
    order: 6,
  },
  REFUSEE: {
    label: "Refusée",
    shortLabel: "Refusée",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    dotClass: "bg-rose-500",
    kanbanBorder: "border-t-rose-500",
    hexColor: "#f43f5e",
    order: 7,
  },
};

export const APPLICATION_SOURCES: ApplicationSource[] = [
  "Candidature spontanée (Mail)",
  "HelloWork",
  "Indeed",
  "LinkedIn",
  "Welcome to the Jungle",
  "Site entreprise / Portail Carrière",
  "Réseau / Cooptation",
  "Dépôt physique (CV en main propre)",
  "Plateforme MStaff / Publique",
  "Autre",
];
