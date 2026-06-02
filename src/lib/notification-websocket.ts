import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import type { Notification } from "@/types/notification.type";

export function getWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const origin = new URL(apiUrl).origin;
  const url = import.meta.env.VITE_WS_URL || `${origin.replace(/^http/, "ws")}/ws`;
  if (!url.endsWith("/ws")) {
    console.warn("[WS] URL does not end with /ws:", url);
  }
  return url;
}

interface NotificationWebSocketCallbacks {
  onNotification: (notification: Notification) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
}

function createWebSocketService() {
  let client: Client | null = null;
  let callbacks: NotificationWebSocketCallbacks | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let currentToken: string | null = null;
  let currentWsUrl: string = "";

  function ensureClient(cbs: NotificationWebSocketCallbacks) {
    if (client?.active) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    currentToken = token;
    currentWsUrl = getWsUrl();

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
    const apiOrigin = new URL(apiUrl).origin;

    console.group("[WS] Connecting...");
    console.log("VITE_API_URL     =", apiUrl);
    console.log("API_ORIGIN       =", apiOrigin);
    console.log("VITE_WS_URL      =", import.meta.env.VITE_WS_URL || "(not set)");
    console.log("WEBSOCKET_URL    =", currentWsUrl);
    console.log("token exists     =", !!token);
    console.groupEnd();

    client = new Client({
      brokerURL: currentWsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: (frame: IFrame) => {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        const principal = frame.headers?.["user-name"] || client?.connected || "unknown";
        console.log("✅ STOMP connected, principal:", frame.headers?.["user-name"] || "(not in header)");
        console.log("[WS] STOMP CONNECTED frame headers:", frame.headers);
        callbacks?.onConnect();

        client?.subscribe("/user/queue/notifications", (message: IMessage) => {
          try {
            const payload: Notification = JSON.parse(message.body);
            console.log("[WS] Received notification:", payload.id, payload.type);
            callbacks?.onNotification(payload);
          } catch {
            console.error("[WS] Failed to parse message body:", message.body);
          }
        });
      },

      onDisconnect: () => {
        console.log("[WS] Disconnected");
        callbacks?.onDisconnect();
      },

      onStompError: (frame: IFrame) => {
        console.error("[WS] STOMP error:", frame.headers?.message || "(no message)", frame.body);
        callbacks?.onDisconnect();
      },

      onWebSocketError: (event: Event) => {
        console.error("[WS] WebSocket error event:", event);
      },

      onWebSocketClose: (event: CloseEvent) => {
        console.log(`[WS] Connection closed: code=${event.code}, reason=${event.reason || "(none)"}, wasClean=${event.wasClean}`);
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log("[WS] Attempting reconnect...");
            callbacks?.onReconnect();
          }, 1000);
        }
      },
    });

    client.activate();
  }

  function connect(cbs: NotificationWebSocketCallbacks) {
    callbacks = cbs;

    if (client?.active) {
      return;
    }

    ensureClient(cbs);
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (client) {
      client.deactivate();
      client = null;
    }
    currentToken = null;
    currentWsUrl = "";
    callbacks = null;
  }

  function refreshToken() {
    const newToken = localStorage.getItem("accessToken");
    if (newToken === currentToken && client?.active) return;
    if (client) {
      client.deactivate();
      client = null;
    }
    currentToken = null;
    if (newToken && callbacks) {
      ensureClient(callbacks);
    }
  }

  return { connect, disconnect, refreshToken };
}

export const notificationWebSocketService = createWebSocketService();
