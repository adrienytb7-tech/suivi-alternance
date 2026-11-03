"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  AlternanceApplication,
  ApplicationStatus,
  NetworkContact,
  TimelineEvent,
} from "@/types/application";
import { storageRepository } from "@/lib/storage/adapter";
import {
  INITIAL_APPLICATIONS,
  INITIAL_NETWORK_CONTACTS,
} from "@/lib/initial-data";

const CONTACTS_STORAGE_KEY = "adrien_alternance_contacts_v1";

interface ApplicationsContextValue {
  applications: AlternanceApplication[];
  networkContacts: NetworkContact[];
  allContacts: NetworkContact[];
  isLoading: boolean;
  createApplication: (
    data: Omit<AlternanceApplication, "id" | "createdAt" | "updatedAt">
  ) => Promise<AlternanceApplication>;
  updateApplication: (
    id: string,
    patch: Partial<AlternanceApplication>
  ) => Promise<AlternanceApplication>;
  updateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  markAsFollowedUp: (id: string, note?: string) => Promise<void>;
  addNoteToTimeline: (
    id: string,
    title: string,
    content?: string,
    type?: TimelineEvent["type"]
  ) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addNetworkContact: (contact: Omit<NetworkContact, "id">) => void;
  updateNetworkContact: (id: string, patch: Partial<NetworkContact>) => void;
  deleteNetworkContact: (id: string) => void;
  importApplications: (apps: AlternanceApplication[]) => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(
  undefined
);

export function ApplicationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [applications, setApplications] =
    useState<AlternanceApplication[]>(INITIAL_APPLICATIONS);
  const [networkContacts, setNetworkContacts] = useState<NetworkContact[]>(
    INITIAL_NETWORK_CONTACTS
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    storageRepository.getAll().then((data) => {
      if (mounted) {
        setApplications(data);
        setIsLoading(false);
      }
    });

    if (typeof window !== "undefined") {
      try {
        const rawContacts = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
        if (rawContacts) {
          const parsed = JSON.parse(rawContacts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNetworkContacts(parsed);
          } else {
            window.localStorage.setItem(
              CONTACTS_STORAGE_KEY,
              JSON.stringify(INITIAL_NETWORK_CONTACTS)
            );
          }
        } else {
          window.localStorage.setItem(
            CONTACTS_STORAGE_KEY,
            JSON.stringify(INITIAL_NETWORK_CONTACTS)
          );
        }
      } catch {
        // fallback to default
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const persistContacts = (contacts: NetworkContact[]) => {
    setNetworkContacts(contacts);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(contacts)
      );
    }
  };

  // Fusionne les contacts réseau dédiés avec les contacts RH/emails renseignés dans les candidatures
  const allContacts = useMemo(() => {
    const list: NetworkContact[] = [...networkContacts];
    const existingKeys = new Set(
      networkContacts.map(
        (c) => `${c.company.toLowerCase()}::${(c.email || c.name).toLowerCase()}`
      )
    );

    applications.forEach((app) => {
      const hasName = Boolean(app.contact?.name?.trim());
      const hasEmail = Boolean(app.contact?.email?.trim());
      if (!hasName && !hasEmail) return;

      const key = `${app.company.toLowerCase()}::${(
        app.contact.email ||
        app.contact.name ||
        ""
      ).toLowerCase()}`;

      // Évite les doublons avec les contacts principaux déjà dans INITIAL_NETWORK_CONTACTS
      const alreadyByCompanyAndName = networkContacts.some(
        (nc) =>
          nc.company.toLowerCase() === app.company.toLowerCase() &&
          ((app.contact.name &&
            nc.name.toLowerCase() === app.contact.name.toLowerCase()) ||
            (app.contact.email &&
              nc.email?.toLowerCase() === app.contact.email.toLowerCase()))
      );

      if (existingKeys.has(key) || alreadyByCompanyAndName) return;
      existingKeys.add(key);

      list.push({
        id: `app-contact-${app.id}`,
        name: app.contact.name || `Service Recrutement — ${app.company}`,
        role: app.contact.role || `Recrutement / RH (${app.sector})`,
        company: app.company,
        city: app.city,
        category:
          app.source === "Réseau / Cooptation"
            ? "Réseau & Cooptation"
            : "RH & Recrutement",
        email: app.contact.email,
        phone: app.contact.phone,
        linkedin: app.contact.linkedin,
        notes: app.notes,
        lastContactDate: app.appliedDate,
        applicationId: app.id,
      });
    });

    return list;
  }, [networkContacts, applications]);

  const createApplication = useCallback(
    async (
      data: Omit<AlternanceApplication, "id" | "createdAt" | "updatedAt">
    ) => {
      const created = await storageRepository.create(data);
      const all = await storageRepository.getAll();
      setApplications(all);
      return created;
    },
    []
  );

  const updateApplication = useCallback(
    async (id: string, patch: Partial<AlternanceApplication>) => {
      const updated = await storageRepository.update(id, patch);
      const all = await storageRepository.getAll();
      setApplications(all);
      return updated;
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      await storageRepository.updateStatus(id, status);
      const all = await storageRepository.getAll();
      setApplications(all);
    },
    []
  );

  const markAsFollowedUp = useCallback(async (id: string, note?: string) => {
    const today = new Date().toISOString().split("T")[0];
    const current = await storageRepository.getById(id);
    if (!current) return;
    const event: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: today,
      type: "relance",
      title: "Relance effectuée",
      content: note || "Relance envoyée par mail / LinkedIn.",
    };
    await storageRepository.update(id, {
      status: "RELANCEE",
      followUpDate: today,
      appliedDate: today,
      timeline: [event, ...current.timeline],
    });
    const all = await storageRepository.getAll();
    setApplications(all);
  }, []);

  const addNoteToTimeline = useCallback(
    async (
      id: string,
      title: string,
      content?: string,
      type: TimelineEvent["type"] = "note"
    ) => {
      const today = new Date().toISOString().split("T")[0];
      await storageRepository.addTimelineEvent(id, {
        date: today,
        type,
        title,
        content,
      });
      const all = await storageRepository.getAll();
      setApplications(all);
    },
    []
  );

  const deleteApplication = useCallback(async (id: string) => {
    await storageRepository.delete(id);
    const all = await storageRepository.getAll();
    setApplications(all);
  }, []);

  const addNetworkContact = useCallback(
    (contact: Omit<NetworkContact, "id">) => {
      const newContact: NetworkContact = {
        ...contact,
        id: `net-${Date.now()}`,
      };
      persistContacts([newContact, ...networkContacts]);
    },
    [networkContacts]
  );

  const updateNetworkContact = useCallback(
    (id: string, patch: Partial<NetworkContact>) => {
      const updated = networkContacts.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      );
      persistContacts(updated);
    },
    [networkContacts]
  );

  const deleteNetworkContact = useCallback(
    (id: string) => {
      const updated = networkContacts.filter((c) => c.id !== id);
      persistContacts(updated);
    },
    [networkContacts]
  );

  const importApplications = useCallback(
    async (apps: AlternanceApplication[]) => {
      await storageRepository.replaceAll(apps);
      setApplications(apps);
    },
    []
  );

  const resetToDemoData = useCallback(async () => {
    const reset = await storageRepository.resetToDefault();
    setApplications(reset);
    persistContacts(INITIAL_NETWORK_CONTACTS);
  }, []);

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        networkContacts,
        allContacts,
        isLoading,
        createApplication,
        updateApplication,
        updateStatus,
        markAsFollowedUp,
        addNoteToTimeline,
        deleteApplication,
        addNetworkContact,
        updateNetworkContact,
        deleteNetworkContact,
        importApplications,
        resetToDemoData,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error(
      "useApplications doit être utilisé à l'intérieur d'un ApplicationsProvider"
    );
  }
  return ctx;
}
