// note-taking-app/server/routes/notes.js
import express from 'express';

const router = express.Router();

// Get all notes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const notes = await req.db.all(
      `SELECT 
        id, title, content, summary, 
        json_extract(keywords, '$') as keywords,
        language, created_at 
       FROM notes 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      req.user.id
    );

    const formattedNotes = notes.map(note => ({
      ...note,
      keywords: JSON.parse(note.keywords || '[]')
    }));

    res.json(formattedNotes);
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const { title, content, summary, keywords, language } = req.body;
  
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const result = await req.db.run(
      `INSERT INTO notes (
        user_id, title, content, summary, 
        keywords, language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        req.user.id,
        title.trim(),
        content,
        summary,
        JSON.stringify(keywords || []),
        language || 'English'
      ]
    );

    const note = await req.db.get(
      `SELECT 
        id, title, content, summary, 
        json_extract(keywords, '$') as keywords,
        language, created_at 
       FROM notes 
       WHERE id = ?`,
      result.lastID
    );

    note.keywords = JSON.parse(note.keywords || '[]');
    
    res.json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/', async (req, res) => {
  const { title, content, summary, keywords, language } = req.body;
  
  try {
    const existingNote = await req.db.get(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await req.db.run(
      `UPDATE notes 
       SET title = ?, content = ?, summary = ?, 
           keywords = ?, language = ? 
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        content,
        summary,
        JSON.stringify(keywords || []),
        language || 'English',
        req.params.id,
        req.user.id
      ]
    );

    

    const updatedNote = await req.db.get(
      `SELECT 
        id, title, content, summary, 
        json_extract(keywords, '$') as keywords,
        language, created_at 
       FROM notes 
       WHERE id = ?`,
      req.params.id
    );

    updatedNote.keywords = JSON.parse(updatedNote.keywords || '[]');
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const result = await req.db.run(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
