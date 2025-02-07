// note-taking-app/client/src/types/index.ts
export interface TranscriptionResponse {
  transcription: string;
}

export interface SummaryResponse {
  summary: string;
  keywords: string[];
}



// interface VoiceRecorderProps {
//   onTranscriptionComplete: (transcription: string) => void;
// }