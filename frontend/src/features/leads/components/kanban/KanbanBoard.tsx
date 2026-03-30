"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { useKanbanLeadsQuery } from "../../hooks/useKanbanLeadsQuery";
import { useUpdateLeadStageMutation } from "../../hooks/useUpdateLeadStageMutation";

const stages = ["new", "contacted", "follow_up", "assigned", "converted", "lost"];

export function KanbanBoard() {
  const { data, isLoading, isError } = useKanbanLeadsQuery();
  const updateStageMutation = useUpdateLeadStageMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeLead = active.data.current?.lead;
    const fromStage = active.data.current?.stage;
    const toStage = over.data.current?.stage ?? over.id;

    if (!activeLead || !fromStage || !toStage) return;
    if (fromStage === toStage) return;

    updateStageMutation.mutate({
      leadId: activeLead.id,
      stage: String(toStage),
    });
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-600">Loading kanban...</p>;
  }

  if (isError || !data) {
    return <p className="p-6 text-sm text-red-600">Failed to load kanban data.</p>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn key={stage} stage={stage} leads={data[stage] ?? []} />
        ))}
      </div>
    </DndContext>
  );
}
