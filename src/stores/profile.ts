import { useApi } from '/@src/composable/useApi'

const api = useApi()

const actions = {
  async handleGetUserProfile() {
    const response = await api.get(`api/profile/me`)

    return response.data
  },

  async handleUpdateUserProfile(payload: any) {
    const response = await api.put(`api/profile/me`, payload)

    return response.data
  },

  async handleUpdateUserProfilePicture(payload: any) {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    }

    const response = await api.post(`api/profile/me/upload-profile-picture`, payload, {
      headers: headers,
    })

    return response.data
  },
}

export default { actions }
