import { z } from "zod";

export const applicationFormSchema = z.object({
  company: z.string().min(1, "Le nom de l'entreprise est requis"),
  sector: z.string().min(1, "Le secteur d'activité est requis"),
  role: z.string().min(2, "L'intitulé du poste est requis"),
  city: z.string().min(1, "La ville est requise"),
  status: z.enum([
    "A_POSTULER",
    "ENVOYEE",
    "RELANCEE",
    "ENTRETIEN",
    "REFUSEE",
    "OFFRE",
    "ACCEPTEE",
  ]),
  priority: z.coerce.number().min(1).max(3) as z.ZodType<1 | 2 | 3>,
  source: z.enum([
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
  ]),
  channelDetail: z.string().optional().or(z.literal("")),
  jobUrl: z.string().optional().or(z.literal("")),
  contractType: z.enum(["Apprentissage", "Professionnalisation", "Indifférent"]),
  rhythm: z.string().optional().or(z.literal("")),
  appliedDate: z.string().min(1, "La date est requise"),
  followUpDate: z.string().optional().or(z.literal("")),
  interviewDate: z.string().optional().or(z.literal("")),
  contactName: z.string().optional().or(z.literal("")),
  contactRole: z.string().optional().or(z.literal("")),
  contactEmail: z
    .string()
    .email("Format d'email invalide")
    .optional()
    .or(z.literal("")),
  contactLinkedin: z.string().optional().or(z.literal("")),
  cvVersion: z.string().min(1, "Précisez la version du CV"),
  coverLetter: z.boolean().default(true),
  notes: z.string().optional().or(z.literal("")),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
