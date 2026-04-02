"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ErrorState, LoadingState, EmptyState } from "@/components/shared/state";
import { StageBadge } from "@/components/shared/stage-badge";
import { LEAD_SOURCES, LEAD_STAGES } from "@/features/leads/constants";
import { LeadFormSheet } from "@/features/leads/components/lead-form-sheet";
import { Lead } from "@/features/leads/types";
import {
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useLeadsQuery,
  useUpdateLeadMutation,
} from "@/features/leads/hooks";
import { formatDate, sourceLabel, stageLabel } from "@/lib/format";

type SortField = "id" | "name" | "source" | "stage" | "created_at";
type SortDirection = "asc" | "desc";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const filters = useMemo(
    () => ({
      page,
      search: search || undefined,
      stage: stage || undefined,
      source: source || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    }),
    [page, search, stage, source, dateFrom, dateTo, sortBy, sortDir]
  );

  const query = useLeadsQuery(filters);
  const createMutation = useCreateLeadMutation();
  const updateMutation = useUpdateLeadMutation();
  const deleteMutation = useDeleteLeadMutation();

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortDir("asc");
  }

  function handleDelete(id: number) {
    if (!window.confirm("Delete this lead?")) return;
    deleteMutation.mutate(id);
  }

  function closeSheet() {
    setSheetMode(null);
    setActiveLead(null);
  }

  return (
    <div className="container">
      <section className="hero">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1>Leads Workspace</h1>
            <p>Filter, sort, edit, and create leads from one responsive screen.</p>
          </div>

          <div className="inline">
            <div className="view-toggle">
              <Link href="/leads" className="active">
                List
              </Link>
              <Link href="/leads/kanban">Kanban</Link>
            </div>
            <button className="btn" onClick={() => setSheetMode("create")}>
              New lead
            </button>
          </div>
        </div>
      </section>

      <div className="card">
        <div className="page-header">
          <div>
            <h2 className="section-title">Filters</h2>
            <p className="section-subtitle">Server-side pagination with full query controls.</p>
          </div>
          <button
            className="btn secondary"
            onClick={() => {
              setSearch("");
              setStage("");
              setSource("");
              setDateFrom("");
              setDateTo("");
              setSortBy("created_at");
              setSortDir("desc");
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="filters">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              className="input"
              placeholder="Name, email, or phone"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Stage</span>
            <select
              className="select"
              value={stage}
              onChange={(event) => {
                setStage(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All stages</option>
              {LEAD_STAGES.map((item) => (
                <option key={item} value={item}>
                  {stageLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Source</span>
            <select
              className="select"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All sources</option>
              {LEAD_SOURCES.map((item) => (
                <option key={item} value={item}>
                  {sourceLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Date from</span>
            <input
              className="input"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Date to</span>
            <input
              className="input"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <div className="field">
            <span className="field-label">Page</span>
            <div className="empty-box" style={{ padding: 12 }}>
              {page}
            </div>
          </div>
        </div>

        {query.isLoading ? (
          <LoadingState text="Loading leads..." />
        ) : query.isError ? (
          <ErrorState message="Failed to load leads." />
        ) : !query.data?.data.length ? (
          <EmptyState text="No leads found for the selected filters." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <button onClick={() => toggleSort("id")}>ID</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort("name")}>Name</button>
                    </th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>
                      <button onClick={() => toggleSort("source")}>Source</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort("created_at")}>Date</button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort("stage")}>Stage</button>
                    </th>
                    <th>Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((lead) => (
                    <tr key={lead.id}>
                      <td>#{lead.id}</td>
                      <td>
                        <strong>{lead.name}</strong>
                        <span className="muted">{lead.notes ? "Has notes" : "No notes yet"}</span>
                      </td>
                      <td>{lead.phone || "—"}</td>
                      <td>{lead.email || "—"}</td>
                      <td>{sourceLabel(lead.source)}</td>
                      <td>{formatDate(lead.created_at)}</td>
                      <td>
                        <StageBadge stage={lead.stage} />
                      </td>
                      <td>{lead.assigned_user?.name || "Unassigned"}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn secondary"
                            onClick={() => {
                              setActiveLead(lead);
                              setSheetMode("edit");
                            }}
                          >
                            Edit
                          </button>
                          <Link href={`/leads/${lead.id}`} className="btn ghost">
                            View
                          </Link>
                          <button
                            className="btn danger"
                            onClick={() => handleDelete(lead.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="page-header" style={{ marginTop: 16, marginBottom: 0 }}>
              <div className="muted">Total: {query.data.meta.total} leads</div>
              <div className="inline">
                <button
                  className="btn secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <div className="muted">
                  Page {query.data.meta.current_page} of {query.data.meta.last_page}
                </div>
                <button
                  className="btn secondary"
                  disabled={page >= query.data.meta.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <LeadFormSheet
        open={sheetMode === "create"}
        title="Create lead"
        pending={createMutation.isPending}
        onClose={closeSheet}
        onSubmit={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: () => closeSheet(),
          });
        }}
      />

      <LeadFormSheet
        open={sheetMode === "edit"}
        lead={activeLead}
        title={activeLead ? `Edit ${activeLead.name}` : "Edit lead"}
        pending={updateMutation.isPending}
        onClose={closeSheet}
        onSubmit={(payload) => {
          if (!activeLead) return;

          updateMutation.mutate(
            { id: activeLead.id, payload },
            {
              onSuccess: () => closeSheet(),
            }
          );
        }}
      />
    </div>
  );
}
