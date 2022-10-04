import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export type UserData = Record<string, any> | null

export const useUserSession = defineStore('userSession', () => {
  // token will be synced with local storage
  // @see https://vueuse.org/core/usestorage/
  const token = useStorage('token', '')
  const roles = useStorage('roles', '')
  const permissions = useStorage('permissions', '')
  const customReports = useStorage('customReports', '')

  const user = useStorage('user', '')
  const loading = ref(true)

  const isLoggedIn = computed(() => token.value !== undefined && token.value !== '')

  function setUser(newUser: any) {
    user.value = JSON.stringify(newUser)
  }

  function setToken(newToken: string) {
    token.value = newToken
  }

  function setRoles(newRoles: string) {
    roles.value = JSON.stringify(newRoles)
  }

  function setPermissions(newPermissions: string) {
    permissions.value = JSON.stringify(newPermissions)
  }

  function setCustomReports(newCustomReports: string) {
    customReports.value = JSON.stringify(newCustomReports)
  }

  function setLoading(newLoading: boolean) {
    loading.value = newLoading
  }

  async function logoutUser() {
    token.value = undefined
    roles.value = undefined
    permissions.value = undefined
    customReports.value = undefined
    user.value = undefined
  }

  return {
    user,
    roles,
    permissions,
    customReports,
    token,
    isLoggedIn,
    loading,
    logoutUser,
    setUser,
    setRoles,
    setPermissions,
    setCustomReports,
    setToken,
    setLoading,
  } as const
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserSession, import.meta.hot))
}
