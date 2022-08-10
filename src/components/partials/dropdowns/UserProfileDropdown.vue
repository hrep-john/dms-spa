<template>
  <VDropdown spaced class="is-left user-dropdown profile-dropdown">
    <template #button="{ toggle }">
      <a
        tabindex="0"
        class="is-trigger dropdown-trigger"
        aria-haspopup="true"
        @keydown.space.prevent="toggle"
        @click="toggle"
      >
        <VAvatar :picture="getUserProfilePicture()" />
      </a>
    </template>

    <template #content>
      <div class="dropdown-head">
        <VAvatar size="large" :picture="getUserProfilePicture()" />

        <div class="meta">
          <span>{{ user.first_name }} {{ user.last_name }}</span>
        </div>
      </div>

      <RouterLink :to="{ name: 'profile-edit' }">
        <div class="dropdown-item is-media">
          <div class="icon">
            <i aria-hidden="true" class="lnil lnil-user-alt"></i>
          </div>
          <div class="meta">
            <span>Profile</span>
            <span>Edit your profile</span>
          </div>
        </div>
      </RouterLink>

      <hr class="dropdown-divider" />

      <div class="dropdown-item is-button">
        <VButton
          class="logout-button"
          icon="feather:log-out"
          color="primary"
          role="menuitem"
          raised
          fullwidth
          @click="handleLogout"
        >
          Logout
        </VButton>
      </div>
    </template>
  </VDropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserSession } from '/@src/stores/userSession'
import { useRouter, useRoute } from 'vue-router'
import authServices from '/@src/stores/auth'
import { handleVuexApiCall } from '/@src/utils/helper'
import { useNotyf } from '/@src/composable/useNotyf'

const service = authServices.actions
const isLoading = ref(false)
const userSession = useUserSession()
const router = useRouter()
const notyf = useNotyf()

const handleLogout = async () => {
  if (!isLoading.value) {
    const response = await handleVuexApiCall(service.handleLogout, null)

    if (response.success) {
      userSession.logoutUser()
      router.push({ name: 'auth-login' })
    } else {
      const error = response?.body?.message
      notyf.error(error)
    }
  }
}

const user = computed(() => {
  if (userSession.user === undefined) {
    return {}
  }

  return JSON.parse(userSession.user || '')
})

const userRole = computed(() => {
  return userSession.role
})

const getUserProfilePicture = () => {
  return user.value.profile_picture_url == undefined ||
    user.value.profile_picture_url == ''
    ? 'https://via.placeholder.com/150x150'
    : user.value.profile_picture_url
}
</script>
