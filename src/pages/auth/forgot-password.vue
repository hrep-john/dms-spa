<route lang="yaml">
meta:
  requiresNoAuth: true
</route>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { Field, useForm } from 'vee-validate'
import * as yup from 'yup'

import { useDarkmode } from '/@src/stores/darkmode'
import { useNotyf } from '/@src/composable/useNotyf'
import { handleVuexApiCall } from '/@src/utils/helper'
import authServices from '/@src/stores/auth'

const service = authServices.actions
const darkmode = useDarkmode()
const router = useRouter()
const notyf = useNotyf()

const isLoading = ref(false)
const { t } = useI18n()

// Define a validation schema
const schema = yup.object({
  email: yup
    .string()
    .required(t('validation.email_address.required_password_reset_instruction'))
    .email(t('validation.email_address.valid_format')),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const payload = {
    email: values.email,
    type: 'spa',
  }

  const response = await handleVuexApiCall(service.handleForgotPassword, payload)

  isLoading.value = false

  if (response.success) {
    notyf.dismissAll()
    notyf.success(response.data.message)
  } else {
    const errors = response?.body?.errors

    if (errors) {
      Object.keys(errors).forEach((key: any) => {
        errors[key].forEach((error: any) => notyf.error(error))
      })
    } else {
      const error = response?.body?.message

      if (error) {
        notyf.error(error)
      }
    }
  }
})

useHead({
  title: `Forgot Password - ${import.meta.env.VITE_PROJECT_NAME}`,
})
</script>

<template>
  <div class="auth-wrapper-inner columns is-gapless">
    <!-- Form section -->
    <div class="column is-5">
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
                  <h2>{{ t('label.recover_account') }}</h2>
                  <p class="mt-2">{{ t('info.reset_account_password') }}.</p>
                  <p class="recover-text mt-4">{{ t('info.email_procedure_guide') }}</p>
                </div>
                <div class="auth-form-wrapper">
                  <!-- Login Form -->
                  <form @submit="onSubmit">
                    <div id="signin-form" class="login-form">
                      <!-- Input -->
                      <Field v-slot="{ field, errorMessage }" name="email">
                        <VField>
                          <VControl
                            icon="feather:mail"
                            :has-error="Boolean(errorMessage)"
                          >
                            <input
                              v-bind="field"
                              class="input"
                              type="text"
                              :disabled="isLoading"
                              :placeholder="t('label.email_address')"
                              autocomplete="email"
                            />
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
                            {{ t('label.confirm') }}
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
    <div class="column login-column is-7 is-hidden-mobile hero-banner">
      <div class="hero login-hero is-fullheight is-app-grey">
        <div class="hero-body">
          <div class="columns">
            <div class="column is-12">
              <img
                class="light-image"
                src="/@src/assets/illustrations/forgot-password/background-dark.svg?format=webp"
                alt=""
              />
              <img
                class="dark-image"
                src="/@src/assets/illustrations/forgot-password/background-light.svg?format=webp"
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
