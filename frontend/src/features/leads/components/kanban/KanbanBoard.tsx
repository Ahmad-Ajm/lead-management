"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/state";
import { LEAD_STAGES } from "../../constants";
import { useKanbanLeadsQuery, useUpdateLeadStageMutation } from "../../hooks";

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
      id: activeLead.id,
      stage: String(toStage),
    });
  }

  if (isLoading) {
    return <LoadingState text="Loading kanban board..." />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load kanban data." />;
  }

  const totalLeads = Object.values(data).reduce((sum, leads) => sum + leads.length, 0);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h2 className="section-title">Pipeline Board</h2>
            <p className="section-subtitle">
              Drag a card into a different column to update its stage instantly.
            </p>
          </div>
          <div className="pill">
            {totalLeads} lead{totalLeads === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {!totalLeads ? (
        <EmptyState text="No leads available to display on the board." />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {LEAD_STAGES.map((stage) => (
              <KanbanColumn key={stage} stage={stage} leads={data[stage] ?? []} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
