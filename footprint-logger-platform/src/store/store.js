import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/authSlice'
import activitiesReducer from '../store/activitiesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
  },
})
