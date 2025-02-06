// note-taking-app/client/src/components/VoiceRecorder.tsx
// src/components/VoiceRecorder.tsx
import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import { Mic, Stop } from '@mui/icons-material';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    mediaRecorderOptions: {
      mimeType: 'audio/webm;codecs=opus'
    },
    onStop: async (_, blob) => {
      const audioFile = new File([blob], "recording.webm", {
        type: "audio/webm"
      });

      setIsProcessing(true);
      setError(null);
      const formData = new FormData();
      formData.append("audio", audioFile);

      try {
        console.log("🔹 Sending audio file:", audioFile);

        const response = await fetch("http://localhost:5000/api/notes/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to transcribe audio');
        }

        const data = await response.json();
        console.log("✅ Transcription response:", data);

        if (data.transcription) {
          onTranscriptionComplete(data.transcription);
        } else {
          throw new Error("No transcription in response");
        }
      } catch (error) {
        console.error("❌ Transcription error:", error);
        setError(error instanceof Error ? error.message : 'Error transcribing audio');
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const isRecording = status === "recording";
  const buttonDisabled = isProcessing;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2, 
      alignItems: 'center',
      padding: 2 
    }}>
      <Button 
        variant="contained"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={buttonDisabled}
        startIcon={isRecording ? <Stop /> : <Mic />}
        color={isRecording ? "error" : "primary"}
        sx={{ minWidth: 200 }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        minHeight: '24px' 
      }}>
        {isProcessing && <CircularProgress size={20} />}
        <Typography color={error ? "error" : "text.secondary"}>
          {error ? error : isProcessing 
            ? "Processing..." 
            : isRecording 
              ? "Recording in progress..." 
              : "Ready to record"}
        </Typography>
      </Box>
    </Box>
  );
};

export default VoiceRecorder;
