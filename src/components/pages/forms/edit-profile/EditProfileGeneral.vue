<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted } from 'vue'

import { useNotyf } from '/@src/composable/useNotyf'
import { onceImageErrored } from '/@src/utils/via-placeholder'
import { useUserSession } from '/@src/stores/userSession'
import { handleVuexApiCall } from '/@src/utils/helper'
import { useRouter } from 'vue-router'
import profileService from '/@src/stores/profile'

import { Field, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'
const { t } = useI18n()

// Define a validation schema
const schema = yup.object({
  email: yup
    .string()
    .required(t('validation.email_address.required'))
    .email(t('validation.email_address.valid_format'))
    .max(255, t('validation.common.input_field_maximum_length')),
  first_name: yup
    .string()
    .required(t('validation.first_name.required'))
    .max(255, t('validation.common.input_field_maximum_length')),
  last_name: yup
    .string()
    .required(t('validation.last_name.required'))
    .max(255, t('validation.common.input_field_maximum_length')),
  middle_name: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length')),
  mobile_number: yup
    .string()
    .nullable()
    .optional()
    .matches(/^(09)\d{9}$/, t('validation.mobile_number.format'))
    .max(255, t('validation.common.input_field_maximum_length')),
  birthday: yup
    .date()
    .nullable()
    .optional()
    .max(new Date(), t('validation.birthday.max')),
  sex: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length'))
    .oneOf([null, 'male', 'female'], t('validation.sex.in')),
  home_address: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length')),
  barangay: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length')),
  city: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length')),
  region: yup
    .string()
    .nullable()
    .optional()
    .max(255, t('validation.common.input_field_maximum_length')),
})

const profile = ref({})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: profile,
})

const router = useRouter()
const userSession = useUserSession()
const notyf = useNotyf()
const { y } = useWindowScroll()

const service = profileService.actions

const sexList = ref({
  male: 'Male',
  female: 'Female',
})
const profilePicture = ref(null)
const isUploading = ref(false)
const isLoading = ref(false)

const isScrolling = computed(() => {
  return y.value > 30
})

const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const objectKey = await onSaveProfilePicture()
  const payload = values

  if (payload.birthday) {
    payload.birthday = new Date(payload.birthday).toISOString().split('T')[0]
  }

  if (profilePicture.value != null) {
    payload.profile_picture_url = objectKey
  }

  const response = await handleVuexApiCall(service.handleUpdateUserProfile, payload)

  if (response.success) {
    profile.value = response.data.user
    userSession.setUser(response.data.user)

    notyf.success('Your changes have been successfully saved!')
    router.push({ name: 'settings' })
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  isUploading.value = false
  isLoading.value = false
})

const onAddFile = (error: any, file: any) => {
  if (error) {
    console.error(error)
    notyf.error(error)
    return
  }

  profilePicture.value = file.file
}

const onRemoveFile = (error: any, file: any) => {
  if (error) {
    console.error(error)
    notyf.error(error)
    return
  }

  profilePicture.value = null
}

const onSaveProfilePicture = async () => {
  if (profilePicture.value == null) {
    return
  }

  let url = null

  const payload = new FormData()
  payload.append('image', profilePicture.value)

  const response = await handleVuexApiCall(
    service.handleUpdateUserProfilePicture,
    payload
  )

  if (response.success) {
    url = response.data.url
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }

  return url
}

const getUserProfile = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleGetUserProfile, null)

  isLoading.value = false

  if (response.success) {
    profile.value = response.data.user
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const getUserProfilePicture = () => {
  return profile.value.profile_picture_url == undefined ||
    profile.value.profile_picture_url == ''
    ? 'https://via.placeholder.com/150x150'
    : profile.value.profile_picture_url
}

onMounted(() => {
  getUserProfile()
})
</script>

<template>
  <VProgress size="tiny" v-show="isLoading" />
  <div class="account-box is-form is-footerless">
    <div class="form-head stuck-header" :class="[isScrolling && 'is-stuck']">
      <div class="form-head-inner">
        <div class="left">
          <h3>Personal Info</h3>
          <p>Edit your account's personal information</p>
        </div>
        <div class="right">
          <div class="buttons">
            <VButton
              :to="{ name: 'dashboard' }"
              icon="lnir lnir-arrow-left rem-100"
              light
              dark-outlined
            >
              Go Back
            </VButton>
            <VButton
              color="primary"
              raised
              :loading="isLoading"
              tabindex="0"
              @keydown.space.prevent="onSubmit"
              @click="onSubmit"
            >
              Save Changes
            </VButton>
          </div>
        </div>
      </div>
    </div>
    <div class="form-body">
      <form @submit.prevent="onSubmit">
        <!--Fieldset-->
        <div class="fieldset">
          <div class="fieldset-heading">
            <h4>Profile Picture</h4>
            <p>This is how others will recognize you</p>
          </div>

          <VAvatar size="xl" class="profile-v-avatar">
            <template #avatar>
              <img
                v-if="!isUploading"
                class="avatar"
                :src="getUserProfilePicture()"
                alt=""
                @error.once="(event) => onceImageErrored(event, '150x150')"
              />
              <VFilePond
                v-else
                class="profile-filepond"
                name="profile_filepond"
                :chunk-retry-delays="[500, 1000, 3000]"
                label-idle="<i class='lnil lnil-cloud-upload'></i>"
                :accepted-file-types="['image/png', 'image/jpeg', 'image/gif']"
                :image-preview-height="140"
                :image-resize-target-width="140"
                :image-resize-target-height="140"
                image-crop-aspect-ratio="1:1"
                style-panel-layout="compact circle"
                style-load-indicator-position="center bottom"
                style-progress-indicator-position="right bottom"
                style-button-remove-item-position="left bottom"
                style-button-process-item-position="right bottom"
                @addfile="onAddFile"
                @removefile="onRemoveFile"
              />
              <VIconButton
                v-if="!isUploading"
                icon="feather:edit-2"
                class="edit-button is-edit"
                circle
                tabindex="0"
                @keydown.space.prevent="isUploading = true"
                @click="isUploading = true"
              />
              <VIconButton
                v-else
                icon="feather:arrow-left"
                class="edit-button is-back"
                circle
                tabindex="0"
                @keydown.space.prevent="isUploading = false"
                @click="isUploading = false"
              />
            </template>
          </VAvatar>
        </div>

        <!--Fieldset-->
        <div class="fieldset">
          <div class="fieldset-heading">
            <h4>Email</h4>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-12">
              <Field v-slot="{ field, errorMessage }" name="email">
                <VField>
                  <VControl icon="feather:mail" :has-error="Boolean(errorMessage)">
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
            </div>
          </div>
        </div>

        <!--Fieldset-->
        <div class="fieldset">
          <div class="fieldset-heading">
            <h4>Personal Info</h4>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="first_name">
                <VField>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.first_name')"
                      autocomplete="given-name"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="middle_name">
                <VField>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.middle_name')"
                      autocomplete="additional-name"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="last_name">
                <VField>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.last_name')"
                      autocomplete="family-name"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="mobile_number">
                <VField>
                  <VControl icon="feather:phone" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.mobile_number')"
                      autocomplete="tel"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="birthday">
                <VField>
                  <VControl icon="feather:calendar" :has-error="Boolean(errorMessage)">
                    <VDatePicker v-bind="field" color="green" trim-weeks>
                      <template #default="{ inputValue, inputEvents }">
                        <VField>
                          <VControl icon="feather:calendar">
                            <input
                              class="input"
                              type="text"
                              :placeholder="t('label.birthday')"
                              :value="inputValue"
                              v-on="inputEvents"
                              :disabled="isLoading"
                            />
                            <p v-if="errorMessage" class="help is-danger">
                              {{ errorMessage }}
                            </p>
                          </VControl>
                        </VField>
                      </template>
                    </VDatePicker>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="sex">
                <VField>
                  <VControl :has-error="Boolean(errorMessage)">
                    <Multiselect
                      v-bind="field"
                      :searchable="true"
                      :placeholder="t('label.sex')"
                      :options="sexList"
                      :disabled="isLoading"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="home_address">
                <VField>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.home_address')"
                      autocomplete="street-address"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="barangay">
                <VField>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.barangay')"
                      autocomplete="address-level1"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="city">
                <VField>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.city')"
                      autocomplete="address-level2"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="region">
                <VField>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      :placeholder="t('label.region')"
                      autocomplete="address-level3"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-body {
  .message {
    margin-bottom: 0.75rem;
  }
}
</style>
