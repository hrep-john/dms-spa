import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleShowCustomReport(payload: any) {
    const slug = payload.slug
    delete payload.slug

    const response = await api.get(`api/custom-reports/${slug}`, {
      params: payload,
    })

    return response.data
  },
}

export default { actions }
