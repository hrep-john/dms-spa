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
    } else if (err.code === 'ECONNABORTED') {
      return {
        success: false,
        body: {
          message:
            'Looks like the server is taking too long to responds. Please contact our technical team for support.',
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

export const isJson = (text: string) => {
  try {
    JSON.parse(text)
    return true
  } catch (error) {
    return false
  }
}

export const toUnixTimestamp = (date: Date) => {
  const unixTimestamp = Math.floor(date.getTime() / 1000)
  return unixTimestamp
}

export const toDateString = (unixTimestamp: any) => {
  let dateString = ''

  if (unixTimestamp != '' && unixTimestamp !== null) {
    unixTimestamp = parseInt(unixTimestamp)
    dateString = new Date(unixTimestamp).toISOString().split('T')[0]
  }

  return dateString
}

export const groupBy = (array: Array<string>, key: string) =>
  array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
  }, {})

export const humanize = (str: string) => {
  let i
  let frags = str.split('_')

  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
  }
  frags.forEach((frag) => {
    frag = frag.charAt(0).toUpperCase() + frag.slice(1)
  })

  return frags.join(' ')
}
