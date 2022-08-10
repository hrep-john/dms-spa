import { createRouter as createClientRouter, createWebHistory } from 'vue-router'

/**
 * routes are generated using vite-plugin-pages
 * each .vue files located in the ./src/pages are registered as a route
 * @see https://github.com/hannoeru/vite-plugin-pages
 */
import routes from 'pages-generated'

export function createRouter() {
  const router = createClientRouter({
    history: createWebHistory(),
    routes,
  })

  const logoutUser = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('roles')
  }

  const isRolesAllowed = (to: any, userRoles: any) => {
    let flag = false

    userRoles.forEach((userRole) => {
      if (to.meta.rolesAllowed.includes(userRole)) {
        flag = true
      }
    })

    return flag
  }

  router.beforeEach((to, from, next) => {
    const isAuthenticatedUser = !!localStorage.getItem('token')
    const userRoles = JSON.parse(localStorage.getItem('roles') || '[]')
    const isRequiresNoAuth = to.meta.requiresNoAuth
    const isRequiresAuth = !isRequiresNoAuth

    // if route requires authentication and the user is not authenticated , redirect to the login route
    if (isRequiresAuth && !isAuthenticatedUser) {
      const nextRoute = {
        name: 'auth-login',
      }

      const excludedPaths = ['/', '/auth-login']

      if (!excludedPaths.includes(to.path)) {
        nextRoute.query = {
          redirect: to.fullPath,
        }
      } else {
        logoutUser()
      }

      next(nextRoute)
    } else if (isRequiresNoAuth && isAuthenticatedUser) {
      if (to.path === '/auth/reset-password') {
        logoutUser()
        next()
      } else {
        next({ name: 'dashboard' })
      }
    } else if (!!userRoles && !!to.meta.rolesAllowed && !isRolesAllowed(to, userRoles)) {
      next({ name: 'dashboard' })
    } else if (isRequiresAuth && isAuthenticatedUser && to.name == 'index') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })

  return router
}
