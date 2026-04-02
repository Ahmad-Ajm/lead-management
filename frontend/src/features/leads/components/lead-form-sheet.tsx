"use client";

import { useEffect, useMemo, useState } from "react";
import { LEAD_SOURCES, LEAD_STAGES } from "../constants";
import { Lead, LeadPayload } from "../types";
import { sourceLabel, stageLabel } from "@/lib/format";

type Props = {
  lead?: Lead | null;
  open: boolean;
  pending?: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (payload: LeadPayload) => void;
};

const emptyPayload: LeadPayload = {
  name: "",
  email: "",
  phone: "",
  source: "manual",
  stage: "new",
  assigned_to: null,
  notes: "",
  metadata: null,
};

export function LeadFormSheet({
  lead,
  open,
  pending,
  title,
  onClose,
  onSubmit,
}: Props) {
  const initialState = useMemo<LeadPayload>(() => {
    if (!lead) return emptyPayload;

    return {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      stage: lead.stage,
      assigned_to: lead.assigned_to,
      notes: lead.notes,
      metadata: lead.metadata,
    };
  }, [lead]);

  const [form, setForm] = useState<LeadPayload>(initialState);

  useEffect(() => {
    if (open) {
      setForm(initialState);
    }
  }, [initialState, open]);

  if (!open) return null;

  function updateField<Key extends keyof LeadPayload>(key: Key, value: LeadPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      ...form,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
      notes: form.notes?.trim() || null,
    });
  }

  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-panel" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <div>
            <h2>{title}</h2>
            <p className="section-subtitle">
              Manage the lead profile without touching the backend structure.
            </p>
          </div>

          <button className="btn ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="grid grid-2" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Lead name"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              value={form.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="lead@example.com"
            />
          </label>

          <label className="field">
            <span className="field-label">Phone</span>
            <input
              className="input"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+971 50 123 4567"
            />
          </label>

          <label className="field">
            <span className="field-label">Source</span>
            <select
              className="select"
              value={form.source}
              onChange={(event) => updateField("source", event.target.value)}
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {sourceLabel(source)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Stage</span>
            <select
              className="select"
              value={form.stage}
              onChange={(event) => updateField("stage", event.target.value)}
            >
              {LEAD_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stageLabel(stage)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Assigned User ID</span>
            <input
              className="input"
              type="number"
              min="1"
              value={form.assigned_to ?? ""}
              onChange={(event) =>
                updateField(
                  "assigned_to",
                  event.target.value ? Number(event.target.value) : null
                )
              }
              placeholder="Optional"
            />
          </label>

          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span className="field-label">Notes</span>
            <textarea
              className="textarea"
              value={form.notes ?? ""}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Add context, follow-up notes, or source details..."
            />
          </label>

          <div className="inline" style={{ gridColumn: "1 / -1", justifyContent: "end" }}>
            <button className="btn secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
