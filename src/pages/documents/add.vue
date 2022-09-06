<script setup lang="ts">
/**
 * This is a Vue Component that will be
 * automatically mapped to a entry on vue-router.
 *
 * You will be able to access this page at http://localhost:3000/starters/sidebar-blank-page-1
 * Page uri will match related path to src/pages folder
 *
 * Read more about routing:
 * @see /vite.config.ts
 * @see /src/router.ts
 */

import { useHead } from '@vueuse/head'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { ref } from 'vue'
import { useUserSession } from '/@src/stores/userSession'
import { useNotyf } from '/@src/composable/useNotyf'

const notyf = useNotyf()
const userSession = useUserSession()
const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Add Document')

// Import Vue FilePond
import vueFilePond from 'vue-filepond'
// Import FilePond styles
import 'filepond/dist/filepond.min.css'
// Import FilePond plugins
// Please note that you need to install these plugins separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation filepond-plugin-file-validate-type --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
// temporary disable the file type validation, allow all file types
// import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'

const FilePond = vueFilePond(
  FilePondPluginFileValidateSize,
  // FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview
)

useHead({
  title: `Add Document - ${import.meta.env.VITE_PROJECT_NAME}`,
})

const isLoading = ref(false)

const uploadApiEndpoint = {
  url: import.meta.env.VITE_API_BASE_URL + '/api/documents',
  headers: {
    Authorization: `Bearer ${userSession.token}`,
    domain: window.location.host,
    Accept: 'application/json',
  },
  revert: {
    url: '/revert',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession.token}`,
      domain: window.location.host,
      Accept: 'application/json',
    },
  },
}

const breadcrumb = [
  {
    label: 'Document List',
    icon: 'feather:file',
    to: {
      name: 'documents',
    },
  },
  {
    label: 'Add Document',
  },
]

const uploadedDocuments = ref([])

const handleOnProcessDocument = (error: any, file: any) => {
  if (error) {
    notyf.error(`Unable to upload file (${file.filename})`)
    console.log('error = '.file.filename)

    console.log(error)
    return false
  }

  notyf.success(`Uploaded successfully (${file.filename})`)

  const result = JSON.parse(file.serverId)?.result

  uploadedDocuments.value.push({
    id: result.id,
    filename: result.filename,
  })
}
</script>

<template>
  <SidebarLayout>
    <!-- Content Wrapper -->
    <div class="page-content-inner">
      <!--
          Page content goes here

          You can see pages content samples from 
          files in /src/components/pages directory
        -->
      <VBreadcrumb :items="breadcrumb" separator="arrow" with-icons />

      <file-pond
        :drop-on-page="true"
        :drop-on-element="false"
        class="has-light-shadow has-dark-border is-bordered"
        name="document"
        ref="pond"
        label-idle="Drop files here..."
        v-bind:allow-multiple="true"
        maxFileSize="30MB"
        :server="uploadApiEndpoint"
        v-on:processfile="handleOnProcessDocument"
      />
    </div>
  </SidebarLayout>
</template>

<style lang="scss">
.page-content-inner {
  .filepond--wrapper {
    cursor: pointer !important;

    a.filepond--credits {
      display: none !important;
    }
  }
}
</style>