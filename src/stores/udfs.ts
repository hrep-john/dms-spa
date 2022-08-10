import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetUdfs(payload: any) {
    const response = await api.get(`api/udfs`, {
      params: payload,
    })

    return response.data
  },

  async handleGetAllUdfs(payload: any) {
    const response = await api.get(`api/udfs/all`, {
      params: payload,
    })

    return response.data
  },

  async handleShowUdf(id: any) {
    const response = await api.get(`api/udfs/${id}`)

    return response.data
  },

  async handleStoreUdf(payload: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.post('/api/udfs', payload, { headers: headers })

    return response.data
  },

  async handleUpdateUdf(payload: any) {
    const id = payload.id
    delete payload.id

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.patch(`/api/udfs/${id}`, payload, { headers: headers })

    return response.data
  },

  async handleDeleteUdf(id: any) {
    const response = await api.delete(`/api/udfs/${id}`)

    return response.data
  },
}

export default { actions }
