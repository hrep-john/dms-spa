import { useUserSession } from '/@src/stores/userSession'
const userSession = useUserSession()

export const handleVuexApiCall = async (vuexAction, payload) => {
  try {
    const data = await vuexAction(payload)
    return { success: true, data }
  } catch (err: any) {
    if (err.response) {
      // Handle Response Errors
      const errorCode = err.response.data.errorCode
      const error = getErrorObj(errorCode)

      if (errorCode === 'UNAUTHENTICATED_ERROR') {
        userSession.logoutUser()
        const path = window.location.pathname
        window.location = `/auth/login?expired=true&redirect=${path}`
      }
      return { success: false, error, errorCode, body: err.response.data }
    } else if (err.message === 'no_internet') {
      return {
        success: false,
        error: {
          message:
            "We're having trouble connecting with the server. Please check your internet connection.",
          type: 'error',
        },
      }
    } else {
      // Throw an error if the error is not an HTTP response
      throw err
    }
  }
}

const getErrorObj = (errorCode: any) => {
  let message =
    'Sorry, we have encountered an unknown error. Please contact our technical team for support.'
  switch (errorCode) {
    case 'UNAUTHENTICATED_ERROR':
      message = 'Your session is expired'
      break
    case 'INVALID_CREDENTIALS_ERROR':
      message = 'Incorrect email or password'
      break
    case 'VALIDATION_ERROR':
      message = "We've encountered errors while validating your inputs"
      break
    case 'SMTP_ERROR':
      message = 'Failed to send email'
      break
    case 'RESOURCE_NOT_FOUND_ERROR':
      message = 'Sorry, the data you are looking for seems to be missing in our database'
      break
    case 'TOO_MANY_REQUESTS_ERROR':
      message = "We've received too many request from you. Please try again later."
  }
  return { message, type: 'error' }
}

export const createTempDownloadBtnLink = (url: string) => {
  var link = document.createElement('a')
  link.setAttribute('download', '')
  link.href = url
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export const doesUserCan = (permission: string) => {
  const permissions = JSON.parse(userSession.permissions)

  return permissions.includes(permission)
}
