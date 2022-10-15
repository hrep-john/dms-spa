<route lang="yaml">
meta:
  requiresNoAuth: true
</route>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { Field, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useUserSession } from '/@src/stores/userSession'

import { useDarkmode } from '/@src/stores/darkmode'
import { useNotyf } from '/@src/composable/useNotyf'
import { handleVuexApiCall } from '/@src/utils/helper'
import { useTenantSettings } from '/@src/stores/tenantSettings'
import sleep from '/@src/utils/sleep'
import authServices from '/@src/stores/auth'

const service = authServices.actions
const darkmode = useDarkmode()
const router = useRouter()
const notyf = useNotyf()
const queryParams = router.currentRoute.value.query
const userSession = useUserSession()
const tenantSettings = useTenantSettings()

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const isLoading = ref(false)
const { t } = useI18n()

// Define a validation schema
const schema = yup.object({
  password: yup
    .string()
    .required(t('validation.password.required_login'))
    .min(6, t('validation.password.minimum')),
  confirm_password: yup
    .string()
    .required(t('validation.confirm_password.required_confirm'))
    .oneOf([yup.ref('password')], t('validation.confirm_password.match')),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const formatErrors = (errors: any) => {
  const errorLists = []

  for (let item in errors) {
    for (let i = 0; i < errors[item].length; i++) {
      errorLists.push(errors[item][i])
    }
  }

  return errorLists
}

const proceedToLogin = async (values: any) => {
  sleep(200)

  const payload = {
    username: queryParams.username,
    password: values.password,
  }

  const response = await handleVuexApiCall(service.handleLogin, payload)

  isLoading.value = false

  if (response.success) {
    userSession.setToken(response.data.access_token)
    userSession.setRoles(response.data.roles)
    userSession.setUser(response.data.user)

    notyf.dismissAll()
    notyf.success(
      `Welcome back, ${response.data.user.first_name} ${response.data.user.last_name}`
    )

    router.push({ name: 'dashboard' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    token: queryParams.token,
    username: queryParams.username,
    password: values.password,
    password_confirmation: values.confirm_password,
    type: 'spa',
  }

  const response = await handleVuexApiCall(service.handleResetPassword, payload)

  isLoading.value = false

  if (response.success) {
    notyf.dismissAll()
    notyf.success(response.data.message)
    proceedToLogin(values)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
})

const isPageHasToken = () => {
  if (!queryParams.hasOwnProperty('token') || !queryParams.hasOwnProperty('username')) {
    router.push({ name: 'auth-login' })
  }
}

onMounted(() => {
  isPageHasToken()
})

useHead({
  title: `Reset Password | ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <div class="auth-wrapper-inner columns is-gapless">
    <!-- Form section -->
    <div class="column is-5">
      <div class="hero is-fullheight is-white left-section">
        <div class="hero-heading">
          <label
            class="dark-mode ml-auto"
            tabindex="0"
            @keydown.space.prevent="(e) => (e.target as HTMLLabelElement).click()"
          >
            <input
              type="checkbox"
              :checked="!darkmode.isDark"
              @change="darkmode.onChange"
            />
            <span></span>
          </label>
        </div>
        <div class="hero-body">
          <div class="container">
            <div class="columns">
              <div class="column is-12">
                <div class="auth-content">
                  <h2>{{ t('label.reset_password') }}</h2>
                  <p class="mt-2">{{ t('info.your_indentity_has_been_identified') }}</p>
                  <p class="recover-text mt-4">Please, set your new password</p>
                </div>
                <div class="auth-form-wrapper">
                  <!-- Login Form -->
                  <form @submit="onSubmit">
                    <div id="signin-form" class="login-form">
                      <!-- Input -->
                      <Field v-slot="{ field, errorMessage }" name="password">
                        <VField>
                          <VControl
                            icon="feather:lock"
                            :has-error="Boolean(errorMessage)"
                          >
                            <div class="field has-addons mb-0">
                              <div class="control-field is-expanded">
                                <input
                                  :type="isPasswordVisible ? 'text' : 'password'"
                                  class="input"
                                  v-bind="field"
                                  :placeholder="t('label.password')"
                                  autocomplete="new-password"
                                  :disabled="isLoading"
                                />
                              </div>
                              <div class="control">
                                <span
                                  @click="isPasswordVisible = !isPasswordVisible"
                                  class="button password-icon"
                                  :class="{
                                    'danger-text': errorMessage,
                                    'is-disabled': isLoading,
                                  }"
                                >
                                  <i
                                    class="fas has-validation has-error"
                                    :class="{
                                      'fa-eye-slash': isPasswordVisible,
                                      'fa-eye is-danger': !isPasswordVisible,
                                    }"
                                  ></i>
                                </span>
                              </div>
                            </div>

                            <p v-if="errorMessage" class="help is-danger">
                              {{ errorMessage }}
                            </p>
                          </VControl>
                        </VField>
                      </Field>

                      <!-- Input -->
                      <Field v-slot="{ field, errorMessage }" name="confirm_password">
                        <VField>
                          <VControl
                            icon="feather:lock"
                            :has-error="Boolean(errorMessage)"
                          >
                            <div class="field has-addons mb-0">
                              <div class="control-field is-expanded">
                                <input
                                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                  class="input"
                                  v-bind="field"
                                  :placeholder="t('label.confirm_password')"
                                  autocomplete="new-password"
                                  :disabled="isLoading"
                                />
                              </div>
                              <div class="control">
                                <span
                                  @click="
                                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                                  "
                                  class="button"
                                  :class="{
                                    'danger-text': errorMessage,
                                    'is-disabled': isLoading,
                                  }"
                                >
                                  <i
                                    class="fas has-validation has-error"
                                    :class="{
                                      'fa-eye-slash': isConfirmPasswordVisible,
                                      'fa-eye is-danger': !isConfirmPasswordVisible,
                                    }"
                                  ></i>
                                </span>
                              </div>
                            </div>

                            <p v-if="errorMessage" class="help is-danger">
                              {{ errorMessage }}
                            </p>
                          </VControl>
                        </VField>
                      </Field>

                      <!-- Submit -->

                      <VField>
                        <VControl class="login">
                          <VButton
                            :loading="isLoading"
                            color="primary"
                            type="submit"
                            bold
                            fullwidth
                            raised
                          >
                            {{ t('label.continue') }}
                          </VButton>
                        </VControl>
                      </VField>

                      <div class="forgot-link has-text-centered">
                        <RouterLink :to="{ name: 'auth-login' }">
                          <span>{{ t('label.back_to_login') }}</span>
                        </RouterLink>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image section (hidden on mobile) -->
    <div class="column login-column is-7 is-hidden-mobile hero-banner right-section">
      <div class="hero login-hero is-fullheight is-app-grey">
        <div class="hero-body">
          <div class="columns">
            <div class="column is-12">
              <img
                class="light-image"
                :src="
                  tenantSettings.getTenantSettings(
                    'reset-password-placeholder-image',
                    '/@src/assets/illustrations/reset-password/background-dark.svg?format=webp'
                  )
                "
                alt=""
              />
              <img
                class="dark-image"
                :src="
                  tenantSettings.getTenantSettings(
                    'reset-password-placeholder-image',
                    '/@src/assets/illustrations/reset-password/background-dark.svg?format=webp'
                  )
                "
                alt=""
              />
            </div>
          </div>
        </div>
        <div class="hero-footer">
          <p class="has-text-centered"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.left-section {
  background: var(--reset-password-left-section-background-color) !important;
}

.right-section {
  background: var(--reset-password-right-section-background-color) !important;
}

.is-dark {
  .left-section {
    background: var(--dark-sidebar-light-4) !important;
  }

  .right-section {
    background: var(--dark-sidebar-dark-4) !important;
  }
}
</style>