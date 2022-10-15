<template>
  <div class="mobile-subsidebar">
    <div class="inner">
      <div class="sidebar-title">
        <h3>Layouts</h3>
      </div>

      <ul class="submenu">
        <li>
          <div class="subsidebar-single-link mobile">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="foundation:graph-pie"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link mobile">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="foundation:graph-trend"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link mobile">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="entypo:bar-graph"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link mobile">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="entypo:area-graph"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
        <li>
          <div class="subsidebar-single-link mobile">
            <i
              aria-hidden="true"
              class="iconify sidebar-svg"
              data-icon="material-symbols:auto-graph-rounded"
            ></i>
            <RouterLink :to="{ name: 'users' }">Sample Report 1</RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
