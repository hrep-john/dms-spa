<script setup lang="ts">
import { ref, computed } from 'vue'
import EventEnum from '/@src/enums/changelog/event'
import { useI18n } from 'vue-i18n'
import { humanize } from '/@src/utils/helper'

const { t } = useI18n()

const props = defineProps({
  items: {
    type: Object,
    default: {},
  },
})

const items = computed(() => {
  return props.items
})

const getItemDescription = (item: { event: ''; filename: '' }) => {
  let description = ''

  switch (item.event) {
    case EventEnum.Created:
      description = ` Uploaded a file (${item.filename}).`
      break
    case EventEnum.Updated:
      description = ' Edited the following fields: '
      break
    case EventEnum.Deleted:
      description = ` Deleted a file (${item.filename}).`
      break
    case EventEnum.Downloaded:
      description = ` Downloaded this file (${item.filename}).`
      break
    case EventEnum.Viewed:
      description = ` Viewed this file (${item.filename}).`
      break
  }

  return description
}
</script>

<template>
  <div class="timeline-wrapper">
    <div class="timeline-wrapper-inner">
      <div class="timeline-container">
        <!--Timeline item-->
        <div
          v-for="(item, key) in items"
          :key="key"
          class="timeline-item"
          :class="{ 'no-stem': items.length === 1 }"
        >
          <div class="date">
            <span>{{ item.date }}</span>
          </div>
          <div class="dot is-primary"></div>
          <div class="content-wrap">
            <div class="content-box">
              <div class="box-text">
                <div class="avatar-wrapper">
                  <VAvatar :picture="item.profile_picture_url" />
                </div>
                <div class="meta-text">
                  <span>{{ item.time }}</span>
                  <span class="user-fullname">{{ item.full_name }}</span>
                  <div class="description">
                    <label> {{ getItemDescription(item) }} </label>
                  </div>
                </div>
              </div>

              <table
                v-if="item.changes.length > 0"
                class="table is-striped is-fullwidth mt-2"
              >
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Old Value</th>
                    <th scope="col">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(list, listKey) in item.changes" :key="listKey">
                    <td>{{ humanize(list.field) }}</td>
                    <td>{{ list.old_value }}</td>
                    <td>{{ list.new_value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../scss/abstracts/mixins';

/*
  1. Timeline
  2. Timeline Dark mode
  3. Media Queries
*/

/* ==========================================================================
1. Timeline
========================================================================== */
.timeline-wrapper {
  max-width: 100%;
  margin: 0 auto;

  .timeline-wrapper-inner {
    .timeline-container {
      max-height: 50vh;
      overflow-y: auto;

      .timeline-item {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &::before {
          content: '';
          position: absolute;
          top: 0%;
          left: 111px;
          height: 110%;
          width: 2px;
          background: var(--placeholder);
          z-index: 0;
        }

        &:first-child {
          &::before {
            height: 60%;
            top: 50%;
          }
        }

        &:last-child {
          &::before {
            height: 50%;
          }
        }

        &.no-stem {
          &::before {
            height: 0px;
          }
        }

        &.is-unread {
          .content-wrap {
            .content-box {
              .status {
                background: var(--red) !important;
              }
            }
          }
        }

        .content-wrap {
          // border: none !important;
        }

        .date {
          width: 80px;
          font-family: var(--font);
          text-align: right;

          span {
            font-size: 0.9rem;
            color: var(--light-text);
          }
        }

        .dot {
          position: relative;
          height: 14px;
          width: 14px;
          border-radius: var(--radius-rounded);
          border: 2.6px solid var(--primary);
          margin: 0 25px;
          z-index: 1;

          &.is-info {
            border-color: var(--info);
          }

          &.is-success {
            border-color: var(--success);
          }

          &.is-warning {
            border-color: var(--warning);
          }

          &.is-danger {
            border-color: var(--danger);
          }

          &.is-purple {
            border-color: var(--purple);
          }
        }

        .content-wrap {
          @include vuero-s-card;

          flex-grow: 2;

          .content-box {
            display: flex;
            flex-direction: column;

            .status {
              height: 8px;
              width: 8px;
              min-width: 8px;
              border-radius: var(--radius-rounded);
              background: var(--light-text-light-15);
              margin: 0 16px 0 0;
            }

            .box-text {
              display: flex;
              align-items: center;
              flex-grow: 2;

              .meta-text {
                line-height: 1.2;
                width: 100%;
                margin-left: 1rem;

                .user-fullname {
                  font-weight: bolder;
                  color: var(--dark-text);
                  margin-left: 0.5rem;
                }

                p.description {
                  color: var(--light-text-dark-10);

                  span {
                    font-family: var(--font-alt);
                    color: var(--dark-text);
                    font-weight: 600;
                  }

                  a {
                    color: var(--primary);
                  }
                }

                > span {
                  color: var(--light-text);
                  font-size: 0.9rem;
                }
              }
            }

            .box-end {
              margin-left: auto;

              .v-avatar {
                margin: 0 2px;
              }
            }
          }

          .meta-content {
            padding-left: 78px;
          }
        }
      }
    }

    .load-more-wrap {
      padding: 40px 0;

      .button {
        min-width: 240px;
        min-height: 50px;
        text-transform: uppercase;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--light-text);
      }
    }
  }
}

/* ==========================================================================
2. Timeline Dark mode
========================================================================== */

.is-dark {
  .timeline-wrapper {
    .timeline-wrapper-inner {
      .timeline-container {
        .timeline-item {
          &::before {
            background: var(--dark-sidebar-light-20);
          }

          .content-wrap {
            @include vuero-card--dark;

            .content-box {
              .status {
                background: var(--dark-sidebar-light-20);
              }

              .box-text {
                .meta-text {
                  p {
                    span {
                      color: var(--dark-dark-text);
                    }

                    a {
                      color: var(--primary);
                    }
                  }
                }
              }
            }
          }
        }
      }

      .load-more-wrap {
        .button {
          background: var(--dark-sidebar-light-2) !important;
        }
      }
    }
  }
}

/* ==========================================================================
3. Media Queries
========================================================================== */

@media only screen and (max-width: 767px) {
  .timeline-wrapper {
    .timeline-wrapper-inner {
      padding-top: 0;

      .timeline-container {
        .timeline-item {
          flex-direction: column;

          &::before {
            display: none;
          }

          .dot {
            display: none;
          }

          .date {
            align-self: end;
            margin-bottom: 4px;
          }

          .content-wrap {
            .content-box {
              .box-end {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .timeline-wrapper {
    .timeline-wrapper-inner {
      padding-top: 0;

      .timeline-container {
        .timeline-item {
          flex-direction: column;

          &::before {
            display: none;
          }

          .dot {
            display: none;
          }

          .date {
            align-self: end;
            margin-bottom: 4px;
          }

          .content-wrap {
            .content-box {
              .box-end {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>
