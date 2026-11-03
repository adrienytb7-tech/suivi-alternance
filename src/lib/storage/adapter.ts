import { AlternanceApplication, ApplicationStatus, TimelineEvent } from "@/types/application";
import { INITIAL_APPLICATIONS } from "@/lib/initial-data";

/**
 * Interface d'abstraction du stockage des candidatures.
 * Permet de basculer de LocalStorage vers Supabase sans modifier les composants UI.
 */
export interface ApplicationStorageRepository {
  getAll(): Promise<AlternanceApplication[]>;
  getById(id: string): Promise<AlternanceApplication | null>;
  create(
    data: Omit<AlternanceApplication, "id" | "createdAt" | "updatedAt">
  ): Promise<AlternanceApplication>;
  update(
    id: string,
    patch: Partial<AlternanceApplication>
  ): Promise<AlternanceApplication>;
  updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<AlternanceApplication>;
  addTimelineEvent(
    id: string,
    event: Omit<TimelineEvent, "id">
  ): Promise<AlternanceApplication>;
  delete(id: string): Promise<void>;
  replaceAll(applications: AlternanceApplication[]): Promise<void>;
  resetToDefault(): Promise<AlternanceApplication[]>;
}

const STORAGE_KEY = "adrien_alternance_applications_v1";

export class LocalStorageApplicationRepository
  implements ApplicationStorageRepository
{
  private readFromStorage(): AlternanceApplication[] {
    if (typeof window === "undefined") {
      return INITIAL_APPLICATIONS;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(INITIAL_APPLICATIONS)
        );
        return INITIAL_APPLICATIONS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return INITIAL_APPLICATIONS;
      }
      return parsed;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  private writeToStorage(apps: AlternanceApplication[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }

  async getAll(): Promise<AlternanceApplication[]> {
    return this.readFromStorage();
  }

  async getById(id: string): Promise<AlternanceApplication | null> {
    const apps = this.readFromStorage();
    return apps.find((a) => a.id === id) ?? null;
  }

  async create(
    data: Omit<AlternanceApplication, "id" | "createdAt" | "updatedAt">
  ): Promise<AlternanceApplication> {
    const apps = this.readFromStorage();
    const now = new Date().toISOString().split("T")[0];
    const newApp: AlternanceApplication = {
      ...data,
      id: `app-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newApp, ...apps];
    this.writeToStorage(updated);
    return newApp;
  }

  async update(
    id: string,
    patch: Partial<AlternanceApplication>
  ): Promise<AlternanceApplication> {
    const apps = this.readFromStorage();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Candidature introuvable (${id})`);
    }
    const now = new Date().toISOString().split("T")[0];
    const updatedItem: AlternanceApplication = {
      ...apps[index],
      ...patch,
      id,
      updatedAt: now,
    };
    apps[index] = updatedItem;
    this.writeToStorage(apps);
    return updatedItem;
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<AlternanceApplication> {
    const apps = this.readFromStorage();
    const current = apps.find((a) => a.id === id);
    if (!current) {
      throw new Error(`Candidature introuvable (${id})`);
    }
    const now = new Date().toISOString().split("T")[0];
    const statusEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: now,
      type:
        status === "RELANCEE"
          ? "relance"
          : status === "ENTRETIEN"
          ? "entretien"
          : status === "REFUSEE" || status === "OFFRE" || status === "ACCEPTEE"
          ? "retour"
          : "note",
      title: `Statut changé en « ${status} »`,
    };
    return this.update(id, {
      status,
      followUpDate: status === "RELANCEE" ? now : current.followUpDate,
      timeline: [statusEvent, ...current.timeline],
    });
  }

  async addTimelineEvent(
    id: string,
    event: Omit<TimelineEvent, "id">
  ): Promise<AlternanceApplication> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Candidature introuvable (${id})`);
    }
    const newEvent: TimelineEvent = {
      ...event,
      id: `ev-${Date.now()}`,
    };
    return this.update(id, {
      timeline: [newEvent, ...current.timeline],
    });
  }

  async delete(id: string): Promise<void> {
    const apps = this.readFromStorage().filter((a) => a.id !== id);
    this.writeToStorage(apps);
  }

  async replaceAll(applications: AlternanceApplication[]): Promise<void> {
    this.writeToStorage(applications);
  }

  async resetToDefault(): Promise<AlternanceApplication[]> {
    this.writeToStorage(INITIAL_APPLICATIONS);
    return INITIAL_APPLICATIONS;
  }
}

/**
 * Exemple de connecteur Supabase prêt à être branché lorsque NEXT_PUBLIC_SUPABASE_URL est défini.
 */
export const storageRepository: ApplicationStorageRepository =
  new LocalStorageApplicationRepository();
