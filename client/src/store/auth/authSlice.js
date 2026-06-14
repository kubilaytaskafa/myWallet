import { createSlice } from '@reduxjs/toolkit'

const storedUser = localStorage.getItem('wallet_user')
const storedToken = localStorage.getItem('wallet_token')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('wallet_user', JSON.stringify(user))
      localStorage.setItem('wallet_token', token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('wallet_user')
      localStorage.removeItem('wallet_token')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
