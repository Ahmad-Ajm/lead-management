import { api } from "@/lib/api";
import { LEAD_STAGES } from "./constants";
import {
  KanbanData,
  Lead,
  LeadFilters,
  LeadPayload,
  LeadStats,
  PaginatedResponse,
} from "./types";

function createEmptyBoard(): KanbanData {
  return Object.fromEntries(LEAD_STAGES.map((stage) => [stage, []])) as KanbanData;
}

export async function getLeads(filters: LeadFilters) {
  const response = await api.get<PaginatedResponse<Lead>>("/leads", {
    params: filters,
  });

  return response.data;
}

export async function getAllLeadsForKanban() {
  const first = await getLeads({
    page: 1,
    sort_by: "created_at",
    sort_dir: "desc",
  });

  const all = [...first.data];

  for (let page = 2; page <= first.meta.last_page; page += 1) {
    const response = await getLeads({
      page,
      sort_by: "created_at",
      sort_dir: "desc",
    });

    all.push(...response.data);
  }

  const board = createEmptyBoard();

  for (const lead of all) {
    const stage = LEAD_STAGES.includes(lead.stage as (typeof LEAD_STAGES)[number])
      ? lead.stage
      : "new";

    board[stage].push(lead);
  }

  return board;
}

export async function getLead(id: string | number) {
  const response = await api.get<{ data: Lead }>(`/leads/${id}`);
  return response.data.data;
}

export async function createLead(payload: LeadPayload) {
  const response = await api.post<{ data: Lead }>("/leads", payload);
  return response.data.data;
}

export async function getLeadStats() {
  const response = await api.get<LeadStats>("/leads/stats");
  return response.data;
}

export async function enrichLead(id: number) {
  const response = await api.post(`/leads/${id}/enrich`);
  return response.data;
}

export async function updateLeadStage(id: number, stage: string) {
  const response = await api.patch<{ data: Lead }>(`/leads/${id}/stage`, { stage });
  return response.data.data;
}

export async function updateLead(id: number, payload: LeadPayload) {
  const response = await api.put<{ data: Lead }>(`/leads/${id}`, payload);
  return response.data.data;
}

export async function deleteLead(id: number) {
  await api.delete(`/leads/${id}`);
}
