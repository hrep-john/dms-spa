import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetReportBuilders(payload: any) {
    const response = await api.get(`api/report-builders`, {
      params: payload,
    })

    return response.data
  },

  async handleShowReportBuilder(id: any) {
    const response = await api.get(`api/report-builders/${id}`)

    return response.data
  },

  async handleStoreReportBuilder(payload: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.post('/api/report-builders', payload, { headers: headers })

    return response.data
  },

  async handleUpdateReportBuilder(payload: any) {
    const id = payload.id
    delete payload.id

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.patch(`/api/report-builders/${id}`, payload, {
      headers: headers,
    })

    return response.data
  },

  async handleDeleteReportBuilder(id: any) {
    const response = await api.delete(`/api/report-builders/${id}`)

    return response.data
  },
}

export default { actions }
