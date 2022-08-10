<script setup lang="ts">
import { computed } from 'vue'
import { useUserSession } from '/@src/stores/userSession'
import { current_version } from '/@src/data/changelog.json'

const userSession = useUserSession()

const currentVersion = computed(() => {
  return `Version ${current_version}`
})

const user = computed(() => {
  return JSON.parse(userSession.user)
})

const userRole = computed(() => {
  return userSession.role
})

const getUserProfilePicture = () => {
  const userLocal = JSON.parse(userSession.user)
  return userLocal.profile_picture_url == undefined || userLocal.profile_picture_url == ''
    ? 'https://via.placeholder.com/150x150'
    : userLocal.profile_picture_url
}
</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-header has-text-centered">
      <VAvatar size="xl" :picture="getUserProfilePicture()" />

      <h3 class="title is-4 is-narrow mt-2">
        {{ user.first_name }} {{ user.last_name }}
      </h3>
      <p class="light-text is-uppercase mb-2">{{ userRole }}</p>
      <VTag color="primary" :label="currentVersion" />
    </div>

    <div class="profile-body mt-4">
      <div class="settings-section">
        <RouterLink :to="{ name: 'settings-udfs' }" class="settings-box">
          <div class="edit-icon">
            <i aria-hidden="true" class="lnil lnil-pencil"></i>
          </div>

          <VIconWrap dark="6" icon="fas fa-columns" />

          <span>User Defined Field</span>
          <h3>Manage User Defined Fields</h3>
        </RouterLink>
        <RouterLink :to="{ name: 'settings-changelog' }" class="settings-box">
          <div class="edit-icon">
            <i aria-hidden="true" class="lnil lnil-pencil"></i>
          </div>

          <VIconWrap dark="6" icon="lnil lnir-alarm-clock" />

          <span>Changelog</span>
          <h3>View App Changelog</h3>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../../../scss/abstracts/mixins';

.profile-wrapper {
  .profile-body {
    .settings-section {
      display: flex;
      flex-wrap: wrap;
      max-width: 880px;
      margin: 0 auto;

      .settings-box {
        position: relative;
        width: calc(50% - 16px);
        background: var(--white);
        text-align: center;
        padding: 16px;
        margin: 8px;
        border-radius: 8px;
        border: 1px solid var(--fade-grey-dark-3);
        transition: all 0.3s; // transition-all test

        // &.disabled {
        //   pointer-events: none;
        //   cursor: not-allowed;
        // }

        &:hover,
        &:focus {
          border-color: var(--primary);
          box-shadow: var(--light-box-shadow);

          .edit-icon {
            opacity: 1;
            pointer-events: all;
          }

          .icon-wrap {
            i {
              color: var(--primary);
            }
          }

          h3 {
            color: var(--primary);
          }
        }

        &.is-active {
          .icon-wrap {
            i {
              color: var(--primary);
            }
          }

          h3 {
            color: var(--primary);
          }
        }

        .edit-icon {
          position: absolute;
          top: 6px;
          left: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 18px;
          width: 18px;
          border-radius: var(--radius-rounded);
          background: var(--fade-grey-light-3);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s; // transition-all test

          i {
            font-size: 0.8rem;
          }
        }

        .icon-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          background: none !important;
          border: none;
          box-shadow: none;
          height: 62px;
          width: 100%;

          i {
            font-size: 2.7rem;
            color: var(--light-text-light-12);
            margin-bottom: 4px;
            transition: color 0.3s;
          }

          img {
            display: block;
            max-width: 90px;
          }
        }

        span {
          text-align: center;
          display: block;
          text-transform: uppercase;
          color: var(--light-text);
          font-family: var(--font-alt);
          font-size: 0.7rem;
          letter-spacing: 1px;
        }

        h3 {
          font-family: var(--font);
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--light-text);
          transition: color 0.3s;
        }
      }
    }
  }
}

.is-dark {
  .profile-wrapper {
    .profile-body {
      .settings-section {
        .settings-box {
          background: var(--dark-sidebar-light-6);
          border-color: var(--dark-sidebar-light-12);

          &:hover,
          &:focus {
            border-color: var(--primary);

            h3 {
              color: var(--primary);
            }

            .icon-wrap i {
              color: var(--primary);
            }
          }

          &.is-active {
            h3 {
              color: var(--primary);
            }

            .icon-wrap i {
              color: var(--primary);
            }
          }

          .edit-icon {
            background: var(--dark-sidebar-light-2);

            i {
              color: var(--primary);
            }
          }

          .icon-wrap {
            background: none !important;

            i {
              color: var(--light-text-dark-20);

              &.is-solid {
                color: var(--primary);
              }
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .profile-wrapper {
    .profile-body {
      .settings-section {
        .settings-box {
          width: calc(50% - 16px);
        }
      }
    }
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .profile-wrapper {
    .profile-body {
      .settings-section {
        .settings-box {
          width: calc(25% - 16px);
        }
      }
    }
  }
}
</style>
