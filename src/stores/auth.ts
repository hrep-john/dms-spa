import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleLogin(payload: object) {
    const response = await api.post(`api/auth/login`, payload)

    return response.data
  },

  async handleLogout(payload: object) {
    const response = await api.post(`api/auth/logout`, payload)

    return response.data
  },

  async handleForgotPassword(payload: object) {
    const response = await api.post(`api/auth/forgot-password`, payload)

    return response.data
  },

  async handleResetPassword(payload: object) {
    const response = await api.post(`api/auth/reset-password`, payload)

    return response.data
  },
}

export default { actions }
