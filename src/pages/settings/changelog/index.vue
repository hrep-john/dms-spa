<route lang="yaml">
meta:
  permissionsAllowed:
    - 'Settings: View Changelogs'
</route>

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

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Changelog')

useHead({
  title: `Changelog | ${import.meta.env.VITE_PROJECT_NAME}`,
})

const breadcrumb = [
  {
    label: 'Settings',
    icon: 'feather:settings',
    to: {
      name: 'settings',
    },
  },
  {
    label: 'Changelog',
  },
]
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

      <ChangelogTimeline :data="[]" />
    </div>
  </SidebarLayout>
</template>
