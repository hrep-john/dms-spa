import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetDashboard(payload: any) {
    const response = await api.get(`api/dashboard`, {
      params: payload,
    })

    return response.data
  },
}

export default { actions }
