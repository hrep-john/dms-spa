<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'

const show = ref(false)
const deferredPrompt = ref()

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt')
  console.log('e', e)
  e.preventDefault()
  // Stash the event so it can be triggered later.
  deferredPrompt.value = e
})

window.addEventListener('appinstalled', () => {
  console.log('appinstalled')
  deferredPrompt.value = null
})

const onClose = () => {
  show.value = false
}

const onInstall = () => {
  deferredPrompt.value.prompt()
}
</script>

<template>
  <div v-if="show" class="banner py-4">
    <VMessage color="info" closable @close="onClose">
      <span> Get our free app. It won't take up space on your phone </span>
      <VButton color="info" @click="onInstall">Install</VButton>
    </VMessage>
  </div>
</template>

<style lang="scss">
.banner .message-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>