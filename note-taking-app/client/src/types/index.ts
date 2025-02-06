// note-taking-app/client/src/types/index.ts
export interface TranscriptionResponse {
  transcription: string;
}

export interface SummaryResponse {
  summary: string;
  keywords: string[];
}

// src/components/VoiceRecorder.tsx
import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button, Box } from '@mui/material';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
}