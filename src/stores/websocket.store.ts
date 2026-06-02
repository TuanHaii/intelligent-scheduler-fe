import { create } from "zustand";
import { wsScheduleService } from "@/lib/websocket.service";
import type { Schedule } from "@/types/schedule.type";

export interface ScheduleUpdatePayload {
  type: "CREATE" | "UPDATE" | "DELETE";
  schedule: Schedule;
}

interface WebSocketState {
  connected: boolean;
  connectionStatus: "connected" | "disconnected" | "reconnecting";

  connect: () => void;
  disconnect: () => void;
  refreshToken: () => void;
  _init: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  connectionStatus: "disconnected",

  connect: () => {
    wsScheduleService.connect();
  },

  disconnect: () => {
    wsScheduleService.disconnect();
    set({ connected: false, connectionStatus: "disconnected" });
  },

  refreshToken: () => {
    wsScheduleService.refreshToken();
  },

  _init: () => {
    wsScheduleService.setOnStatusChange((status) => {
      set({ connected: status === "connected", connectionStatus: status });
    });
  },
}));
