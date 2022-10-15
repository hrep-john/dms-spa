import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useViewWrapper = defineStore('viewWrapper', () => {
  const isPushed = ref(false)
  const isPushedBlock = ref(false)
  const pageTitle = ref('Welcome')
  const printoutTemplate = useStorage(
    'printoutTemplate',
    JSON.stringify({
      headers: {
        first_line: '',
        second_line: '',
        third_line: '',
      },
    })
  )

  function setPushed(value: boolean) {
    isPushed.value = value
  }
  function setPushedBlock(value: boolean) {
    isPushedBlock.value = value
  }
  function setPageTitle(value: string) {
    pageTitle.value = value
  }
  function getPrintoutTemplate() {
    return JSON.parse(printoutTemplate.value)
  }
  function setPrintoutTemplate(template: any) {
    printoutTemplate.value = JSON.stringify(template)
  }

  return {
    isPushed,
    isPushedBlock,
    pageTitle,
    printoutTemplate,
    setPushed,
    setPushedBlock,
    setPageTitle,
    getPrintoutTemplate,
    setPrintoutTemplate,
  } as const
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewWrapper, import.meta.hot))
}
