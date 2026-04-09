import { createAsyncThunk, createSlice } from '@reduxjs/toolkit' // Redux Toolkit helpers for async thunks and slices

const API_URL = 'http://localhost:5000/api' // Base API URL for all activity endpoints
const storedLocalActivities = JSON.parse(
  localStorage.getItem('footprint-local-activities') || '[]', // Fallback to empty list if nothing stored
)

const persistLocalActivities = (activities) => {
  // Persist local-only activities for offline use and refreshes
  localStorage.setItem('footprint-local-activities', JSON.stringify(activities))
}

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities', // Action type prefix used by Redux Toolkit
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/activities`, {
        headers: { Authorization: `Bearer ${token}` }, // Send auth token for protected endpoint
      })
      const data = await response.json() // Parse JSON payload from the server
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to load activities') // Provide a friendly error
      }
      return data // Pass activities array to the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message) // Normalize network or parsing errors
    }
  },
)

export const createActivity = createAsyncThunk(
  'activities/createActivity', // Action type prefix for activity creation
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/activities`, {
        method: 'POST', // Create a new activity
        headers: {
          'Content-Type': 'application/json', // Inform server we are sending JSON
          Authorization: `Bearer ${token}`, // Include auth token
        },
        body: JSON.stringify(payload), // Serialize activity data
      })
      const data = await response.json() // Parse the created activity from the response
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create activity') // Surface server error
      }
      return data // Return created activity to reducer
    } catch (error) {
      return rejectWithValue(error.message) // Normalize network or parsing errors
    }
  },
)

export const fetchDashboard = createAsyncThunk(
  'activities/fetchDashboard', // Action type prefix for dashboard summary
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }, // Auth header for summary endpoint
      })
      const data = await response.json() // Parse dashboard summary JSON
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to load dashboard') // Provide a friendly error
      }
      return data // Return summary data to reducer
    } catch (error) {
      return rejectWithValue(error.message) // Normalize network or parsing errors
    }
  },
)

export const updateWeeklyGoal = createAsyncThunk(
  'activities/updateWeeklyGoal', // Action type prefix for goal updates
  async ({ token, weeklyGoalKg }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/goal`, {
        method: 'PATCH', // Update only the weekly goal
        headers: {
          'Content-Type': 'application/json', // JSON payload
          Authorization: `Bearer ${token}`, // Auth header for protected endpoint
        },
        body: JSON.stringify({ weeklyGoalKg }), // Send the new goal
      })
      const data = await response.json() // Parse updated goal response
      if (!response.ok) {
        return rejectWithValue(data.message || 'Goal update failed') // Surface server error
      }
      return data // Return updated goal payload
    } catch (error) {
      return rejectWithValue(error.message) // Normalize network or parsing errors
    }
  },
)

const activitiesSlice = createSlice({
  name: 'activities', // Slice name used in action types
  initialState: {
    serverActivities: [], // Activities loaded from the API
    localActivities: storedLocalActivities, // Offline activities stored in localStorage
    dashboard: null, // Summary data for dashboard view
    filter: 'all', // Current UI filter
    status: 'idle', // Async request status
    error: '', // Error message for failed requests
  },
  reducers: {
    addLocalActivity(state, action) {
      state.localActivities.unshift(action.payload) // Prepend the local activity
      persistLocalActivities(state.localActivities) // Keep localStorage in sync
    },
    setFilter(state, action) {
      state.filter = action.payload // Update active filter in UI state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading' // Show loading state while fetching
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'succeeded' // Mark request as successful
        state.serverActivities = action.payload // Replace server activities list
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = 'failed' // Mark request as failed
        state.error = action.payload || 'Could not fetch activities' // Capture error message
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.serverActivities.unshift(action.payload) // Optimistically prepend new activity
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload // Store dashboard summary
      })
      .addCase(updateWeeklyGoal.fulfilled, (state, action) => {
        if (state.dashboard) {
          state.dashboard.goal = action.payload.weeklyGoalKg // Update goal without refetch
        }
      })
  },
})

export const { addLocalActivity, setFilter } = activitiesSlice.actions // Export slice actions
export default activitiesSlice.reducer // Export reducer for store setup
