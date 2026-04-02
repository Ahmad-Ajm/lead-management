"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Lead } from "../../types";
import { LeadKanbanCard } from "./LeadKanbanCard";
import { EmptyState } from "@/components/shared/state";
import { stageLabel } from "@/lib/format";

export function KanbanColumn({
  stage,
  leads,
}: {
  stage: string;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: "column",
      stage,
    },
  });

  return (
    <section className={`kanban-column${isOver ? " is-over" : ""}`}>
      <header className="kanban-column-header">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            {stageLabel(stage)}
          </h2>
          <div className="section-subtitle">Drop leads here</div>
        </div>
        <span className="kanban-count">{leads.length}</span>
      </header>

      <div ref={setNodeRef} className="kanban-list">
        <SortableContext
          items={leads.map((lead) => String(lead.id))}
          strategy={verticalListSortingStrategy}
        >
          {!leads.length ? (
            <EmptyState text="No leads in this stage." />
          ) : (
            leads.map((lead) => <LeadKanbanCard key={lead.id} lead={lead} />)
          )}
        </SortableContext>
      </div>
    </section>
  );
}
