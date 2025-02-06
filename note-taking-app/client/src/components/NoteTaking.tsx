// note-taking-app/client/src/components/NoteTaking.tsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography
} from '@mui/material';
import { Save, Delete, Edit, Download } from '@mui/icons-material';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import VoiceRecorder from './VoiceRecorder';
import { useAuth } from '../context/AuthContext';

const NoteTaking: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Fetch notes from server
  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSavedNotes(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching notes:', error.response?.data || error.message);
      } else {
        console.error('Error fetching notes:', error);
      }
    }
  };

  // Handle transcription from voice input
  const handleTranscription = (transcription: string) => {
    setNotes((prev) => prev + '\n' + transcription);
  };

  // Save or update note
  const saveNote = async () => {
    if (!title.trim() || !notes.trim()) {
      alert('Title and content cannot be empty!');
      return;
    }

    try {
      if (editNoteId) {
        await axios.put(
          `http://localhost:5000/api/notes/${editNoteId}`,
          { title, content: notes, summary: '', keywords: [], language: 'English' },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/notes',
          { title, content: notes, summary: '', keywords: [], language: 'English' },
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
      }

      setTitle('');
      setNotes('');
      setEditNoteId(null);
      fetchNotes();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error saving note:', error.response?.data || error.message);
      } else {
        console.error('Error saving note:', error);
      }
    }
  };

  // Delete note
  const deleteNote = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      fetchNotes();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting note:', error.response?.data || error.message);
      } else {
        console.error('Error deleting note:', error);
      }
    }
  };

  // Edit existing note
  const editNote = (note: any) => {
    setEditNoteId(note.id);
    setTitle(note.title);
    setNotes(note.content);
  };

  // Download note as PDF
  const downloadAsPDF = (note: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title, 10, 10);
    doc.setFontSize(12);
    doc.text(note.content, 10, 20);
    doc.save(`${note.title}.pdf`);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {editNoteId ? 'Edit Note' : 'Take Notes'}
      </Typography>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <VoiceRecorder onTranscriptionComplete={handleTranscription} />
      <TextField
        fullWidth
        multiline
        rows={5}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Start taking notes..."
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={saveNote} startIcon={<Save />} sx={{ mb: 2 }}>
        {editNoteId ? 'Update Note' : 'Save Note'}
      </Button>

      <Typography variant="h6">Saved Notes</Typography>
      <List>
        {savedNotes.map((note) => (
          <ListItem key={note.id} sx={{ borderBottom: '1px solid #ddd' }}>
            <ListItemText
              primary={note.title}
              secondary={note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content}
            />
            <IconButton onClick={() => downloadAsPDF(note)} color="primary">
              <Download />
            </IconButton>
            <IconButton onClick={() => editNote(note)} color="primary">
              <Edit />
            </IconButton>
            <IconButton onClick={() => deleteNote(note.id)} color="error">
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NoteTaking;
