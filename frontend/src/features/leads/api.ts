import { api } from "@/lib/api";
import { Lead, LeadFilters, LeadStats, PaginatedResponse } from "./types";
export async function getLeads(filters: LeadFilters) { const response = await api.get<PaginatedResponse<Lead>>("/leads", { params: filters }); return response.data; }
export async function getAllLeadsForKanban() { const first = await getLeads({ page: 1, sort_by: "created_at", sort_dir: "desc" }); let all = [...first.data]; for (let page=2; page<=first.meta.last_page; page++) { const res = await getLeads({ page, sort_by: "created_at", sort_dir: "desc" }); all = all.concat(res.data);} return all; }
export async function getLead(id: string | number) { const response = await api.get<{data: Lead}>(`/leads/${id}`); return response.data.data; }
export async function getLeadStats() { const response = await api.get<LeadStats>("/leads/stats"); return response.data; }
export async function enrichLead(id: number) { const response = await api.post(`/leads/${id}/enrich`); return response.data; }
export async function updateLeadStage(id: number, stage: string) { const response = await api.patch<{data: Lead}>(`/leads/${id}/stage`, { stage }); return response.data.data; }
export async function updateLead(lead: Lead) { const response = await api.put<{data: Lead}>(`/leads/${lead.id}`, { name: lead.name, email: lead.email, phone: lead.phone, source: lead.source, stage: lead.stage, assigned_to: lead.assigned_to, notes: lead.notes, metadata: lead.metadata }); return response.data.data; }
export async function deleteLead(id: number) { await api.delete(`/leads/${id}`); }
