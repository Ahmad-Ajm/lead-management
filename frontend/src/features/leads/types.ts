export type LeadActivity = { id: number; lead_id: number; type: string; description: string; performed_by: number | null; created_at: string; };
export type AssignedUser = { id: number; name: string; email: string } | null;
export type Lead = { id: number; name: string; email: string | null; phone: string | null; source: string; stage: string; assigned_to: number | null; assigned_user: AssignedUser; notes: string | null; metadata: Record<string, unknown> | null; created_at: string; updated_at: string; activities?: LeadActivity[]; };
export type PaginatedResponse<T> = { data: T[]; links: { first: string | null; last: string | null; prev: string | null; next: string | null; }; meta: { current_page: number; from: number | null; last_page: number; path: string; per_page: number; to: number | null; total: number; }; };
export type LeadStats = { total: number; by_stage: Record<string, number>; by_source: Record<string, number>; };
export type LeadFilters = { page?: number; search?: string; stage?: string; source?: string; sort_by?: string; sort_dir?: "asc" | "desc"; };
