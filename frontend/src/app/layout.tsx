import "./globals.css";
import Link from "next/link";
import { QueryProvider } from "@/components/providers/query-provider";
export const metadata = { title: "Lead Management Frontend", description: "Next.js frontend for the Laravel lead management API" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><QueryProvider><header className="topbar"><div className="topbar-inner"><div style={{fontWeight:700}}>Lead Management</div><nav className="nav"><Link href="/dashboard">Dashboard</Link><Link href="/leads">Leads</Link><Link href="/leads/kanban">Kanban</Link></nav></div></header>{children}</QueryProvider></body></html>;
}
