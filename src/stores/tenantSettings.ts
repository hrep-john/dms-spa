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

  return {
    isMounted,
    tenantSettings,
    setIsMounted,
    setTenantSettings,
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
