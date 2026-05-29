export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  tenant_id: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
}

export interface Citation {
  document_id: string;
  filename: string;
  page_number?: number;
  chunk_id?: string;
  snippet: string;
}

export interface Message {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface DocumentInfo {
  id: string;
  tenant_id: string;
  filename: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  chunk_count: number;
  created_at: string;
}
