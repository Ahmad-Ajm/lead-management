"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LEAD_SOURCES, LEAD_STAGES } from "@/features/leads/constants";
import {
  useEnrichLeadMutation,
  useLeadQuery,
  useUpdateLeadMutation,
} from "@/features/leads/hooks";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/state";
import { StageBadge } from "@/components/shared/stage-badge";
import { activityLabel, formatDate, sourceLabel, stageLabel } from "@/lib/format";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const leadQuery = useLeadQuery(id);
  const updateMutation = useUpdateLeadMutation();
  const enrichMutation = useEnrichLeadMutation(id);

  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState("new");
  const [source, setSource] = useState("manual");

  useEffect(() => {
    if (!leadQuery.data) return;

    setNotes(leadQuery.data.notes || "");
    setStage(leadQuery.data.stage);
    setSource(leadQuery.data.source);
  }, [leadQuery.data]);

  if (leadQuery.isLoading) {
    return (
      <div className="container">
        <LoadingState text="Loading lead..." />
      </div>
    );
  }

  if (leadQuery.isError || !leadQuery.data) {
    return (
      <div className="container">
        <ErrorState message="Failed to load this lead." />
      </div>
    );
  }

  const lead = leadQuery.data;
  const enrichment = (lead.metadata?.enrichment ?? null) as Record<string, unknown> | null;

  return (
    <div className="container">
      <section className="hero">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="meta-line">
              <Link href="/leads" className="btn ghost">
                Back to leads
              </Link>
              <span className="pill">Lead #{lead.id}</span>
            </div>
            <h1 style={{ marginTop: 14 }}>{lead.name}</h1>
            <div className="inline" style={{ marginTop: 10 }}>
              <StageBadge stage={lead.stage} />
              <span className="pill">{sourceLabel(lead.source)}</span>
              <span className="pill">Updated {formatDate(lead.updated_at)}</span>
            </div>
          </div>

          <button
            className="btn"
            onClick={() => enrichMutation.mutate()}
            disabled={enrichMutation.isPending || !lead.email}
          >
            {enrichMutation.isPending ? "Enriching..." : "Enrich lead"}
          </button>
        </div>
      </section>

      <div className="grid grid-2">
        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Lead Information</h2>
              <p className="section-subtitle">Core profile details coming from the API.</p>
            </div>
          </div>

          <div className="detail-list">
            <div className="detail-row">
              <span>Email</span>
              <strong>{lead.email || "—"}</strong>
            </div>
            <div className="detail-row">
              <span>Phone</span>
              <strong>{lead.phone || "—"}</strong>
            </div>
            <div className="detail-row">
              <span>Assigned user</span>
              <strong>{lead.assigned_user?.name || "Unassigned"}</strong>
            </div>
            <div className="detail-row">
              <span>Created</span>
              <strong>{formatDate(lead.created_at)}</strong>
            </div>
            <div className="detail-row">
              <span>Current stage</span>
              <strong>{stageLabel(lead.stage)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Quick Edit</h2>
              <p className="section-subtitle">Update stage, source, and notes inline.</p>
            </div>
          </div>

          <div className="grid">
            <label className="field">
              <span className="field-label">Stage</span>
              <select className="select" value={stage} onChange={(event) => setStage(event.target.value)}>
                {LEAD_STAGES.map((item) => (
                  <option key={item} value={item}>
                    {stageLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Source</span>
              <select className="select" value={source} onChange={(event) => setSource(event.target.value)}>
                {LEAD_SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {sourceLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Notes</span>
              <textarea
                className="textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Write notes here..."
              />
            </label>

            <button
              className="btn full"
              onClick={() =>
                updateMutation.mutate({
                  id: lead.id,
                  payload: {
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    source,
                    stage,
                    assigned_to: lead.assigned_to,
                    notes,
                    metadata: lead.metadata,
                  },
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Enrichment Data</h2>
              <p className="section-subtitle">
                API validation and enrichment results stored in metadata.
              </p>
            </div>
          </div>

          {enrichment ? (
            <pre className="code-block">{JSON.stringify(enrichment, null, 2)}</pre>
          ) : (
            <EmptyState text="No enrichment data yet." />
          )}
        </div>

        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Metadata</h2>
              <p className="section-subtitle">Raw metadata currently attached to this lead.</p>
            </div>
          </div>

          {lead.metadata ? (
            <pre className="code-block">{JSON.stringify(lead.metadata, null, 2)}</pre>
          ) : (
            <EmptyState text="No metadata available." />
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="page-header">
          <div>
            <h2 className="section-title">Activity Timeline</h2>
            <p className="section-subtitle">Most recent actions are shown first.</p>
          </div>
        </div>

        {!lead.activities?.length ? (
          <EmptyState text="No activity records available." />
        ) : (
          <div className="timeline">
            {lead.activities.map((activity) => (
              <div className="timeline-item" key={activity.id}>
                <strong>{activityLabel(activity.type)}</strong>
                <div style={{ marginTop: 4 }}>{activity.description}</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {formatDate(activity.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
