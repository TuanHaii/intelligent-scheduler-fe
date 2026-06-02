import { Client, type IFrame, type IMessage } from "@stomp/stompjs";

export function getWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const origin = new URL(apiUrl).origin;
  const url = import.meta.env.VITE_WS_URL || `${origin.replace(/^http/, "ws")}/ws`;
  if (!url.endsWith("/ws")) {
    console.warn("[WS] URL does not end with /ws:", url);
  }
  return url;
}

type MessageHandler = (body: unknown, headers?: Record<string, string>) => void;
type StatusChangeHandler = (status: "connected" | "disconnected" | "reconnecting") => void;

interface Subscription {
  destination: string;
  handler: MessageHandler;
  stompSub: { id: string } | null;
}

function createWebSocketService() {
  let client: Client | null = null;
  let currentToken: string | null = null;
  let currentWsUrl: string = "";
  let retryCount = 0;
  let maxRetryDelay = 30000;
  let onStatusChange: StatusChangeHandler | null = null;

  const subscriptions: Subscription[] = [];

  function getBackoffDelay(): number {
    const delay = Math.min(1000 * Math.pow(2, retryCount), maxRetryDelay);
    return delay + Math.random() * 1000;
  }

  function subscribeOnClient(destination: string, handler: MessageHandler) {
    if (!client?.connected) return null;
    const stompSub = client.subscribe(destination, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        handler(body, message.headers);
      } catch {
        console.error(`[WS] Failed to parse message from ${destination}:`, message.body);
      }
    });
    return stompSub;
  }

  function resubscribeAll() {
    if (!client?.connected) return;
    for (const sub of subscriptions) {
      sub.stompSub = subscribeOnClient(sub.destination, sub.handler);
    }
  }

  function subscribe(destination: string, handler: MessageHandler) {
    const existing = subscriptions.find((s) => s.destination === destination);
    if (existing) {
      existing.handler = handler;
      if (client?.connected && existing.stompSub) {
        existing.stompSub = subscribeOnClient(destination, handler);
      }
      return;
    }
    const sub: Subscription = { destination, handler, stompSub: null };
    sub.stompSub = subscribeOnClient(destination, handler);
    subscriptions.push(sub);
  }

  function unsubscribe(destination: string) {
    const idx = subscriptions.findIndex((s) => s.destination === destination);
    if (idx !== -1) {
      const [sub] = subscriptions.splice(idx, 1);
      if (sub.stompSub) {
        client?.unsubscribe(sub.stompSub.id);
      }
    }
  }

  function connect() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (client?.active) {
      if (token !== currentToken) {
        refreshToken();
      }
      return;
    }

    currentToken = token;
    currentWsUrl = getWsUrl();

    console.log("[WS-Schedule] Connecting to:", currentWsUrl);

    client = new Client({
      brokerURL: currentWsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        authorization: `Bearer ${token}`,
      },
      reconnectDelay: getBackoffDelay(),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: (_frame: IFrame) => {
        retryCount = 0;
        console.log("[WS-Schedule] STOMP connected");
        onStatusChange?.("connected");
        resubscribeAll();
      },

      onDisconnect: () => {
        console.log("[WS-Schedule] Disconnected");
        onStatusChange?.("disconnected");
      },

      onStompError: (frame: IFrame) => {
        console.error("[WS-Schedule] STOMP error:", frame.headers?.message || "(no message)", frame.body);
        onStatusChange?.("disconnected");
      },

      onWebSocketError: (event: Event) => {
        console.error("[WS-Schedule] WebSocket error:", event);
      },

      onWebSocketClose: (event: CloseEvent) => {
        retryCount++;
        onStatusChange?.("reconnecting");
        console.log(`[WS-Schedule] Closed: code=${event.code}, retry=${retryCount}, delay=${Math.round(getBackoffDelay() / 1000)}s`);
      },
    });

    client.activate();
  }

  function disconnect() {
    subscriptions.length = 0;
    retryCount = 0;
    if (client) {
      client.deactivate();
      client = null;
    }
    currentToken = null;
    currentWsUrl = "";
  }

  function refreshToken() {
    const newToken = localStorage.getItem("accessToken");
    if (!newToken) {
      disconnect();
      return;
    }
    currentToken = newToken;
    if (client) {
      client.deactivate();
      client = null;
    }
    connect();
  }

  function isConnected(): boolean {
    return client?.connected ?? false;
  }

  function setOnStatusChange(handler: StatusChangeHandler | null) {
    onStatusChange = handler;
  }

  return { connect, disconnect, subscribe, unsubscribe, refreshToken, isConnected, setOnStatusChange };
}

export const wsScheduleService = createWebSocketService();
