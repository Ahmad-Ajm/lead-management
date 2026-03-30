"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnrichLeadMutation, useLeadQuery, useUpdateLeadMutation } from "@/features/leads/hooks";
import { ErrorState, LoadingState, EmptyState } from "@/components/shared/state";
import { StageBadge } from "@/components/shared/stage-badge";
import { formatDate } from "@/lib/format";
export default function LeadDetailPage(){ const params=useParams<{id:string}>(); const id=params.id; const leadQuery=useLeadQuery(id); const updateMutation=useUpdateLeadMutation(); const enrichMutation=useEnrichLeadMutation(Number(id)); const [notes,setNotes]=useState("");
useEffect(()=>{ if(leadQuery.data) setNotes(leadQuery.data.notes||""); },[leadQuery.data]);
if(leadQuery.isLoading) return <div className="container"><LoadingState text="Loading lead..." /></div>;
if(leadQuery.isError || !leadQuery.data) return <div className="container"><ErrorState message="Failed to load this lead." /></div>;
const lead=leadQuery.data; const enrichment=(lead.metadata?.enrichment ?? null) as Record<string,unknown>|null;
return <div className="container"><div className="page-header"><div><h1>{lead.name}</h1><div className="inline"><span className="muted">Lead #{lead.id}</span><StageBadge stage={lead.stage} /></div></div><button className="btn" onClick={()=>enrichMutation.mutate()} disabled={enrichMutation.isPending}>{enrichMutation.isPending?"Enriching...":"Enrich Lead"}</button></div>
<div className="grid grid-2"><div className="card"><h2 className="section-title">Lead Information</h2><div className="grid"><div><strong>Email:</strong> {lead.email||"—"}</div><div><strong>Phone:</strong> {lead.phone||"—"}</div><div><strong>Source:</strong> {lead.source}</div><div><strong>Assigned User:</strong> {lead.assigned_user?.name||"Unassigned"}</div><div><strong>Created At:</strong> {formatDate(lead.created_at)}</div><div><strong>Updated At:</strong> {formatDate(lead.updated_at)}</div></div></div>
<div className="card"><h2 className="section-title">Notes</h2><textarea className="textarea" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Write notes here..." /><div className="inline" style={{marginTop:12}}><button className="btn" onClick={()=>updateMutation.mutate({...lead,notes})} disabled={updateMutation.isPending}>{updateMutation.isPending?"Saving...":"Save Notes"}</button></div></div>
<div className="card"><h2 className="section-title">Enrichment Data</h2>{enrichment?<pre className="code-block">{JSON.stringify(enrichment,null,2)}</pre>:<EmptyState text="No enrichment data yet." />}</div>
<div className="card"><h2 className="section-title">Metadata</h2>{lead.metadata?<pre className="code-block">{JSON.stringify(lead.metadata,null,2)}</pre>:<EmptyState text="No metadata available." />}</div></div>
<div className="card" style={{marginTop:16}}><h2 className="section-title">Activity Timeline</h2>{!lead.activities?.length?<EmptyState text="No activity records available." />:<div className="timeline">{lead.activities.map((a)=><div className="timeline-item" key={a.id}><div><strong>{a.type}</strong></div><div>{a.description}</div><div className="muted">{formatDate(a.created_at)}</div></div>)}</div>}</div></div>; }
