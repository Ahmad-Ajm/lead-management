import Link from "next/link";
import { KanbanBoard } from "@/features/leads/components/kanban/KanbanBoard";

export default function LeadsKanbanPage() {
  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Kanban</h1>
          <p className="text-sm text-slate-600">
            Drag and drop leads between stages.
          </p>
        </div>

        <Link
          href="/leads"
          className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to list
        </Link>
      </div>

      <KanbanBoard />
    </main>
  );
}
