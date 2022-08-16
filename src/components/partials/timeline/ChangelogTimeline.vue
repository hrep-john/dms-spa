<script setup lang="ts">
import { computed } from 'vue'
import changelog from '../../../data/changelog.json'

const items = computed(() => {
  return changelog.versions
})
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
              <div class="box-text">
                <div class="meta-text">
                  <span class="release">Release {{ item.release_number }}</span>
                  <hr>
                  <p class="mt-4" v-if="item.features.length > 0">
                    <VTag color="primary" label="New Features" curved />
                    <ul class="mt-4">
											<li 
												v-for="(feature, featureKey) in item.features" 
												:key="featureKey"
												class="ml-5 mt-3 mb-3"
											>
												<h3 class="is-6 is-narrow subtitle">{{feature.subject}}</h3>
												<p class="mt-1">{{feature.description}}</p>
                      </li>
										</ul>
                  </p>
                  <p class="mt-4" v-if="item.enhancements.length > 0">
                    <hr>
                    <VTag color="info" label="Enhancements" curved />
                    <ul class="mt-4">
											<li 
												v-for="(feature, featureKey) in item.enhancements" 
												:key="featureKey"
												class="ml-5 mt-3 mb-3"
											>
												<h3 class="is-6 is-narrow subtitle">{{feature.subject}}</h3>
												<p class="mt-1">{{feature.description}}</p>
                      </li>
										</ul>
                  </p>
                  <p class="mt-4" v-if="item.bug_fixes.length > 0">
                    <hr>
                    <VTag color="danger" label="Bug Fixes" curved />
                    <ul class="mt-4">
											<li 
												v-for="(feature, featureKey) in item.bug_fixes" 
												:key="featureKey"
												class="ml-5 mt-3 mb-3"
											>
												<h3 class="is-6 is-narrow subtitle">{{feature.subject}}</h3>
												<p class="mt-1">{{feature.description}}</p>
                      </li>
										</ul>
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
                width: 100%;
                line-height: 1.2;

                p {
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
                  }
                }

                > span {
                  color: var(--light-text);
                }

                .release {
                  font-weight: bolder;
                  color: var(--dark-text);
                }

                ul {
                  list-style-type: disc;
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
