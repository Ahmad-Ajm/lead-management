"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState, EmptyState, LoadingState } from "@/components/shared/state";
import { StageBadge } from "@/components/shared/stage-badge";
import { useLeadStatsQuery, useLeadsQuery } from "@/features/leads/hooks";
import { formatDate, sourceLabel, stageLabel } from "@/lib/format";

const colors = ["#c26a2d", "#0f766e", "#d97706", "#2563eb", "#7c3aed", "#b42318"];

export default function DashboardPage() {
  const statsQuery = useLeadStatsQuery();
  const recentQuery = useLeadsQuery({
    page: 1,
    sort_by: "created_at",
    sort_dir: "desc",
  });

  if (statsQuery.isLoading || recentQuery.isLoading) {
    return (
      <div className="container">
        <LoadingState text="Loading dashboard..." />
      </div>
    );
  }

  if (statsQuery.isError || recentQuery.isError) {
    return (
      <div className="container">
        <ErrorState message="Failed to load dashboard data." />
      </div>
    );
  }

  const stats = statsQuery.data!;
  const recent = recentQuery.data!.data.slice(0, 5);
  const stageData = Object.entries(stats.by_stage).map(([name, value]) => ({
    name: stageLabel(name),
    value,
  }));
  const sourceData = Object.entries(stats.by_source).map(([name, value]) => ({
    name: sourceLabel(name),
    value,
  }));

  return (
    <div className="container">
      <section className="hero">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1>Lead Dashboard</h1>
            <p>
              Track total pipeline volume, source mix, and the newest opportunities in one place.
            </p>
          </div>

          <div className="inline">
            <Link href="/leads" className="btn">
              Open leads
            </Link>
            <Link href="/leads/kanban" className="btn ghost">
              Open kanban
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-4">
        <div className="card stats-card">
          <div className="stats-label">Total leads</div>
          <div className="stat-value">{stats.total}</div>
          <div className="muted">Across all sources and stages.</div>
        </div>

        {Object.entries(stats.by_stage)
          .slice(0, 3)
          .map(([stage, count]) => (
            <div className="card stats-card" key={stage}>
              <div className="stats-label">Current stage</div>
              <div className="inline" style={{ justifyContent: "space-between" }}>
                <StageBadge stage={stage} />
                <strong style={{ fontSize: "1.6rem" }}>{count}</strong>
              </div>
              <div className="muted">Leads currently sitting in this step.</div>
            </div>
          ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Leads by Stage</h2>
              <p className="section-subtitle">A quick snapshot of pipeline balance.</p>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#c26a2d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="page-header">
            <div>
              <h2 className="section-title">Leads by Source</h2>
              <p className="section-subtitle">See which channels are contributing the most.</p>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {sourceData.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="page-header">
          <div>
            <h2 className="section-title">Recent Leads</h2>
            <p className="section-subtitle">Newest leads added to the system.</p>
          </div>
          <Link href="/leads" className="btn ghost">
            View full list
          </Link>
        </div>

        {!recent.length ? (
          <EmptyState text="No leads found." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Stage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <td>#{lead.id}</td>
                    <td>
                      <Link href={`/leads/${lead.id}`} className="btn ghost">
                        {lead.name}
                      </Link>
                    </td>
                    <td>{sourceLabel(lead.source)}</td>
                    <td>
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td>{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
