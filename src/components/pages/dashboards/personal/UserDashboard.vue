<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useUserSession } from '/@src/stores/userSession'

const userSession = useUserSession()

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const user = computed(() => {
  if (userSession.user === undefined) {
    return {}
  }

  return JSON.parse(userSession.user || '')
})

const getUserProfilePicture = () => {
  return user.value.profile_picture_url == undefined ||
    user.value.profile_picture_url == ''
    ? 'https://via.placeholder.com/150x150'
    : user.value.profile_picture_url
}

const recentDocuments = computed(() => {
  return props.data.recent_documents || []
})

const assignedDocuments = computed(() => {
  return props.data.assigned_documents || []
})

const getFileIcon = (fileType: any) => {
  const fileTypes = [
    'ai',
    'doc',
    'docx',
    'jpg',
    'jpeg',
    'pdf',
    'png',
    'ppt',
    'svg',
    'txt',
    'xls',
    'xlsx',
    'zip',
  ]

  const type = fileTypes.includes(fileType) ? fileType : 'unknown'

  return `images/icons/files/${type}.svg`
}

const getTimeAgo = (updatedAt: Date) => {
  const timeAgo = useTimeAgo(new Date(updatedAt)).value
  return `Updated ${timeAgo}`
}

const truncateText = (text: string, extension: string) => {
  return text.length > 70 ? `${text.replace(/(.{65})..+/, '$1…')}${extension}` : text
}
</script>

<template>
  <div class="personal-dashboard personal-dashboard-v2">
    <!--Personal Dashboard V2-->
    <div class="columns is-multiline">
      <div class="column is-12">
        <div class="dashboard-header">
          <VAvatar :picture="getUserProfilePicture()" size="xl" />
          <div class="user-meta is-dark-bordered-12">
            <h3 class="title is-4 is-narrow is-bold">
              Welcome back, {{ user.first_name }} {{ user.last_name }}.
            </h3>
            <p class="light-text">It's really nice to see you again</p>
          </div>
          <div class="user-action">
            <VButtons>
              <RouterLink :to="{ name: 'documents-add' }">
                <VButton color="primary" icon="feather:upload" raised rounded>
                  Upload Documents
                </VButton>
              </RouterLink>
            </VButtons>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Recently Modified</h3>
            <RouterLink
              v-if="recentDocuments.length > 0"
              class="action-link"
              :to="{ name: 'documents' }"
            >
              <span>View All</span>
            </RouterLink>
          </div>
          <div v-if="recentDocuments.length > 0 || isLoading" class="active-projects">
            <VBlock
              v-show="!isLoading"
              v-for="(document, key) in recentDocuments"
              :key="key"
              :title="truncateText(document.filename, document.extension)"
              :subtitle="getTimeAgo(document.updated_at)"
              center
              :class="{ 'no-margin': recentDocuments.length === key + 1 }"
            >
              <template #icon>
                <span
                  class="fiv-viv fiv-size-lg"
                  :class="'fiv-icon-' + document.extension"
                  @error.once="(event) => onceImageErrored(event, '150x150')"
                ></span>
              </template>
            </VBlock>

            <DashboardCardPlaceload v-show="isLoading" />
          </div>

          <VMessage v-else color="info">No recent documents...</VMessage>
        </div>
      </div>

      <div class="column is-6">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Recently Shared To You</h3>
            <RouterLink
              v-if="assignedDocuments.length > 0"
              class="action-link"
              :to="{ name: 'documents' }"
            >
              <span>View All</span>
            </RouterLink>
          </div>
          <div v-if="assignedDocuments.length > 0 || isLoading" class="active-projects">
            <VBlock
              v-show="!isLoading"
              v-for="(document, key) in assignedDocuments"
              :key="key"
              :title="truncateText(document.filename, document.extension)"
              :subtitle="getTimeAgo(document.updated_at)"
              center
              :class="{ 'no-margin': assignedDocuments.length === key + 1 }"
            >
              <template #icon>
                <span
                  class="fiv-viv fiv-size-lg"
                  :class="'fiv-icon-' + document.extension"
                  @error.once="(event) => onceImageErrored(event, '150x150')"
                ></span>
              </template>
            </VBlock>

            <DashboardCardPlaceload v-show="isLoading" />
          </div>

          <VMessage v-else color="info">No recent documents...</VMessage>
        </div>
      </div>

      <!-- <div class="column is-4">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Assigned To You</h3>
            <RouterLink class="action-link" :to="{ name: 'documents' }">
              <span>View All</span>
            </RouterLink>
          </div>
          <div class="active-projects">
            <VBlock
              v-show="!isLoading"
              v-for="(document, key) in recentDocuments"
              :key="key"
              :title="document.filename"
              :subtitle="getTimeAgo(document.updated_at)"
              center
              :class="{ 'no-margin': recentDocuments.length === key + 1 }"
            >
              <template #icon>
                <VAvatar
                  :picture="getFileIcon(document.extension)"
                  size="medium"
                  squared
                />
              </template>
            </VBlock>

            <DashboardCardPlaceload v-show="isLoading" />
          </div>
        </div>
      </div> -->

      <!-- <div class="column is-6">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Weekly Deadline Documents</h3>
            <RouterLink class="action-link" :to="{ name: 'documents' }">
              <span>View All</span>
            </RouterLink>
          </div>
          <div class="active-projects">
            <VBlock
              v-show="!isLoading"
              v-for="(document, key) in recentDocuments"
              :key="key"
              :title="document.filename"
              :subtitle="getTimeAgo(document.updated_at)"
              center
            >
              <template #icon>
                <VAvatar
                  :picture="getFileIcon(document.extension)"
                  size="medium"
                  squared
                />
              </template>
            </VBlock>

            <DashboardCardPlaceload v-show="isLoading" />
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss">
@import '../../../../scss/abstracts/mixins';

.is-navbar {
  .personal-dashboard {
    margin-top: 30px;
  }
}

.personal-dashboard-v2 {
  .dashboard-header {
    @include vuero-s-card;

    display: flex;
    align-items: center;
    padding: 30px;

    .user-meta {
      padding: 0 3rem;
      border-right: 1px solid var(--fade-grey-dark-3) h3 {
        max-width: 180px;
      }
    }

    .user-action {
      padding: 0 1rem;
      justify-content: flex-end;
      margin-left: auto;
    }
  }

  .dashboard-card {
    @include vuero-s-card;

    padding: 30px;

    &:not(:last-child) {
      margin-bottom: 1.5rem;
    }

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h3 {
        font-family: var(--font-alt);
        font-size: 1rem;
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 0;
      }
    }

    .active-projects,
    .active-team,
    .active-list {
      padding: 10px 0;

      .flex-meta {
        span {
          word-break: break-all;
        }
      }

      .fiv-viv {
        min-width: 3rem;
      }
    }
  }
}

.is-dark {
  .personal-dashboard-v2 {
    .dashboard-header,
    .dashboard-card {
      @include vuero-card--dark;
    }

    .home-header {
      .cta {
        background: var(--primary-light-2);
        box-shadow: var(--primary-box-shadow);
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .personal-dashboard-v2 {
    .dashboard-header {
      flex-direction: column;
      text-align: center;

      .v-avatar {
        margin-bottom: 10px;
      }

      .user-meta {
        padding-top: 10px;
        padding-bottom: 10px;
        border: none;
      }

      .user-action {
        padding-bottom: 30px;
      }

      .cta {
        margin-left: 0;
      }
    }

    .active-projects {
      .media-flex-center {
        .flex-end {
          .avatar-stack {
            display: none;
          }
        }
      }
    }
  }
}
</style>
