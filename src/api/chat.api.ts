import apiClient from "./axios";
import type { ApiResponse, Conversation, ConversationDetail } from "@/types/chat.type";

export const createConversationApi = async (title: string) => {
  const { data } = await apiClient.post<ApiResponse<Conversation>>(
    "/conversations",
    { title }
  );
  return data;
};

export const getConversationsApi = async () => {
  const { data } = await apiClient.get<ApiResponse<Conversation[]>>(
    "/conversations"
  );
  return data;
};

export const getConversationDetailApi = async (id: number) => {
  const { data } = await apiClient.get<ApiResponse<ConversationDetail>>(
    `/conversations/${id}`
  );
  return data;
};

export interface SendMessageResponse {
  reply: string;
}

export const sendMessageApi = async (
  conversationId: number,
  message: string
) => {
  const { data } = await apiClient.post<ApiResponse<SendMessageResponse>>(
    "/chat/ask",
    { conversationId, message }
  );
  return data;
};
