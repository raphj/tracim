export const CUSTOM_EVENT = {
  ADD_FLASH_MSG: 'addFlashMsg',
  ALL_APP_CHANGE_LANGUAGE: 'allApp_changeLanguage',
  APPEND_BREADCRUMBS: 'appendBreadcrumbs',
  APP_CLOSED: 'appClosed',
  APP_CUSTOM_EVENT_LISTENER: 'appCustomEventListener',
  DISCONNECTED_FROM_API: 'disconnectedFromApi',
  HIDE_APP: type => `${type}_hideApp`,
  HIDE_POPUP_CREATE_CONTENT: 'hide_popupCreateContent',
  HIDE_POPUP_CREATE_WORKSPACE: 'hide_popupCreateWorkspace',
  OPEN_CONTENT_URL: 'openContentUrl',
  REDIRECT: 'redirect',
  REFRESH_CONTENT_LIST: 'refreshContentList',
  REFRESH_DASHBOARD_MEMBER_LIST: 'refreshDashboardMemberList',
  REFRESH_WORKSPACE_DETAIL: 'refreshWorkspaceDetail',
  REFRESH_WORKSPACE_LIST: 'refreshWorkspaceList',
  REFRESH_WORKSPACE_LIST_THEN_REDIRECT: 'refreshWorkspaceList_then_redirect',
  RELOAD_CONTENT: type => `${type}_reloadContent`,
  SET_BREADCRUMBS: 'setBreadcrumbs',
  SET_HEAD_TITLE: 'setHeadTitle',
  SHOW_APP: type => `${type}_showApp`,
  SHOW_CREATE_WORKSPACE_POPUP: 'showCreateWorkspacePopup',
  UNMOUNT_APP: 'unmount_app',
  USER_CONNECTED: 'userConnected',
  USER_DISCONNECTED: 'userDisconnected'
}
