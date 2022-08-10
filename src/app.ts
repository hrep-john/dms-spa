import { createApp as createClientApp, h, Suspense } from 'vue'

import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { createI18n } from './i18n'
import { createRouter } from './router'
import VueroApp from './VueroApp.vue'
import './styles'

import { initDarkmode } from '/@src/stores/darkmode'
import { createApi } from '/@src/composable/useApi'

export type VueroAppContext = Awaited<ReturnType<typeof createApp>>

import { registerGlobalComponents, registerRouterNavigationGuards } from './app-custom'

import SimpleTypeahead from 'vue3-simple-typeahead'
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'

export async function createApp() {
  const head = createHead()
  const i18n = createI18n()
  const router = createRouter()
  const pinia = createPinia()
  const api = createApi()

  // const domain = window.location.host
  const app = createClientApp({
    // This is the global app setup function
    setup() {
      /**
       * Initialize the darkmode watcher
       *
       * @see /@src/stores/darkmode
       */
      initDarkmode()

      /**
       * Here we are creating a render function for our main app with
       * the main VueroApp component, wrapped in a Suspense component
       * to handle async loading of the app.
       * Template equivalent would be:
       *
       * <template>
       *   <Susupense>
       *     <VueroApp />
       *   </Susupense>
       * </template>
       */
      return () => {
        /**
         * The Suspense component is needed to use async in child components setup
         * @see https://v3.vuejs.org/guide/migration/suspense.html
         */
        return h(Suspense, null, {
          default: () => h(VueroApp),
        })
      }
    },
  })

  const vuero = {
    app,
    api,
    router,
    i18n,
    head,
    pinia,
  }

  await registerGlobalComponents(vuero)
  app.use(vuero.pinia)
  app.use(vuero.head)
  app.use(vuero.i18n)

  registerRouterNavigationGuards(vuero)
  app.use(vuero.router)

  app.use(SimpleTypeahead)

  return vuero
}
