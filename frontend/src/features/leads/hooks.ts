"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLead,
  deleteLead,
  enrichLead,
  getAllLeadsForKanban,
  getLead,
  getLeads,
  getLeadStats,
  updateLead,
  updateLeadStage,
} from "./api";
import { KanbanData, Lead, LeadFilters, LeadPayload } from "./types";

function cloneKanban(data: KanbanData) {
  return Object.fromEntries(
    Object.entries(data).map(([stage, leads]) => [stage, [...leads]])
  ) as KanbanData;
}

export function useLeadsQuery(filters: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => getLeads(filters),
  });
}

export function useLeadQuery(id: string | number) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(id),
    enabled: Boolean(id),
  });
}

export function useLeadStatsQuery() {
  return useQuery({
    queryKey: ["lead-stats"],
    queryFn: getLeadStats,
  });
}

export function useKanbanLeadsQuery() {
  return useQuery({
    queryKey: ["kanban-leads"],
    queryFn: getAllLeadsForKanban,
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeadPayload) => createLead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}

export function useEnrichLeadMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => enrichLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
    },
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LeadPayload }) =>
      updateLead(id, payload),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
  });
}

export function useUpdateLeadStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) =>
      updateLeadStage(id, stage),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["kanban-leads"] });

      const previousBoard = queryClient.getQueryData<KanbanData>(["kanban-leads"]);

      if (previousBoard) {
        const nextBoard = cloneKanban(previousBoard);
        let movedLead: Lead | null = null;

        for (const column of Object.keys(nextBoard)) {
          const index = nextBoard[column].findIndex((lead) => lead.id === id);

          if (index !== -1) {
            const [removedLead] = nextBoard[column].splice(index, 1);
            movedLead = { ...removedLead, stage };
            break;
          }
        }

        if (movedLead) {
          nextBoard[stage] = [movedLead, ...(nextBoard[stage] ?? [])];
        }

        queryClient.setQueryData(["kanban-leads"], nextBoard);
      }

      return { previousBoard };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["kanban-leads"], context.previousBoard);
      }
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-stats"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
    },
  });
}
