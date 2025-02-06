// note-taking-app/client/src/components/Summarization.tsx
import type React from "react"
import { useState } from "react"
import {
  TextField,
  Button,
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  type SelectChangeEvent,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import type { SummaryResponse } from "../types"

interface SummaryRequest {
  text: string
  targetLength: string
  language: string
}

const Summarization: React.FC = () => {
  const { user } = useAuth()
  const [text, setText] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [language, setLanguage] = useState<string>("English")
  const [length, setLength] = useState<string>("brief")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize")
      return
    }

    setLoading(true)
    setError("")
    setSaveSuccess(false)

    try {
      const response = await axios.post<SummaryResponse>(
        "http://localhost:5000/api/summary/generate",
        {
          text,
          targetLength: length,
          language,
        } as SummaryRequest,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )

      setSummary(response.data.summary)
      setKeywords(response.data.keywords.filter((k) => k.trim()))
    } catch (error) {
      setError("Failed to generate summary")
      console.error("Summarization error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title for your note")
      return
    }

    try {
      await axios.post(
        "http://localhost:5000/api/notes",
        {
          title,
          content: text,
          summary,
          keywords,
          language,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )

      setSaveSuccess(true)
      setTitle("")
      setText("")
      setSummary("")
      setKeywords([])
    } catch (error) {
      setError("Failed to save note")
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Summarize Text
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Note saved successfully!
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          variant="filled"
          disabled={loading}
        />

        <TextField
          fullWidth
          multiline
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text to summarize..."
          sx={{ mb: 2 }}
          variant="filled"
          disabled={loading}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }} variant="filled">
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              onChange={(e: SelectChangeEvent) => setLanguage(e.target.value)}
              label="Language"
              disabled={loading}
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Hindi">Hindi</MenuItem>
              <MenuItem value="Kannada">Kannada</MenuItem>
              <MenuItem value="Spanish">Spanish</MenuItem>
              <MenuItem value="French">French</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} variant="filled">
            <InputLabel>Length</InputLabel>
            <Select
              value={length}
              onChange={(e: SelectChangeEvent) => setLength(e.target.value)}
              label="Length"
              disabled={loading}
            >
              <MenuItem value="brief">Brief</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="detailed">Detailed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ py: 1.5, px: 3 }}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </Button>
        </Box>

        {keywords.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Keywords:
            </Typography>
            {keywords.map((keyword, index) => (
              <Chip key={index} label={keyword} sx={{ mr: 1, mb: 1 }} color="primary" variant="outlined" />
            ))}
          </Box>
        )}

        {summary && (
          <>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={summary}
              InputProps={{ readOnly: true }}
              label="Summary"
              variant="filled"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={!title.trim()}
              sx={{ py: 1.5, px: 3 }}
            >
              Save Note
            </Button>
          </>
        )}
      </Paper>
    </Box>
  )
}

export default Summarization

