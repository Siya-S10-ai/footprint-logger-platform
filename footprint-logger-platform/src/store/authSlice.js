import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:5000/api'

const storedAuth = JSON.parse(localStorage.getItem('footprint-auth') || 'null')

const persistAuth = (payload) => {
  localStorage.setItem('footprint-auth', JSON.stringify(payload))
}

const clearPersistedAuth = () => {
  localStorage.removeItem('footprint-auth')
}

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed')
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

