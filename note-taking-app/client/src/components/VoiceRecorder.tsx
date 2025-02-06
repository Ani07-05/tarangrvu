import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Button, Box, Typography } from "@mui/material";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

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
      const formData = new FormData();
      formData.append("audio", audioFile);

      try {
        console.log("🔹 Sending audio file:", audioFile);

        const response = await fetch("http://localhost:5000/api/notes/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
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
        alert("Error transcribing audio. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <Button 
        variant="contained"
        onClick={status === "recording" ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {status === "recording" ? "Stop Recording" : "Start Recording"}
      </Button>
      
      <Typography>
        Status: {isProcessing ? "Processing..." : status === "recording" ? "Recording..." : "Ready"}
      </Typography>
    </Box>
  );
};

export default VoiceRecorder;