"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Lead } from "../../types";
import { LeadKanbanCard } from "./LeadKanbanCard";

const titles: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow Up",
  assigned: "Assigned",
  converted: "Converted",
  lost: "Lost",
};

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
    <section className="flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border bg-slate-50">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold text-slate-900">{titles[stage] ?? stage}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
          {leads.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`min-h-[420px] space-y-3 p-3 ${
          isOver ? "bg-blue-50" : ""
        }`}
      >
        <SortableContext
          items={leads.map((lead) => String(lead.id))}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadKanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}
