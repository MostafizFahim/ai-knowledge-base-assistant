import { apiClient } from './apiClient';
import type { AskQuestionRequest, AskQuestionResponse, ChatMessage } from './types';

export async function askQuestion(request: AskQuestionRequest): Promise<AskQuestionResponse> {
  const { data } = await apiClient.post<AskQuestionResponse>('/api/chat/ask', request);
  return data;
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const { data } = await apiClient.get<ChatMessage[]>('/api/chat/history');
  return data;
}
