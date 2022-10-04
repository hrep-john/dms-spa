import { useApi } from '/@src/composable/useApi'

const api = useApi()
const module = 'documents'

const actions = {
  async handleGetDocuments(payload: any) {
    const response = await api.get(`api/${module}`, {
      params: payload,
    })

    return response.data
  },

  async handleSearchDocuments(payload: any) {
    const response = await api.post(`api/${module}/search`, payload)

    return response.data
  },

  async handleStoreDocument(payload: any) {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    }

    const response = await api.post(`api/${module}`, payload, { headers: headers })

    return response.data
  },

  async handleEditDocumentMetadata(payload: any) {
    const id = payload.id
    delete payload.id

    const response = await api.patch(`api/${module}/${id}`, payload)

    return response.data
  },

  async handleShowDocumentMetadata(id: any) {
    const response = await api.get(`api/${module}/${id}`)

    return response.data
  },

  async handleDownloadDocument(payload: any) {
    const response = await api.post(`api/${module}/download`, payload)

    return response.data
  },

  async handlePreviewDocument(payload: any) {
    const response = await api.post(`api/${module}/preview`, payload)

    return response.data
  },

  async handleDeleteDocument(payload: any) {
    const id = payload.id
    delete payload.id

    const response = await api.delete(`api/${module}/${id}`, payload)

    return response.data
  },

  async handleBulkDeleteDocuments(payload: any) {
    const response = await api.post(`api/${module}/bulk-delete`, payload)

    return response.data
  },

  async handleGetDocumentAuditLogs(id: any) {
    const response = await api.get(`api/${module}/${id}/audit-logs`)

    return response.data
  },

  // Detail Metadata
  async handleGetDocumentDetailMetadata(payload: any) {
    const id = payload.id
    delete payload.id

    const response = await api.get(`api/${module}/${id}/metadata/details`, {
      params: payload,
    })

    return response.data
  },

  // Entity Metadata
  async handleGetDocumentEntityMetadata(payload: any) {
    const id = payload.id
    delete payload.id

    const response = await api.get(`api/${module}/${id}/metadata/entities`, {
      params: payload,
    })

    return response.data
  },

  async handleDocumentSearchAutocomplete(payload: any) {
    const response = await api.get(`api/${module}/search`, {
      params: payload,
    })

    return response.data
  },
}

export default { actions }
