<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, onMounted, watch } from 'vue'
import { useNotyf } from '/@src/composable/useNotyf'

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

const notyf = useNotyf()
const emit = defineEmits(['submit'])

const { y } = useWindowScroll()

const details = ref({
  domain: '',
  name: '',
})

const isStuck = computed(() => {
  return y.value > 30
})

const submit = () => {
  const data = {
    domain: details.value.domain,
    name: details.value.name,
  }

  emit('submit', data)
}

const handleDefaultValue = () => {
  const defaultValue = props.defaultValue

  if (defaultValue) {
    details.value = defaultValue
  }
}

const isLoading = computed(() => {
  return props.loading
})

onMounted(() => {})

watch(
  () => [props.defaultValue],
  (values) => {
    handleDefaultValue()
  }
)
</script>

<template>
  <form class="form-layout" @submit.prevent>
    <VMessage
      color="danger"
      v-for="(error, key) in props.errors.data"
      :key="key"
      v-show="props.errors.show"
    >
      {{ error }}
    </VMessage>

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
                :to="{ name: 'tenants' }"
                light
                dark-outlined
              >
                Cancel
              </VButton>
              <VButton color="primary" raised @click="submit"> Submit </VButton>
            </div>
          </div>
        </div>
      </div>
      <div class="form-body">
        <!--Fieldset-->
        <div class="form-fieldset" v-if="!props.isNew">
          <div class="fieldset-heading">
            <h4>Record Info</h4>
          </div>

          <div class="columns is-multiline">
            <div class="column is-6">
              <VField>
                <label>Created By</label>
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
                <label>Date Created</label>
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
                <label>Updated By</label>
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
                <label>Last Updated</label>
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
            <h4>Tenant Info</h4>
            <p>Tell us about your tenant</p>
          </div>

          <div class="columns is-multiline">
            <div class="column is-6">
              <VField>
                <label>Tenant Domain *</label>
                <VControl>
                  <input
                    v-model="details.domain"
                    type="text"
                    class="input"
                    placeholder=""
                    autocomplete="domain"
                    :disabled="isLoading"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <VField>
                <label>Tenant Name *</label>
                <VControl>
                  <input
                    v-model="details.name"
                    type="text"
                    class="input"
                    placeholder=""
                    autocomplete="name"
                    :disabled="isLoading"
                  />
                </VControl>
              </VField>
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
