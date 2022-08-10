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
  return props.data.recent_documents
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
              <VButton color="info" icon="feather:clipboard" raised elevated rounded>
                View Reports
              </VButton>
              <VButton color="primary" icon="feather:upload" raised elevated rounded>
                Upload Documents
              </VButton>
            </VButtons>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Recently Modified Documents</h3>
            <a class="action-link" tabindex="0">View All</a>
          </div>
          <div class="active-projects">
            <!--Project-->
            <VBlock
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
              <template #action>
                <UserCardDropdown />
              </template>
            </VBlock>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="dashboard-card has-margin-bottom">
          <div class="card-head">
            <h3 class="dark-inverted">Weekly Deadline Documents</h3>
            <a class="action-link" tabindex="0">View All</a>
          </div>
          <div class="active-projects">
            <!--Project-->
            <VBlock
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
              <template #action>
                <UserCardDropdown />
              </template>
            </VBlock>
          </div>
        </div>
      </div>
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
