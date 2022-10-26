<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTenantSettings } from '/@src/stores/tenantSettings'

const props = defineProps<{
  light?: boolean
  width?: number
  height?: number
}>()

const height = ref('38px')
const width = ref('38px')

const router = useRouter()
const isLoading = ref(false)

const tenantLogo = computed(() => {
  return (
    useTenantSettings().tenantSettings.find((settings) => settings?.key === 'tenant-logo')
      ?.value || '/public/default-logo.png'
  )
})

router.beforeEach(() => {
  isLoading.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 200)
})

onMounted(() => {
  width.value = '38px'
  height.value = '38px'
})
</script>

<template>
  <img :src="tenantLogo" alt="logo" />
</template>

<style lang="scss" scoped>
.right {
  fill: var(--primary-dark-7);
}

.bottom {
  fill: var(--primary);
}

.left {
  fill: var(--primary-light-15);
}

.is-roll,
svg:hover {
  .right {
    animation: is-roll-right 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }

  .left {
    animation: is-roll-left 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }

  .bottom {
    animation: is-roll-bottom 8s ease infinite;
    animation-fill-mode: forwards;
    animation-delay: 0s;
  }
}

.is-light {
  .right {
    fill: var(--white);
    animation: none;
  }

  .bottom {
    fill: #fffc;
    animation: none;
  }

  .left {
    fill: #fffa;
    animation: none;
  }
}

@keyframes is-roll-right {
  0% {
    fill: var(--primary-dark-7);
  }

  33% {
    fill: var(--primary-light-8);
  }

  66% {
    fill: var(--primary-light-40);
  }

  100% {
    fill: var(--primary-dark-7);
  }
}

@keyframes is-roll-bottom {
  0% {
    fill: var(--primary);
  }

  33% {
    fill: var(--primary-light-24); // darken(#1ee8c0, 7%);
  }

  66% {
    fill: var(--primary-light-20);
  }

  100% {
    fill: var(--primary);
  }
}

@keyframes is-roll-left {
  0% {
    fill: var(--primary-light-15);
  }

  33% {
    fill: var(--primary-light-12); // lighten(#1ee8c0, 15%);
  }

  66% {
    fill: var(--primary-light-15);
  }

  100% {
    fill: var(--primary-light-15);
  }
}
</style>
