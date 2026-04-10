// Redux Toolkit helper for configuring the store with good defaults
import { configureStore } from '@reduxjs/toolkit'

// Slice reducers for authentication and activities
import authReducer from '../store/authSlice'
import activitiesReducer from '../store/activitiesSlice'

/*
  Create the Redux store and register slice reducers.
  The keys become top-level state fields: state.auth and state.activities.
*/
export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
  },
})
