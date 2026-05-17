import { apiClient } from './apiClient';
import type { CreateDocumentRequest, DocumentListItem } from './types';

export async function getDocuments(): Promise<DocumentListItem[]> {
  const { data } = await apiClient.get<DocumentListItem[]>('/api/documents');
  return data;
}

export async function createDocument(request: CreateDocumentRequest): Promise<DocumentListItem> {
  const { data } = await apiClient.post<DocumentListItem>('/api/documents', request);
  return data;
}

export async function uploadDocument(title: string, file: File): Promise<DocumentListItem> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);

  const { data } = await apiClient.post<DocumentListItem>('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/api/documents/${id}`);
}
