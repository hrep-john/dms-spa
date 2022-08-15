<script setup lang="ts">
import { ref, watchPostEffect, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

import type { SidebarTheme } from '/@src/components/navigation/desktop/Sidebar.vue'
import { usePanels } from '/@src/stores/panels'
import { useViewWrapper } from '/@src/stores/viewWrapper'
import { useUserSession } from '/@src/stores/userSession'

const props = withDefaults(
  defineProps<{
    theme?: SidebarTheme
    defaultSidebar?: string
    closeOnChange?: boolean
    openOnMounted?: boolean
    nowrap?: boolean
  }>(),
  {
    defaultSidebar: '',
    theme: 'default',
  }
)

const userSession = useUserSession()
const viewWrapper = useViewWrapper()
const panels = usePanels()
const route = useRoute()
const isMobileSidebarOpen = ref(false)
const isDesktopSidebarOpen = ref(props.openOnMounted)
const activeMobileSubsidebar = ref(props.defaultSidebar)

function switchSidebar(id: string) {
  if (id === activeMobileSubsidebar.value) {
    isDesktopSidebarOpen.value = !isDesktopSidebarOpen.value
  } else {
    isDesktopSidebarOpen.value = true
    activeMobileSubsidebar.value = id
  }
}

const isSuperadmin = computed(() => {
  const roles = userSession.roles ? JSON.parse(userSession.roles) : []

  return roles.includes('superadmin')
})

const isAdmin = computed(() => {
  const roles = userSession.roles ? JSON.parse(userSession.roles) : []

  return isSuperadmin.value || roles.includes('admin')
})

/**
 * watchPostEffect callback will be executed each time dependent reactive values has changed
 */
watchPostEffect(() => {
  viewWrapper.setPushed(isDesktopSidebarOpen.value ?? false)
})
watch(
  () => route.fullPath,
  () => {
    isMobileSidebarOpen.value = false

    if (props.closeOnChange && isDesktopSidebarOpen.value) {
      isDesktopSidebarOpen.value = false
    }
  }
)
</script>

<template>
  <div class="sidebar-layout">
    <div class="app-overlay"></div>

    <!-- Mobile navigation -->
    <MobileNavbar
      :is-open="isMobileSidebarOpen"
      @toggle="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <template #brand>
        <RouterLink :to="{ name: 'index' }" class="navbar-item is-brand">
          <AnimatedLogo width="38px" height="38px" />
        </RouterLink>

        <div class="brand-end">
          <!-- <NotificationsMobileDropdown />
          <UserProfileDropdown /> -->
        </div>
      </template>
    </MobileNavbar>

    <!-- Mobile sidebar links -->
    <MobileSidebar
      :is-open="isMobileSidebarOpen"
      @toggle="isMobileSidebarOpen = !isMobileSidebarOpen"
    >
      <template #links>
        <li>
          <Tippy placement="right">
            <RouterLink :to="{ name: 'dashboard' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:home"
                @click="activeMobileSubsidebar = 'dashboard'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Dashboard</h4>
                </div>
                <div class="popover-body">
                  <p>View Dashboard.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <li>
          <Tippy placement="right">
            <RouterLink :to="{ name: 'documents' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:file"
                @click="activeMobileSubsidebar = 'documents'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Documents</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Documents.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <li v-if="isAdmin">
          <Tippy placement="right">
            <RouterLink :to="{ name: 'users' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:user"
                @click="activeMobileSubsidebar = 'users'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Users</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Users.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <!-- <li v-if="isAdmin">
          <Tippy placement="right">
            <a
              aria-label="Manage Reports"
              :class="[activeMobileSubsidebar === 'reports' && 'is-active']"
              tabindex="0"
              @keydown.space.prevent="activeMobileSubsidebar = 'reports'"
              @click="activeMobileSubsidebar = 'reports'"
            >
              <i aria-hidden="true" class="iconify" data-icon="bi:graph-up-arrow"></i>
            </a>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Reports</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Reports.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li> -->
        <li v-if="isSuperadmin">
          <Tippy placement="right">
            <RouterLink :to="{ name: 'tenants' }">
              <i
                aria-hidden="true"
                class="fas fa-building iconify sidebar-svg"
                @click="activeMobileSubsidebar = 'tenants'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Tenants</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Tenants.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
      </template>
    </MobileSidebar>

    <!-- Mobile subsidebar links -->
    <Transition name="slide-x">
      <KeepAlive>
        <DashboardsMobileSubsidebar
          v-if="isMobileSidebarOpen && activeMobileSubsidebar === 'dashboard'"
        />
        <ReportsMobileSubsidebar
          v-else-if="isMobileSidebarOpen && activeMobileSubsidebar === 'reports'"
          @close="isMobileSidebarOpen = false"
        />
      </KeepAlive>
    </Transition>

    <!-- Desktop navigation -->
    <!-- <CircularMenu /> -->

    <Sidebar :theme="props.theme" :is-open="isDesktopSidebarOpen">
      <template #links>
        <li>
          <Tippy placement="right">
            <RouterLink :to="{ name: 'dashboard' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:home"
                @click="activeMobileSubsidebar = 'dashboard'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Dashboard</h4>
                </div>
                <div class="popover-body">
                  <p>View Dashboard.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <li>
          <Tippy placement="right">
            <RouterLink :to="{ name: 'documents' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:file"
                @click="activeMobileSubsidebar = 'documents'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Documents</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Documents.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <li v-if="isAdmin">
          <Tippy placement="right">
            <RouterLink :to="{ name: 'users' }">
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:user"
                @click="activeMobileSubsidebar = 'users'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Users</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Users.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
        <!-- <li v-if="isAdmin">
          <Tippy placement="right">
            <a
              :class="[activeMobileSubsidebar === 'reports' && 'is-active']"
              data-content="Reports"
              aria-label="Reports"
              tabindex="0"
              @keydown.space.prevent="switchSidebar('reports')"
              @click="switchSidebar('reports')"
            >
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="bi:graph-up-arrow"
              ></i>
            </a>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Reports</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Reports.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li> -->
        <li v-if="isSuperadmin">
          <Tippy placement="right">
            <RouterLink :to="{ name: 'tenants' }">
              <i
                aria-hidden="true"
                class="fas fa-building sidebar-svg"
                @click="activeMobileSubsidebar = 'tenants'"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Tenants</h4>
                </div>
                <div class="popover-body">
                  <p>Manage Tenants.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>
      </template>

      <template #bottom-links>
        <!-- Settings -->
        <li class="is-hidden-touch">
          <Tippy placement="right">
            <RouterLink
              id="open-settings"
              :to="{ name: 'settings' }"
              data-content="Settings"
            >
              <i
                aria-hidden="true"
                class="iconify sidebar-svg"
                data-icon="feather:settings"
              ></i>
            </RouterLink>
            <template #content>
              <div class="v-popover-content is-text">
                <div class="popover-head">
                  <h4 class="dark-inverted">Settings</h4>
                </div>
                <div class="popover-body">
                  <p>View Settings.</p>
                </div>
              </div>
            </template>
          </Tippy>
        </li>

        <!-- Profile Dropdown -->
        <li>
          <UserProfileDropdown up />
        </li>
      </template>
    </Sidebar>

    <Transition name="slide-x">
      <KeepAlive>
        <FilesSubsidebar
          v-if="isDesktopSidebarOpen && activeMobileSubsidebar === 'documents'"
          @close="isDesktopSidebarOpen = false"
        />
        <ReportsSubsidebar
          v-else-if="isDesktopSidebarOpen && activeMobileSubsidebar === 'reports'"
          @close="isDesktopSidebarOpen = false"
        />
      </KeepAlive>
    </Transition>

    <ActivityPanel />

    <VViewWrapper>
      <VPageContentWrapper>
        <template v-if="props.nowrap">
          <slot></slot>
        </template>
        <VPageContent v-else class="is-relative">
          <div class="page-title has-text-centered">
            <!-- Sidebar Trigger -->
            <div
              v-if="defaultSidebar !== ''"
              class="vuero-hamburger nav-trigger push-resize mr-4"
              tabindex="0"
              @keydown.space.prevent="isDesktopSidebarOpen = !isDesktopSidebarOpen"
              @click="isDesktopSidebarOpen = !isDesktopSidebarOpen"
            >
              <span class="menu-toggle has-chevron">
                <span :class="[isDesktopSidebarOpen && 'active']" class="icon-box-toggle">
                  <span class="rotate">
                    <i aria-hidden="true" class="icon-line-top"></i>
                    <i aria-hidden="true" class="icon-line-center"></i>
                    <i aria-hidden="true" class="icon-line-bottom"></i>
                  </span>
                </span>
              </span>
            </div>

            <div class="title-wrap">
              <h1 class="title is-4">{{ viewWrapper.pageTitle }}</h1>
            </div>

            <Toolbar class="desktop-toolbar">
              <!-- <a
                class="toolbar-link right-panel-trigger"
                aria-label="View activity panel"
                tabindex="0"
                @keydown.space.prevent="panels.setActive('activity')"
                @click="panels.setActive('activity')"
              >
                <i aria-hidden="true" class="iconify" data-icon="feather:grid"></i>
              </a> -->
            </Toolbar>
          </div>

          <slot></slot>
        </VPageContent>
      </VPageContentWrapper>
    </VViewWrapper>
  </div>
</template>

<style lang="scss" scoped>
a {
  i.fas {
    font-size: 1.25rem;
    text-align: center;
  }
}
</style>
