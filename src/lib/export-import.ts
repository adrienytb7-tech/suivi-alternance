import * as XLSX from "xlsx";
import {
  AlternanceApplication,
  ApplicationStatus,
  NetworkContact,
  STATUS_CONFIG,
} from "@/types/application";
import { formatShortDateFr } from "@/lib/utils";

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

export function exportApplicationsToJSON(apps: AlternanceApplication[]): void {
  const blob = new Blob([JSON.stringify(apps, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(
    blob,
    `candidatures-alternance-adrien-${dateStr}.json`
  );
}

export function exportApplicationsToCSV(apps: AlternanceApplication[]): void {
  const headers = [
    "Entreprise",
    "Ville",
    "Secteur",
    "Poste visé",
    "Statut",
    "Date dernier contact",
    "Canal",
    "Priorité",
    "Contact Nom",
    "Contact Email",
    "Notes",
    "Lien offre ou site",
  ];

  const escapeCsvCell = (val: string | undefined | null) => {
    const str = String(val ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = apps.map((app) => [
    escapeCsvCell(app.company),
    escapeCsvCell(app.city),
    escapeCsvCell(app.sector),
    escapeCsvCell(app.role),
    escapeCsvCell(STATUS_CONFIG[app.status]?.label ?? app.status),
    escapeCsvCell(formatShortDateFr(app.appliedDate)),
    escapeCsvCell(app.channelDetail || app.source),
    escapeCsvCell(
      app.priority === 3 ? "Haute" : app.priority === 2 ? "Moyenne" : "Normale"
    ),
    escapeCsvCell(app.contact?.name),
    escapeCsvCell(app.contact?.email),
    escapeCsvCell(app.notes),
    escapeCsvCell(app.jobUrl),
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(blob, `candidatures-alternance-adrien-${dateStr}.csv`);
}

export function exportApplicationsToXLSX(
  apps: AlternanceApplication[],
  contacts: NetworkContact[] = []
): void {
  const workbook = XLSX.utils.book_new();

  // 1. Feuille Candidatures
  const candidaturesData = apps.map((app) => ({
    Entreprise: app.company,
    Ville: app.city,
    Secteur: app.sector,
    "Poste visé": app.role,
    Statut: STATUS_CONFIG[app.status]?.label ?? app.status,
    "Date dernier contact": formatShortDateFr(app.appliedDate),
    "Date relance": app.followUpDate
      ? formatShortDateFr(app.followUpDate)
      : "",
    Canal: app.channelDetail || app.source,
    Priorité:
      app.priority === 3 ? "Haute" : app.priority === 2 ? "Moyenne" : "Normale",
    "Contact Nom": app.contact?.name ?? "",
    "Contact Email": app.contact?.email ?? "",
    Notes: app.notes,
    "Lien offre ou site": app.jobUrl ?? "",
  }));

  const wsCandidatures = XLSX.utils.json_to_sheet(candidaturesData);
  wsCandidatures["!cols"] = [
    { wch: 28 }, // Entreprise
    { wch: 22 }, // Ville
    { wch: 34 }, // Secteur
    { wch: 46 }, // Poste visé
    { wch: 16 }, // Statut
    { wch: 18 }, // Date dernier contact
    { wch: 15 }, // Date relance
    { wch: 28 }, // Canal
    { wch: 12 }, // Priorité
    { wch: 22 }, // Contact Nom
    { wch: 30 }, // Contact Email
    { wch: 65 }, // Notes
    { wch: 40 }, // Lien
  ];
  XLSX.utils.book_append_sheet(workbook, wsCandidatures, "Candidatures");

  // 2. Feuille Réseau & Contacts
  if (contacts.length > 0) {
    const contactsData = contacts.map((c) => ({
      Nom: c.name,
      Rôle: c.role,
      Entreprise: c.company,
      Ville: c.city,
      Catégorie: c.category,
      Email: c.email ?? "",
      Téléphone: c.phone ?? "",
      LinkedIn: c.linkedin ?? "",
      "Dernier échange": c.lastContactDate
        ? formatShortDateFr(c.lastContactDate)
        : "",
      Notes: c.notes ?? "",
    }));
    const wsContacts = XLSX.utils.json_to_sheet(contactsData);
    wsContacts["!cols"] = [
      { wch: 24 },
      { wch: 32 },
      { wch: 26 },
      { wch: 18 },
      { wch: 24 },
      { wch: 30 },
      { wch: 16 },
      { wch: 30 },
      { wch: 16 },
      { wch: 55 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsContacts, "Réseau & Contacts");
  }

  // 3. Feuille Synthèse
  const total = apps.length || 1;
  const statuses = Object.keys(STATUS_CONFIG) as ApplicationStatus[];
  const syntheseRows = statuses.map((st) => {
    const count = apps.filter((a) => a.status === st).length;
    return {
      Statut: STATUS_CONFIG[st].label,
      "Nombre d'entreprises": count,
      "Part (%)": `${Math.round((count / total) * 100)}%`,
    };
  });
  syntheseRows.push({
    Statut: "TOTAL",
    "Nombre d'entreprises": apps.length,
    "Part (%)": "100%",
  });

  const wsSynthese = XLSX.utils.json_to_sheet(syntheseRows);
  wsSynthese["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, wsSynthese, "Synthèse");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(
    blob,
    `suivi-alternance-adrien-bechu-${dateStr}.xlsx`
  );
}

export async function parseImportedJSON(
  file: File
): Promise<AlternanceApplication[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("Le fichier JSON doit contenir un tableau de candidatures.");
  }
  const valid = parsed.filter(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.company === "string" &&
      typeof item.role === "string" &&
      typeof item.status === "string"
  );
  if (valid.length === 0) {
    throw new Error("Aucune candidature valide trouvée dans le fichier JSON.");
  }
  return valid as AlternanceApplication[];
}
