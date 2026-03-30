"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStage } from "../api/updateLeadStage";
import type { Lead } from "../types";

type KanbanData = Record<string, Lead[]>;

function cloneData(data: KanbanData): KanbanData {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, [...value]])
  );
}

export function useUpdateLeadStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: number; stage: string }) =>
      updateLeadStage(leadId, stage),

    onMutate: async ({ leadId, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["kanban-leads"] });

      const previous = queryClient.getQueryData<KanbanData>(["kanban-leads"]);
      if (!previous) {
        return { previous };
      }

      const next = cloneData(previous);
      let movedLead: Lead | null = null;

      for (const column of Object.keys(next)) {
        const index = next[column].findIndex((lead) => lead.id === leadId);
        if (index !== -1) {
          const [removed] = next[column].splice(index, 1);
          movedLead = { ...removed, stage };
          break;
        }
      }

      if (movedLead) {
        next[stage] = [movedLead, ...(next[stage] ?? [])];
      }

      queryClient.setQueryData(["kanban-leads"], next);

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["kanban-leads"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
