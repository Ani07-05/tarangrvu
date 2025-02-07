// note-taking-app/client/src/App.tsx
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NoteTaking from './components/NoteTaking';
import Summarization from './components/Summarization';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { user } = useAuth();
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Router>
      <Container maxWidth="lg">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              user ? (
                <Box sx={{ width: '100%', mt: 4 }}>
                  <Tabs value={value} onChange={handleChange}>
                    <Tab label="Note Taking" />
                    <Tab label="Summarization" />
                  </Tabs>
                  <Box sx={{ mt: 2 }}>
                    {value === 0 && <NoteTaking />}
                    {value === 1 && <Summarization />}
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
