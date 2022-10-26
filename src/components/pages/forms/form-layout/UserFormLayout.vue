<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import { useUserSession } from '/@src/stores/userSession'
import { handleVuexApiCall } from '/@src/utils/helper'
import roleService from '/@src/stores/roles'
import UserLevelEnum from '/@src/enums/userLevel'

import { Field, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

const { t } = useI18n()
const userSession = useUserSession()

const service = roleService.actions

const props = defineProps({
  errors: {
    type: Array,
    default: {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  defaultValue: {
    type: Object,
    default: {},
  },
  isNew: {
    type: Boolean,
    default: false,
  },
})

// Define a validation schema
let objectSchema = {
  username: yup
    .string()
    .required(t('validation.username.required'))
    .min(6, t('validation.username.minimum'))
    .max(255, t('validation.common.input_field_maximum_length')),
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
  roles: yup.array().required(t('validation.role.required')),
}

if (props.isNew) {
  objectSchema = {
    ...objectSchema,
    password: yup
      .string()
      .required(t('validation.password.required'))
      .min(6, t('validation.password.minimum')),
    confirm_password: yup
      .string()
      .required(t('validation.confirm_password.required_confirm'))
      .oneOf([yup.ref('password')], t('validation.confirm_password.match')),
  }
}

const schema = yup.object(objectSchema)

const notyf = useNotyf()
const emit = defineEmits(['submit'])
const references = ref({
  roles: [],
  sex: {
    male: 'Male',
    female: 'Female',
  },
})

const { y } = useWindowScroll()

const details = ref({})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: details,
})

const isStuck = computed(() => {
  return y.value > 30
})

const user = computed(() => {
  if (userSession.user === undefined) {
    return {}
  }

  return JSON.parse(userSession.user || '')
})

const fetchRoles = async () => {
  if (isLoading.value) {
    return
  }

  const payload: any = {
    filters: [
      { column: 'name', operator: '!=', join: 'AND', value: UserLevelEnum.Superadmin },
      { column: 'name', operator: '!=', join: 'AND', value: UserLevelEnum.Admin },
    ],
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleFetchRoleList, payload)

  isLoading.value = false

  if (response.success) {
    references.value.roles = response.data.results.map((item) => item.name)
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const mappings = (data: any) => {
  if (data.birthday) {
    data.birthday = new Date(data.birthday).toISOString().split('T')[0]
  }

  data.tenant_id = user?.value?.tenant_id

  return data
}

const onSubmit = handleSubmit(async (values) => {
  const data = mappings(values)
  const {
    username,
    email,
    password,
    confirm_password,
    roles,
    created_at,
    created_by,
    updated_at,
    updated_by,
    ...user_info
  } = data

  let formatted = {
    username,
    email,
    roles,
    user_info,
  }

  if (props.isNew) {
    formatted.password = password
  }

  emit('submit', formatted)
})

const handleDefaultValue = () => {
  const { user_info, ...others } = props.defaultValue

  details.value = { ...others, ...user_info }
}

const isLoading = computed(() => {
  return props.loading
})

onMounted(async () => {
  await fetchRoles()

  references.value.sex = {
    male: 'Male',
    female: 'Female',
  }
})

watch(
  () => [props.defaultValue],
  (values) => {
    handleDefaultValue()
  }
)
</script>

<template>
  <form class="form-layout">
    <div class="form-outer">
      <div :class="[isStuck && 'is-stuck']" class="form-header stuck-header">
        <div class="form-header-inner">
          <div class="left">
            <h3>{{ props.title }}</h3>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                icon="lnir lnir-arrow-left rem-100"
                :to="{ name: 'users' }"
                light
                dark-outlined
              >
                Cancel
              </VButton>
              <VButton
                color="primary"
                raised
                :loading="isLoading"
                tabindex="0"
                @keydown.space.prevent="onSubmit"
                @click="onSubmit"
              >
                Submit
              </VButton>
            </div>
          </div>
        </div>
      </div>
      <div class="form-body">
        <!--Fieldset-->
        <div class="form-fieldset" v-if="!props.isNew">
          <div class="fieldset-heading">
            <h4>{{ t('label.record_info') }}</h4>
          </div>

          <div class="columns is-multiline">
            <div class="column is-6">
              <VField>
                <label>{{ t('label.created_by') }}</label>
                <VControl icon="feather:user">
                  <input
                    type="text"
                    class="input"
                    :value="details.created_by"
                    :disabled="true"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <VField>
                <label>{{ t('label.date_created') }}</label>
                <VControl icon="feather:calendar">
                  <input
                    type="text"
                    class="input"
                    :value="details.created_at"
                    :disabled="true"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <VField>
                <label>{{ t('label.updated_by') }}</label>
                <VControl icon="feather:user">
                  <input
                    type="text"
                    class="input"
                    :value="details.updated_by"
                    :disabled="true"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <VField>
                <label>{{ t('label.last_updated') }}</label>
                <VControl icon="feather:calendar">
                  <input
                    type="text"
                    class="input"
                    :value="details.updated_at"
                    :disabled="true"
                  />
                </VControl>
              </VField>
            </div>
          </div>
        </div>

        <!--Fieldset-->
        <div class="form-fieldset">
          <div class="fieldset-heading">
            <h4>Account Credentials</h4>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="username">
                <VField>
                  <label>{{ t('label.user_name') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      autocomplete="username"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="email">
                <VField>
                  <label>{{ t('label.email_address') }}</label>
                  <VControl icon="feather:mail" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      autocomplete="email"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>
            <div class="column is-6" v-if="props.isNew">
              <Field v-slot="{ field, errorMessage }" name="password">
                <VField>
                  <label>{{ t('label.password') }}</label>
                  <VControl icon="feather:eye" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="password"
                      :disabled="isLoading"
                      autocomplete="password"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>
            <div class="column is-6" v-if="props.isNew">
              <Field v-slot="{ field, errorMessage }" name="confirm_password">
                <VField>
                  <label>{{ t('label.confirm_password') }}</label>
                  <VControl icon="feather:eye" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="password"
                      :disabled="isLoading"
                      autocomplete="password"
                    />
                    <p v-if="errorMessage" class="help is-danger">
                      {{ errorMessage }}
                    </p>
                  </VControl>
                </VField>
              </Field>
            </div>

            <!--Field-->
            <div class="column is-12">
              <Field v-slot="{ field, errorMessage }" name="roles">
                <VField>
                  <label>{{ t('label.roles') }}</label>
                  <VControl :has-error="Boolean(errorMessage)">
                    <Multiselect
                      v-model="field.value"
                      v-bind="field"
                      :placeholder="t('info.select_your_roles')"
                      :options="references.roles"
                      :disabled="isLoading"
                      mode="tags"
                      :searchable="true"
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
        <div class="form-fieldset">
          <div class="fieldset-heading">
            <h4>Personal Info</h4>
            <p>This helps us to know you</p>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-6">
              <Field v-slot="{ field, errorMessage }" name="first_name">
                <VField>
                  <label>{{ t('label.first_name') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.middle_name') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.last_name') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.mobile_number') }}</label>
                  <VControl icon="feather:phone" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.birthday') }}</label>
                  <VControl icon="feather:calendar" :has-error="Boolean(errorMessage)">
                    <VDatePicker
                      v-bind="field"
                      v-model="field.value"
                      color="green"
                      trim-weeks
                    >
                      <template #default="{ inputValue, inputEvents }">
                        <VField>
                          <VControl icon="feather:calendar">
                            <input
                              class="input"
                              type="text"
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
                  <label>{{ t('label.sex') }}</label>
                  <VControl :has-error="Boolean(errorMessage)">
                    <Multiselect
                      v-model="field.value"
                      v-bind="field"
                      :options="references.sex"
                      :disabled="isLoading"
                      :searchable="true"
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
                  <label>{{ t('label.home_address') }}</label>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.barangay') }}</label>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.city') }}</label>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
                  <label>{{ t('label.region') }}</label>
                  <VControl icon="feather:map-pin" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
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
      </div>
    </div>
  </form>
</template>

<style lang="scss">
@import '../../../../scss/abstracts/mixins';

.is-navbar {
  .form-layout {
    margin-top: 30px;
  }
}

.form-layout {
  max-width: 740px;
  margin: 0 auto;

  .form-outer {
    @include vuero-s-card;

    padding: 0;

    .form-header {
      padding: 12px 20px;
      border-bottom: 1px solid var(--fade-grey-dark-3);
      transition: all 0.3s; // transition-all test

      &.is-stuck {
        background: var(--white);
        padding-right: 80px;
        border-left: 1px solid var(--fade-grey-dark-3);
      }

      .form-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .left {
        h3 {
          font-family: var(--font-alt);
          font-size: 1.2rem;
          font-weight: 600;
          line-height: 1.3;
        }

        p {
          font-size: 0.95rem;
        }
      }
    }

    .form-body {
      padding: 20px 40px 40px;
    }
  }
}

.is-dark {
  .form-layout {
    .form-outer {
      @include vuero-card--dark;

      .form-header {
        border-color: var(--dark-sidebar-light-12);

        &.is-stuck {
          background: var(--dark-sidebar);
          border-color: var(--dark-sidebar-light-6);
        }

        .left {
          h3 {
            color: var(--dark-dark-text);
          }
        }
      }

      .form-body {
        .field {
          .control {
            .input,
            .textarea {
              &:focus {
                border-color: var(--primary);
              }
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .form-layout {
    .form-outer {
      .form-header {
        .form-header-inner {
          flex-direction: column;

          .left {
            text-align: center;
            margin-bottom: 12px;
          }

          .right {
            width: 100%;

            .buttons {
              display: flex;
              justify-content: space-between;
              margin: 0;

              .button {
                margin: 0;
                width: 49%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
