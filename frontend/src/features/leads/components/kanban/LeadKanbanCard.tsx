"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "../../types";

const sourceLabels: Record<string, string> = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  website: "Website",
  manual: "Manual",
};

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
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{lead.name}</h3>
            <p className="text-sm text-slate-500">
              {sourceLabels[lead.source] ?? lead.source}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            #{lead.id}
          </span>
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p>{lead.email ?? "No email"}</p>
          <p>{lead.phone ?? "No phone"}</p>
          <p>{new Date(lead.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <Link
          href={`/leads/${lead.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
