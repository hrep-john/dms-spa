<script setup lang="ts">
import { ref, computed } from 'vue'
import EventEnum from '/@src/enums/changelog/event'
import { useI18n } from 'vue-i18n'

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
  }

  return description
}
</script>

<template>
  <div class="timeline-wrapper">
    <div class="timeline-header"></div>
    <div class="timeline-wrapper-inner">
      <div class="timeline-container">
        <!--Timeline item-->
        <div v-for="(item, key) in items" :key="key" class="timeline-item" :class="{ 'no-stem': items.length === 1 }">
          <div class="date">
            <span>{{ item.date }}</span>
          </div>
          <div class="dot is-primary"></div>
          <div class="content-wrap">
            <div class="content-box">
              <div class="status"></div>
              <VAvatar :picture="item.profile_picture_url" />

              <div class="box-text">
                <div class="meta-text">
									<span>{{ item.time }}</span>
									<span class="user-fullname">{{ item.full_name }}</span>
                  <p class="mt-3 description">  
										<label> {{ getItemDescription(item) }} </label>
                    <ol class="ml-4 mt-2">
											<li 
												v-for="(list, listKey) in item.changes" 
												:key="listKey"
												class="mt-1"
											>
                        <VTag color="info" :label="list.field" curved /> 
												<label class="is-lowercase mx-1">{{ t('label.from') }}</label>
                        <span>{{list.old_value}}</span>
												<label class="is-lowercase mx-1">{{ t('label.to') }}</label>
                        <span>{{list.new_value}}</span>
											</li>
										</ol>
                  </p>
                </div>
              </div>
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
  max-width: 940px;
  margin: 0 auto;

  .timeline-wrapper-inner {
    padding-top: 30px;

    .timeline-container {
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
            align-items: center;

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
              justify-content: space-between;
              margin-left: 12px;
              flex-grow: 2;

              .meta-text {
                line-height: 1.2;

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

                  .tag {
                    position: relative;
                    top: -1px;
                    font-weight: 500;
                    line-height: 1.8;
                    height: 1.8em;
                    margin: 0 2px;
                  }

                  ol {
                    li {
                      word-break: break-all;
                    }
                  }
                }

                > span {
                  color: var(--light-text);
                  font-size: 0.9rem;
                }

                .user-fullname {
                  font-weight: bolder;
                  color: var(--dark-text);
                  margin-left: 0.5rem;
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
