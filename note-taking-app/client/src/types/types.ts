// note-taking-app/client/src/types/types.ts
export interface SummaryResponse {
  summary: string;
  keywords: string[];
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface User {
  username: string;
  token: string;
}