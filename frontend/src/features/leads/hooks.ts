"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLead, enrichLead, getAllLeadsForKanban, getLead, getLeads, getLeadStats, updateLead, updateLeadStage } from "./api";
import { Lead, LeadFilters } from "./types";
export function useLeadsQuery(filters: LeadFilters) { return useQuery({ queryKey: ["leads", filters], queryFn: () => getLeads(filters) }); }
export function useLeadQuery(id: string | number) { return useQuery({ queryKey: ["lead", id], queryFn: () => getLead(id), enabled: !!id }); }
export function useLeadStatsQuery() { return useQuery({ queryKey: ["lead-stats"], queryFn: getLeadStats }); }
export function useKanbanLeadsQuery() { return useQuery({ queryKey: ["kanban-leads"], queryFn: getAllLeadsForKanban }); }
export function useEnrichLeadMutation(id: number) { const qc = useQueryClient(); return useMutation({ mutationFn: () => enrichLead(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["lead", id] }); qc.invalidateQueries({ queryKey: ["leads"] }); } }); }
export function useUpdateLeadMutation() { const qc = useQueryClient(); return useMutation({ mutationFn: (lead: Lead) => updateLead(lead), onSuccess: (lead) => { qc.invalidateQueries({ queryKey: ["lead", lead.id] }); qc.invalidateQueries({ queryKey: ["leads"] }); qc.invalidateQueries({ queryKey: ["kanban-leads"] }); } }); }
export function useDeleteLeadMutation() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => deleteLead(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); qc.invalidateQueries({ queryKey: ["kanban-leads"] }); qc.invalidateQueries({ queryKey: ["lead-stats"] }); } }); }
export function useUpdateLeadStageMutation() { const qc = useQueryClient(); return useMutation({ mutationFn: ({id,stage}:{id:number;stage:string}) => updateLeadStage(id,stage), onSuccess: (lead) => { qc.invalidateQueries({ queryKey: ["lead", lead.id] }); qc.invalidateQueries({ queryKey: ["leads"] }); qc.invalidateQueries({ queryKey: ["kanban-leads"] }); qc.invalidateQueries({ queryKey: ["lead-stats"] }); } }); }
