<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ColorPicker } from 'vue-accessible-color-picker'
import { useCssVar } from '@vueuse/core'

const emit = defineEmits(['change'])

export type AvailableColors =
  // states
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  // colors
  | 'purple'
  | 'blue'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'light-blue'
  // states
  | 'primary-grey'
  | 'smoke-white'
  | 'placeholder'
  | 'background-grey'
  // tenant customization
  | 'main-sidebar'
  | 'background-color'

const props = withDefaults(
  defineProps<{
    color: AvailableColors
    value: String
    label: String
  }>(),
  {}
)
const colorVarName = computed(() => `${props.color}`)

const colorHex = ref('')

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const updateColor = ({ colors }: any) => {
  colorHex.value = colors.hex
}

onMounted(() => {
  colorHex.value = props.value
})

watch(
  () => colorHex.value,
  (value) => {
    emit('change', {
      key: colorVarName.value,
      value: value,
    })
  }
)
</script>

<template>
  <div class="color-card">
    <div class="color-card-header">
      <div class="color-dot is-primary"></div>
      <div class="meta">
        <span>{{ props.label }}</span>
        <span>{{ colorHex }}</span>
      </div>
      <div class="actions">
        <VAction tabindex="0" @keydown.space.prevent="toggle" @click="toggle">
          <span v-if="isOpen">Close</span>
          <span v-else>Customize</span>
        </VAction>
      </div>
    </div>
    <div v-if="isOpen">
      <div class="is-divider"></div>
      <div class="color-picker">
        <ColorPicker
          :id="props.color"
          class="hide-alpha hide-copy"
          :color="colorHex"
          default-format="hex"
          @color-change="updateColor"
        >
          <template #hue-range-input-label>
            <span class="sr-only">Hue</span>
          </template>

          <template #alpha-range-input-label>
            <span class="sr-only">Alpha</span>
          </template>

          <template #copy-button>
            <span class="sr-only">Copy color</span>

            <i class="iconify is-clickable" aria-hidden="true" data-icon="feather:copy" />
          </template>

          <template #format-switch-button>
            <span class="sr-only">Switch format</span>

            <i
              class="iconify rem-120 is-clickable"
              aria-hidden="true"
              data-icon="fluent:chevron-up-down-20-filled"
            />
          </template>
        </ColorPicker>
      </div>
      <dl class="color-picker-detail"></dl>
      <dl class="color-picker-detail"></dl>
      <dl class="color-picker-detail"></dl>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../scss/abstracts/mixins';

.color-picker {
  margin: 0 auto;
}

.color-card {
  @include vuero-s-card;

  .color-card-header {
    display: flex;
    align-items: center;
  }

  .is-divider {
    border-top-color: var(--widget-grey-dark-8);
  }

  dl {
    font: var(--font);
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:not(:last-child) {
      border-bottom: solid 1px var(--widget-grey-dark-4);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }

  dd {
    font: var(--font-alt);
  }

  dt {
    display: flex;
    flex-direction: column;
  }

  .color-dot {
    height: 40px;
    width: 40px;
    border-radius: var(--radius-rounded);
    background-color: v-bind(colorHex);
    box-shadow: var(--light-box-shadow);
  }

  .meta {
    margin-left: 12px;
    flex-grow: 1;

    span {
      display: block;
      font-family: var(--font-alt);

      &:first-child {
        color: var(--dark-text);
        font-weight: 600;
      }

      &:nth-child(2) {
        font-size: 0.9rem;
        color: var(--light-text);
      }
    }
  }
}

.is-dark {
  .color-card {
    @include vuero-card--dark;

    .is-divider {
      border-top-color: var(--dark-sidebar-light-12);
    }

    dl {
      &:not(:last-child) {
        border-bottom: solid 1px var(--dark-sidebar-light-16);
      }
    }

    .meta {
      span {
        &:first-child {
          color: var(--dark-dark-text);
        }
      }
    }
  }
}

.color-picker-detail {
  display: none !important;
}
</style>
