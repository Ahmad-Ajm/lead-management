"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "../../types";
import { shortDate, sourceLabel } from "@/lib/format";

export function LeadKanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: String(lead.id),
      data: {
        type: "lead",
        lead,
        stage: lead.stage,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-card${isDragging ? " dragging" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="kanban-card-grip"
      >
        <div className="kanban-card-header">
          <div>
            <h3 style={{ margin: 0 }}>{lead.name}</h3>
            <p className="section-subtitle" style={{ marginTop: 6 }}>
              {lead.email ?? lead.phone ?? "No direct contact details"}
            </p>
          </div>

          <span className="source-mark">{lead.source.slice(0, 2)}</span>
        </div>

        <div className="meta-line">
          <span className="pill">#{lead.id}</span>
          <span className="pill">{sourceLabel(lead.source)}</span>
          <span className="pill">{shortDate(lead.created_at)}</span>
        </div>
      </div>

      <div className="inline" style={{ justifyContent: "space-between" }}>
        <span className="muted">{lead.assigned_user?.name ?? "Unassigned"}</span>
        <Link href={`/leads/${lead.id}`} className="btn ghost">
          View details
        </Link>
      </div>
    </article>
  );
}
