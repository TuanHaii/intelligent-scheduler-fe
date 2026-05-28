import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Message, Conversation } from "@/types/chat.type";
import {
  createConversationApi,
  getConversationsApi,
  getConversationDetailApi,
  sendMessageApi,
} from "@/api/chat.api";

interface ChatState {
  isOpen: boolean;
  showSidebar: boolean;
  conversations: Conversation[];
  activeConversationId: number | null;
  messagesByConversation: Record<number, Message[]>;
  isTyping: boolean;
  isLoadingConversations: boolean;
  isLoadingDetail: boolean;
}

type ChatAction =
  | { type: "TOGGLE_OPEN" }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: number }
  | {
      type: "ADD_MESSAGE";
      payload: { conversationId: number; message: Message };
    }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_LOADING_CONVERSATIONS"; payload: boolean }
  | {
      type: "SET_MESSAGES";
      payload: { conversationId: number; messages: Message[] };
    }
  | { type: "SET_LOADING_DETAIL"; payload: boolean };

const initialState: ChatState = {
  isOpen: false,
  showSidebar: window.innerWidth >= 768,
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  isTyping: false,
  isLoadingConversations: false,
  isLoadingDetail: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "TOGGLE_OPEN":
      return { ...state, isOpen: !state.isOpen };
    case "SET_OPEN":
      return { ...state, isOpen: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, showSidebar: !state.showSidebar };
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload };
    case "ADD_MESSAGE": {
      const { conversationId, message } = action.payload;
      const existing = state.messagesByConversation[conversationId] || [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, message],
        },
      };
    }
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_LOADING_CONVERSATIONS":
      return { ...state, isLoadingConversations: action.payload };
    case "SET_MESSAGES": {
      const { conversationId, messages } = action.payload;
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: messages,
        },
      };
    }
    case "SET_LOADING_DETAIL":
      return { ...state, isLoadingDetail: action.payload };
    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<number | null>;
  selectConversation: (id: number) => void;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const activeIdRef = useRef(state.activeConversationId);
  activeIdRef.current = state.activeConversationId;
  const stateRef = useRef(state);
  stateRef.current = state;
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toggleOpen = useCallback(() => dispatch({ type: "TOGGLE_OPEN" }), []);
  const setOpen = useCallback(
    (open: boolean) => dispatch({ type: "SET_OPEN", payload: open }),
    []
  );
  const toggleSidebar = useCallback(
    () => dispatch({ type: "TOGGLE_SIDEBAR" }),
    []
  );

  const fetchConversations = useCallback(async () => {
    if (!mountedRef.current) return;
    dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
    try {
      const res = await getConversationsApi();
      if (!mountedRef.current) return;
      const data = Array.isArray(res?.data) ? res.data : [];

      dispatch({ type: "SET_CONVERSATIONS", payload: data });

      if (data.length > 0) {
        const current = activeIdRef.current;
        const exists = data.some((c) => c.id === current);
        if (!current || !exists) {
          dispatch({
            type: "SET_ACTIVE_CONVERSATION",
            payload: data[0].id,
          });
        }
      } else {
        await createConversationInternal();
      }
    } catch {
      if (!mountedRef.current) return;
      dispatch({ type: "SET_CONVERSATIONS", payload: [] });
      toast.error("Không thể tải lịch sử chat");
    } finally {
      if (mountedRef.current) {
        dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: false });
      }
    }
  }, []);

  const createConversationInternal = useCallback(async () => {
    try {
      const res = await createConversationApi("New Conversation");
      if (!mountedRef.current) return null;
      dispatch({ type: "ADD_CONVERSATION", payload: res.data });
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: res.data.id });
      return res.data.id;
    } catch {
      if (mountedRef.current) {
        toast.error("Không thể tạo cuộc trò chuyện mới");
      }
      return null;
    }
  }, []);

  const fetchedConversationsRef = useRef<Set<number>>(new Set());

  const selectConversation = useCallback(async (id: number) => {
    fetchedConversationsRef.current.add(id);
    dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: id });
    dispatch({ type: "SET_LOADING_DETAIL", payload: true });

    try {
      const res = await getConversationDetailApi(id);
      if (!mountedRef.current) return;
      const rawMessages = res?.messages;
      const messages = Array.isArray(rawMessages) ? rawMessages : [];
      dispatch({
        type: "SET_MESSAGES",
        payload: { conversationId: id, messages },
      });
    } catch {
      if (!mountedRef.current) return;
      toast.error("Không thể tải chi tiết cuộc trò chuyện");
      dispatch({
        type: "SET_MESSAGES",
        payload: { conversationId: id, messages: [] },
      });
    } finally {
      if (mountedRef.current) {
        dispatch({ type: "SET_LOADING_DETAIL", payload: false });
      }
    }

    if (window.innerWidth < 768) {
      dispatch({ type: "TOGGLE_SIDEBAR" });
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      let conversationId = activeIdRef.current;

      if (!conversationId) {
        const newId = await createConversationInternal();
        if (!newId) return;
        conversationId = newId;
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "USER",
        content: text,
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: "ADD_MESSAGE",
        payload: { conversationId, message: userMsg },
      });
      dispatch({ type: "SET_TYPING", payload: true });

      try {
        await sendMessageApi(conversationId, text);
        if (!mountedRef.current) return;
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr?.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
        } else {
          toast.error("AI hiện đang bận, vui lòng thử lại sau");
        }
        dispatch({ type: "SET_TYPING", payload: false });
        return;
      }

      try {
        const detail = await getConversationDetailApi(conversationId);
        if (!mountedRef.current) return;
        const reloadedMessages = Array.isArray(detail?.messages) ? detail.messages : [];
        dispatch({
          type: "SET_MESSAGES",
          payload: { conversationId, messages: reloadedMessages },
        });
      } catch {
        if (mountedRef.current) {
          toast.error("Không thể tải tin nhắn mới nhất");
        }
      }

      fetchConversations();

      if (mountedRef.current) {
        dispatch({ type: "SET_TYPING", payload: false });
      }
    },
    [createConversationInternal, fetchConversations]
  );

  useEffect(() => {
    if (!state.isOpen) return;
    fetchConversations();
  }, [state.isOpen, fetchConversations]);

  useEffect(() => {
    const id = state.activeConversationId;
    if (id == null) return;
    if (fetchedConversationsRef.current.has(id)) return;
    fetchedConversationsRef.current.add(id);

    let cancelled = false;
    dispatch({ type: "SET_LOADING_DETAIL", payload: true });
    getConversationDetailApi(id)
      .then((res) => {
        if (cancelled) return;
        const rawMessages = res?.messages;
        const messages = Array.isArray(rawMessages) ? rawMessages : [];
        dispatch({
          type: "SET_MESSAGES",
          payload: { conversationId: id, messages },
        });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Không thể tải chi tiết cuộc trò chuyện");
        dispatch({
          type: "SET_MESSAGES",
          payload: { conversationId: id, messages: [] },
        });
      })
      .finally(() => {
        if (!cancelled) {
          dispatch({ type: "SET_LOADING_DETAIL", payload: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.activeConversationId]);

  const value: ChatContextValue = {
    state,
    toggleOpen,
    setOpen,
    toggleSidebar,
    fetchConversations,
    createConversation: createConversationInternal,
    selectConversation,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
