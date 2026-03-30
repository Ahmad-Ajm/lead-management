import { api } from "@/lib/api";

export async function updateLeadStage(leadId: number, stage: string) {
  const response = await api.patch(`/leads/${leadId}/stage`, { stage });
  return response.data;
}
