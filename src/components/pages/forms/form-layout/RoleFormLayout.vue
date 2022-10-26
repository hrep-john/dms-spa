<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'
import { useUserSession } from '/@src/stores/userSession'
import { handleVuexApiCall } from '/@src/utils/helper'
import roleService from '/@src/stores/roles'

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
  name: yup
    .string()
    .required(t('validation.name.required'))
    .min(6, t('validation.common.input_field_minimum_length'))
    .max(255, t('validation.common.input_field_maximum_length')),
}

const schema = yup.object(objectSchema)

const notyf = useNotyf()
const emit = defineEmits(['submit'])
const selectedModules = ref(Array())
const selectedPermissions = ref(Array())
const references = ref({
  permissions: [],
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

const onSubmit = handleSubmit(async (values) => {
  let formatted = {
    name: values?.name,
    permissions: selectedPermissions.value,
  }

  emit('submit', formatted)
})

const handleDefaultValue = () => {
  const { permissions, ...others } = props.defaultValue

  details.value = others
  selectedPermissions.value = permissions
}

const fetchPermissions = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  const response = await handleVuexApiCall(service.handleFetchPermissionList, null)

  isLoading.value = false

  if (response.success) {
    references.value.permissions = response.data.results
  } else {
    const error = response?.body?.message
    notyf.error(error)
  }
}

const onSelectAllPermissions = (module: string) => {
  const group = references.value.permissions.find(
    (permission) => permission.module === module
  )

  const isAllPermissionsSelected = isAllPermissionModuleSelected(group.module)

  // clear all the group permissions
  selectedPermissions.value = selectedPermissions.value.filter(
    (selected) => !group.permissions.includes(selected)
  )

  // force select all group permissions
  if (!isAllPermissionsSelected) {
    selectedPermissions.value = selectedPermissions.value.concat(group.permissions)
  }
}

const isAllPermissionModuleSelected = (module: string) => {
  const group = references.value.permissions.find(
    (permission) => permission.module === module
  )

  const permissions = group.permissions

  return isArraysEqual(permissions, selectedPermissions.value)
}

const isArraysEqual = (array1: Array, array2: Array) => {
  return array1.every((element) => array2.includes(element))
}

const onSelectPermission = () => {
  const groups = references.value.permissions
  let selected: any = []

  groups.forEach((group) => {
    const isAllPermissionsSelected = isAllPermissionModuleSelected(group.module)

    if (isAllPermissionsSelected) {
      selected.push(group.module)
    }
  })

  selectedModules.value = selected
}

const isPermissionAlreadySelected = (permission: string) => {
  return selectedPermissions.value.includes(permission)
}

const isLoading = computed(() => {
  return props.loading
})

onMounted(() => {
  fetchPermissions()
})

watch(
  () => props.defaultValue,
  (values) => {
    handleDefaultValue()
  }
)

watch(
  () => selectedPermissions.value,
  (values) => {
    onSelectPermission()
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
                :to="{ name: 'roles' }"
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
            <h4>{{ t('label.record_info') }}</h4>
          </div>

          <div class="columns is-multiline">
            <!--Field-->
            <div class="column is-12">
              <Field v-slot="{ field, errorMessage }" name="name">
                <VField>
                  <label>{{ t('label.name') }}</label>
                  <VControl icon="feather:user" :has-error="Boolean(errorMessage)">
                    <input
                      v-bind="field"
                      class="input"
                      type="text"
                      :disabled="isLoading"
                      autocomplete="name"
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
            <h4>Permissions</h4>
            <p>Check all the allowed permissions for this role.</p>
          </div>

          <div
            v-for="(permissionModule, permissionModuleKey) in references.permissions"
            :key="permissionModuleKey"
            class="permission-module"
          >
            <hr />
            <VTag class="mb-2" color="primary" :label="permissionModule.module" />
            <div class="select-all-wrapper">
              <VCheckbox
                class="px-0"
                v-model="selectedModules"
                :value="permissionModule.module"
                @update:modelValue="onSelectAllPermissions(permissionModule.module)"
                label="Select All"
                color="primary"
              />
            </div>

            <div class="columns is-multiline pl-4">
              <!--Field-->
              <div
                v-for="(permission, permissionKey) in permissionModule.permissions"
                :key="permissionKey"
                class="column is-6"
              >
                <Field name="permissions">
                  <VField>
                    <VControl>
                      <VCheckbox
                        v-model="selectedPermissions"
                        :label="permission"
                        :value="permission"
                        color="primary"
                      />
                    </VControl>
                  </VField>
                </Field>
              </div>
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
