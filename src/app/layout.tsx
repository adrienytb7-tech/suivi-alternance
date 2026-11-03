import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ApplicationsProvider } from "@/context/applications-context";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suivi Alternance — Adrien Bechu | Systèmes, Réseaux, Cloud & Cyber",
  description:
    "Tableau de bord personnel et CRM de suivi des candidatures en alternance (Nantes, Angers, Pays de la Loire).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ApplicationsProvider>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <Sidebar />
              <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                {children}
              </main>
            </div>
          </ApplicationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
