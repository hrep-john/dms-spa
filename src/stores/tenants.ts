import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetTenants(payload: any) {
    const response = await api.get(`api/tenants`, {
      params: payload,
    })

    return response.data
  },

  async handleGetTenantsList() {
    const response = await api.get(`api/tenants/list`)

    return response.data
  },

  async handleShowTenant(id: any) {
    const response = await api.get(`api/tenants/${id}`)

    return response.data
  },

  async handleStoreTenant(payload: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.post('/api/tenants', payload, { headers: headers })

    return response.data
  },

  async handleUpdateTenant(payload: any, id: any) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const response = await api.patch(`/api/tenants/${id}`, payload, { headers: headers })

    return response.data
  },

  async handleDeleteTenant(id: any) {
    const response = await api.delete(`/api/tenants/${id}`)

    return response.data
  },
}

export default { actions }
