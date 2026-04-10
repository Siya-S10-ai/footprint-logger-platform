// Redux Toolkit helpers for async actions and slice definition
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Base API URL for server requests
const API_URL = 'http://localhost:5000/api'

// Load any persisted auth state from localStorage
const storedAuth = JSON.parse(localStorage.getItem('footprint-auth') || 'null')

// Persist auth data for session continuity
const persistAuth = (payload) => {
  localStorage.setItem('footprint-auth', JSON.stringify(payload))
}

// Remove auth data on logout
const clearPersistedAuth = () => {
  localStorage.removeItem('footprint-auth')
}

/*
  Async thunk to register a new user.
  On success, returns { token, user }.
*/
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

/*
  Async thunk to log in an existing user.
  On success, returns { token, user }.
*/
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed')
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

/*
  Auth slice handles:
  - current user and token
  - async status and error messages
*/
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedAuth?.user || null,
    token: storedAuth?.token || '',
    status: 'idle',
    error: '',
  },
  reducers: {
    // Clear session state and persisted data
    logout(state) {
      state.user = null
      state.token = ''
      state.error = ''
      clearPersistedAuth()
    },
  },
  extraReducers: (builder) => {
    builder
      // Register flow
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = ''
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        persistAuth(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
      })
      // Login flow
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        persistAuth(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })
  },
})

// Export the logout action and the reducer
export const { logout } = authSlice.actions
export default authSlice.reducer
