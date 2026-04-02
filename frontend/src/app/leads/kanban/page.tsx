import Link from "next/link";
import { KanbanBoard } from "@/features/leads/components/kanban/KanbanBoard";

export default function LeadsKanbanPage() {
  return (
    <div className="container">
      <section className="hero">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1>Leads Kanban</h1>
            <p>Drag and drop leads between stages with optimistic updates.</p>
          </div>

          <div className="view-toggle">
            <Link href="/leads">List</Link>
            <Link href="/leads/kanban" className="active">
              Kanban
            </Link>
          </div>
        </div>
      </section>

      <div className="page-header">
        <div>
          <h2 className="section-title">Pipeline Flow</h2>
          <p className="section-subtitle">Drop a card on another column to persist its new stage.</p>
        </div>

        <Link href="/leads" className="btn ghost">
          Back to list
        </Link>
      </div>

      <KanbanBoard />
    </div>
  );
}
