"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Lead, PaginatedResponse } from "../types";

const STAGES = ["new", "contacted", "follow_up", "assigned", "converted", "lost"] as const;

type KanbanData = Record<string, Lead[]>;

function emptyBoard(): KanbanData {
  return {
    new: [],
    contacted: [],
    follow_up: [],
    assigned: [],
    converted: [],
    lost: [],
  };
}

export function useKanbanLeadsQuery() {
  return useQuery({
    queryKey: ["kanban-leads"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Lead>>("/leads", {
        params: {
          page: 1,
          sort_by: "created_at",
          sort_dir: "desc",
        },
      });

      const board = emptyBoard();

      for (const lead of response.data.data) {
        const stage = STAGES.includes(lead.stage as (typeof STAGES)[number])
          ? lead.stage
          : "new";

        board[stage].push(lead);
      }

      return board;
    },
  });
}
