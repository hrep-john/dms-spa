<route lang="yaml">
meta:
  requiresNoAuth: true
</route>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'

import authServices from '/@src/stores/auth'
import tenantSettingsServices from '/@src/stores/tenantSettings'
import { handleVuexApiCall } from '/@src/utils/helper'

import { useDarkmode } from '/@src/stores/darkmode'
import { useUserSession } from '/@src/stores/userSession'
import { useTenantSettings } from '/@src/stores/tenantSettings'
import { useNotyf } from '/@src/composable/useNotyf'
import { Field, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'
const { t } = useI18n()

// Define a validation schema
const schema = yup.object({
  username: yup
    .string()
    .required(t('validation.username.required'))
    .max(255, t('validation.common.input_field_maximum_length')),
  password: yup
    .string()
    .required(t('validation.password.required'))
    .min(6, t('validation.password.minimum')),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const service = authServices.actions
const tenantSettingsService = tenantSettingsServices.actions

const isPreloading = ref(true)
const isLoading = ref(false)
const tenantSettings = useTenantSettings()
const darkmode = useDarkmode()
const router = useRouter()
const route = useRoute()
const notyf = useNotyf()
const userSession = useUserSession()
const redirect = route.query.redirect as string
const isExpired = route.query.expired as string
const isPasswordVisible = ref(false)

const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    username: values.username,
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

    if (redirect) {
      router.push(redirect)
    } else {
      router.push({ name: 'dashboard' })
    }
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
})

const getTenantSettings = async () => {
  isPreloading.value = true

  const domain = window.location.host

  const payload = {
    domain,
  }

  const response = await handleVuexApiCall(
    tenantSettingsService.handleFetchTenantSettings,
    payload
  )

  if (response.success) {
    setTimeout(() => {
      tenantSettings.setIsMounted(true)
    }, 500)
  } else {
    const error = response?.body?.message
    notyf.error(error)
    router.push('/404')
  }
}

onMounted(async () => {
  if (!tenantSettings.isMounted) {
    await getTenantSettings()
  }

  isPreloading.value = false
})

useHead({
  title: `Login - ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <VLoader size="xl" v-show="isPreloading" :active="true" class="h-screen" />
  <div v-show="!isPreloading" class="auth-wrapper-inner columns is-gapless">
    <!-- Image section (hidden on mobile) -->
    <div class="column login-column is-8 h-hidden-mobile h-hidden-tablet-p hero-banner">
      <div class="hero login-hero is-fullheight is-app-grey">
        <div class="hero-body">
          <VFlex flex-direction="column" class="columns mx-auto">
            <div class="is-10 is-offset-1 p-l-20 p-r-20">
              <img
                class="light-image"
                src="/@src/assets/illustrations/login/background-light.svg?format=webp"
                alt=""
              />
              <img
                class="dark-image"
                src="/@src/assets/illustrations/login/background-dark.svg?format=webp"
                alt=""
              />
            </div>
          </VFlex>
        </div>
        <div class="hero-footer">
          <p class="has-text-centered"></p>
        </div>
      </div>
    </div>

    <!-- Form section -->
    <div class="column">
      <div class="hero is-fullheight is-white">
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
                  <h2>{{ t('label.welcome_back') }}.</h2>
                  <p class="mt-2">{{ t('info.please_login_to_your_account') }}</p>
                </div>
                <div class="auth-form-wrapper">
                  <VMessage color="danger" v-if="isExpired">
                    {{ t('error.session_expired') }}.
                  </VMessage>

                  <!-- Login Form -->
                  <form @submit.prevent="onSubmit">
                    <div class="login-form">
                      <!-- User Id -->
                      <Field v-slot="{ field, errorMessage }" name="username">
                        <VField>
                          <VControl
                            :loading="isLoading"
                            icon="feather:user"
                            :has-error="Boolean(errorMessage)"
                          >
                            <input
                              v-bind="field"
                              class="input"
                              type="text"
                              :disabled="isLoading"
                              :placeholder="t('label.user_id')"
                              autocomplete="username"
                            />
                            <p v-if="errorMessage" class="help is-danger">
                              {{ errorMessage }}
                            </p>
                          </VControl>
                        </VField>
                      </Field>

                      <!-- Password -->
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
                        <RouterLink :to="{ name: 'auth-forgot-password' }">
                          <span>{{ t('label.forgot_password') }}?</span>
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
  </div>
</template>

<style lang="scss" scoped>
.h-screen {
  height: 100vh;
}
</style>
