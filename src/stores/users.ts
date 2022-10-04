import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetUsers(payload: any) {
    const response = await api.get(`api/users`, {
      params: payload,
    })

    return response.data
  },

  async handleShowUser(id: any) {
    const response = await api.get(`api/users/${id}`)

    return response.data
  },

  async handleStoreUser(payload: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.post('/api/users', payload, { headers: headers })

    return response.data
  },

  async handleUpdateUser(payload: any) {
    const id = payload.id
    delete payload.id

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.patch(`/api/users/${id}`, payload, { headers: headers })

    return response.data
  },

  async handleDeleteUser(id: any) {
    const response = await api.delete(`/api/users/${id}`)

    return response.data
  },

  async handleFetchUserList(payload: any) {
    const response = await api.get(`api/users/list`, {
      params: payload,
    })

    return response.data
  },
}

export default { actions }
