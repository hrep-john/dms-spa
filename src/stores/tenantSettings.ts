import { useApi } from '/@src/composable/useApi'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

const api = useApi()

const actions = {
  async handleFetchTenantSettings(payload: any) {
    const response = await api.post('api/public/settings/tenant', payload)

    return response.data
  },

  async handleSyncTenantSettings(payload: any) {
    const response = await api.post('api/settings/tenant/sync', payload)

    return response.data
  },

  async handleUploadFileTenantSettings(payload: any) {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    }

    const response = await api.post(`api/settings/tenant/upload`, payload, {
      headers: headers,
    })

    return response.data
  },
}

export default { actions }

export const useTenantSettings = defineStore('tenant-settings', () => {
  const isMounted = ref(false)
  const tenantSettings = useStorage('tenant-settings', [])

  function setIsMounted(newIsMounted: any) {
    isMounted.value = newIsMounted
  }

  function setTenantSettings(newData: any) {
    tenantSettings.value = newData
  }

  function getTenantSettings(key: string, defaultValue = '') {
    const settings = tenantSettings.value.find((settings) => settings.key === key)
    return settings ? settings?.value : defaultValue
  }

  return {
    isMounted,
    tenantSettings,
    setIsMounted,
    setTenantSettings,
    getTenantSettings,
  } as const
})

watchEffect(() => {
  const body = document.documentElement
  const tenantSettings = useTenantSettings().tenantSettings

  tenantSettings.forEach((tenantSetting) => {
    body.style.setProperty(tenantSetting?.key, tenantSetting?.value)
  })
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTenantSettings, import.meta.hot))
}
