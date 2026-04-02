import "./globals.css";
import Link from "next/link";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata = {
  title: "Lead Management Frontend",
  description: "Next.js frontend for the Laravel lead management API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <div className="app-shell">
            <header className="topbar">
              <div className="topbar-inner">
                <div>
                  <div className="eyebrow">Adalat ERP</div>
                  <Link href="/dashboard" className="brand">
                    Lead Management
                  </Link>
                </div>

                <nav className="nav">
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/leads">Leads</Link>
                  <Link href="/leads/kanban">Kanban</Link>
                </nav>
              </div>
            </header>

            <main>{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
