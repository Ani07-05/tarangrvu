"use client"

import type React from "react"
import { useState } from "react"
import { Paper, TextField, Button, Typography, Box, Alert } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const Login: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      })

      login(response.data)
      navigate("/notes")
    } catch (error) {
      setError("Invalid username or password")
    }
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            variant="filled"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            variant="filled"
          />
          <Button fullWidth variant="contained" type="submit" sx={{ mb: 2, py: 1.5 }}>
            Login
          </Button>
        </form>

        <Typography variant="body2" align="center">
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#0070f3" }}>
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Login

