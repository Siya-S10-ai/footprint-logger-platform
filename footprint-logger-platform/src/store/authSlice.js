import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const API_URL = 'http://localhost:5000/api'

const storedAuth = JSON.parse(localStorage.getItem('footprint-auth') || 'null')

const persistAuth = (payload) => {
  localStorage.setItem('footprint-auth', JSON.stringify(payload))
}

const clearPersistedAuth = () => {
  localStorage.removeItem('footprint-auth')
}
