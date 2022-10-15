import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetRoles(payload: any) {
    const response = await api.get(`api/roles`, {
      params: payload,
    })

    return response.data
  },

  async handleShowRole(id: any) {
    const response = await api.get(`api/roles/${id}`)

    return response.data
  },

  async handleStoreRole(payload: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.post('/api/roles', payload, { headers: headers })

    return response.data
  },

  async handleUpdateRole(payload: any) {
    const id = payload.id
    delete payload.id

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.patch(`/api/roles/${id}`, payload, { headers: headers })

    return response.data
  },

  async handleDeleteRole(id: any) {
    const response = await api.delete(`/api/roles/${id}`)

    return response.data
  },

  async handleFetchRoleList(payload: any) {
    const response = await api.get(`api/roles/list`, {
      params: payload,
    })

    return response.data
  },

  async handleFetchPermissionList(payload: any) {
    const response = await api.get(`api/roles/permissions/list`, {
      params: payload,
    })

    return response.data
  },
}

export default { actions }
