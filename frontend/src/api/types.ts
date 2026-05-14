export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest;

export type DocumentListItem = {
  id: string;
  title: string;
  createdAtUtc: string;
  chunkCount: number;
};

export type CreateDocumentRequest = {
  title: string;
  content: string;
};

export type ContextChunk = {
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  score: number;
};

export type AskQuestionRequest = {
  question: string;
};

export type AskQuestionResponse = {
  answer: string;
  contextUsed?: ContextChunk[];
};

export type ChatMessage = {
  id: string;
  question: string;
  answer: string;
  createdAtUtc: string;
};
