import {
  FETCH_CONFIG,
  ROLE,
  PROFILE,
  STATUSES,
  API_URL,
  SYSTEM_CONFIG,
  DOM_CONTAINER,
  LOGGED_USER
} from 'tracim_frontend_lib'

export const debug = {
  config: {
    apiHeader: FETCH_CONFIG.headers,
    apiUrl: API_URL,
    availableStatuses: STATUSES,
    profileObject: PROFILE,
    roleList: ROLE,
    system: SYSTEM_CONFIG,
    domContainer: DOM_CONTAINER,
    slug: 'file',
    faIcon: 'paperclip',
    hexcolor: '#ffa500',
    creationLabel: 'Upload a file',
    translation: {
      en: {
        translation: {
        }
      },
      fr: {
        translation: {
        }
      }
    },
    label: 'File'
  },
  content: {
    content_id: 27,
    content_type: 'file',
    workspace_id: 5
  },
  loggedUser: LOGGED_USER
}
