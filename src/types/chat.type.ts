export interface Conversation {
  id: number;
  title: string | null;
  createdAt: string;
}

export interface Message {
  id: string | number;
  role: "USER" | "AI";
  content: string;
  createdAt?: string;
}

export interface ConversationDetail {
  id: number;
  title: string | null;
  messages: Message[];
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
