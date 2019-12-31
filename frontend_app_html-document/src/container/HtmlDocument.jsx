import React from 'react'
import HtmlDocumentComponent from '../component/HtmlDocument.jsx'
import { translate } from 'react-i18next'
import i18n from '../i18n.js'
import {
  appContentFactory,
  addAllResourceI18n,
  handleFetchResult,
  PopinFixed,
  PopinFixedHeader,
  PopinFixedOption,
  PopinFixedContent,
  PopinFixedRightPart,
  Timeline,
  NewVersionBtn,
  ArchiveDeleteContent,
  SelectStatus,
  displayDistanceDate,
  generateLocalStorageContentId,
  BREADCRUMBS_TYPE,
  appFeatureCustomEventHandlerShowApp,
  ROLE,
  CUSTOM_EVENT,
  APP_FEATURE_MODE
} from 'tracim_frontend_lib'
import { initWysiwyg } from '../helper.js'
import { debug } from '../debug.js'
import {
  getHtmlDocContent,
  getHtmlDocComment,
  getHtmlDocRevision,
  putHtmlDocContent,
  putHtmlDocRead
} from '../action.async.js'
import Radium from 'radium'

class HtmlDocument extends React.Component {
  constructor (props) {
    super(props)

    const param = props.data || debug

    props.setApiUrl(param.config.apiUrl)

    this.state = {
      appName: 'html-document',
      isVisible: true,
      config: param.config,
      loggedUser: param.loggedUser,
      content: param.content,
      externalTranslationList: [
        props.t('Text Document'),
        props.t('Text Documents'),
        props.t('Text document'),
        props.t('text document'),
        props.t('text documents'),
        props.t('Write a document')
      ],
      rawContentBeforeEdit: '',
      timeline: [],
      newComment: '',
      timelineWysiwyg: false,
      mode: APP_FEATURE_MODE.VIEW
    }

    // i18n has been init, add resources from frontend
    addAllResourceI18n(i18n, this.state.config.translation, this.state.loggedUser.lang)
    i18n.changeLanguage(this.state.loggedUser.lang)

    document.addEventListener(CUSTOM_EVENT.APP_CUSTOM_EVENT_LISTENER, this.customEventReducer)
  }

  customEventReducer = async ({ detail: { type, data } }) => { // action: { type: '', data: {} }
    const { state } = this
    switch (type) {
      case CUSTOM_EVENT.SHOW_APP(state.config.slug):
        console.log('%c<HtmlDocument> Custom event', 'color: #28a745', type, data)
        const isSameContentId = appFeatureCustomEventHandlerShowApp(data.content, state.content.content_id, state.content.content_type)
        if (isSameContentId) {
          this.setState({ isVisible: true })
          this.buildBreadcrumbs()
        }
        break

      case CUSTOM_EVENT.HIDE_APP(state.config.slug):
        console.log('%c<HtmlDocument> Custom event', 'color: #28a745', type, data)
        tinymce.remove('#wysiwygTimelineComment')
        tinymce.remove('#wysiwygNewVersion')
        this.setState({
          isVisible: false,
          timelineWysiwyg: false
        })
        break

      // CH - 2019-31-12 - This event is used to send a new content_id that will trigger data reload through componentDidUpdate
      case CUSTOM_EVENT.RELOAD_CONTENT(state.config.slug):
        console.log('%c<HtmlDocument> Custom event', 'color: #28a745', type, data)
        tinymce.remove('#wysiwygTimelineComment')
        tinymce.remove('#wysiwygNewVersion')

        this.setState(prev => ({
          content: { ...prev.content, ...data },
          isVisible: true,
          timelineWysiwyg: false
        }))
        break

      case CUSTOM_EVENT.RELOAD_APP_FEATURE_DATA(state.config.slug):
        await this.loadContent()
        this.loadTimeline()
        this.buildBreadcrumbs()
        break

      case CUSTOM_EVENT.ALL_APP_CHANGE_LANGUAGE:
        console.log('%c<HtmlDocument> Custom event', 'color: #28a745', type, data)

        initWysiwyg(state, state.loggedUser.lang, this.handleChangeNewComment, this.handleChangeText)

        this.setState(prev => ({
          loggedUser: {
            ...prev.loggedUser,
            lang: data
          }
        }))
        i18n.changeLanguage(data)
        this.loadContent()
        break
    }
  }

  async componentDidMount () {
    console.log('%c<HtmlDocument> did mount', `color: ${this.state.config.hexcolor}`)

    await this.loadContent()
    this.buildBreadcrumbs()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { state } = this

    console.log('%c<HtmlDocument> did update', `color: ${state.config.hexcolor}`, prevState, state)

    if (!prevState.content || !state.content) return

    if (prevState.content.content_id !== state.content.content_id) {
      await this.loadContent()
      this.buildBreadcrumbs()
      tinymce.remove('#wysiwygNewVersion')
      wysiwyg('#wysiwygNewVersion', state.loggedUser.lang, this.handleChangeText)
    }

    if (state.mode === APP_FEATURE_MODE.EDIT && prevState.mode !== APP_FEATURE_MODE.EDIT) {
      tinymce.remove('#wysiwygNewVersion')
      wysiwyg('#wysiwygNewVersion', state.loggedUser.lang, this.handleChangeText)
    }

    if (!prevState.timelineWysiwyg && state.timelineWysiwyg) wysiwyg('#wysiwygTimelineComment', state.loggedUser.lang, this.handleChangeNewComment)
    else if (prevState.timelineWysiwyg && !state.timelineWysiwyg) tinymce.remove('#wysiwygTimelineComment')

    // INFO - CH - 2019-05-06 - bellow is to properly init wysiwyg editor when reopening the same content
    if (!prevState.isVisible && state.isVisible) {
      initWysiwyg(state, state.loggedUser.lang, this.handleChangeNewComment, this.handleChangeText)
    }
  }

  componentWillUnmount () {
    console.log('%c<HtmlDocument> will Unmount', `color: ${this.state.config.hexcolor}`)
    tinymce.remove('#wysiwygNewVersion')
    tinymce.remove('#wysiwygTimelineComment')
    document.removeEventListener(CUSTOM_EVENT.APP_CUSTOM_EVENT_LISTENER, this.customEventReducer)
  }

  sendGlobalFlashMessage = msg => GLOBAL_dispatchEvent({
    type: CUSTOM_EVENT.ADD_FLASH_MSG,
    data: {
      msg: msg,
      type: 'warning',
      delay: undefined
    }
  })

  isValidLocalStorageType = type => ['rawContent', 'comment'].includes(type)

  getLocalStorageItem = type => {
    if (!this.isValidLocalStorageType(type)) {
      console.log('error in app htmldoc, wrong getLocalStorage type')
      return
    }

    const { state } = this
    return localStorage.getItem(
      generateLocalStorageContentId(state.content.workspace_id, state.content.content_id, state.appName, type)
    )
  }

  setLocalStorageItem = (type, value) => {
    if (!this.isValidLocalStorageType(type)) {
      console.log('error in app htmldoc, wrong setLocalStorage type')
      return
    }

    const { state } = this
    localStorage.setItem(
      generateLocalStorageContentId(state.content.workspace_id, state.content.content_id, state.appName, type),
      value
    )
  }

  buildBreadcrumbs = () => {
    const { state } = this

    GLOBAL_dispatchEvent({
      type: CUSTOM_EVENT.APPEND_BREADCRUMBS,
      data: {
        breadcrumbs: [{
          url: `/ui/workspaces/${state.content.workspace_id}/contents/${state.config.slug}/${state.content.content_id}`,
          label: state.content.label,
          link: null,
          type: BREADCRUMBS_TYPE.APP_FEATURE
        }]
      }
    })
  }

  loadContent = async () => {
    console.log('loadContent called')
    const { loggedUser, content, config, appName } = this.state

    const fetchResultHtmlDocument = getHtmlDocContent(config.apiUrl, content.workspace_id, content.content_id)
    const fetchResultComment = getHtmlDocComment(config.apiUrl, content.workspace_id, content.content_id)
    const fetchResultRevision = getHtmlDocRevision(config.apiUrl, content.workspace_id, content.content_id)

    const [resHtmlDocument, resComment, resRevision] = await Promise.all([
      handleFetchResult(await fetchResultHtmlDocument),
      handleFetchResult(await fetchResultComment),
      handleFetchResult(await fetchResultRevision)
    ])

    const resCommentWithProperDate = resComment.body.map(c => ({
      ...c,
      created_raw: c.created,
      created: displayDistanceDate(c.created, loggedUser.lang)
    }))

    const revisionWithComment = resRevision.body
      .map((r, i) => ({
        ...r,
        created_raw: r.created,
        created: displayDistanceDate(r.created, loggedUser.lang),
        timelineType: 'revision',
        commentList: r.comment_ids.map(ci => ({
          timelineType: 'comment',
          ...resCommentWithProperDate.find(c => c.content_id === ci)
        })),
        number: i + 1
      }))
      .reduce((acc, rev) => [
        ...acc,
        rev,
        ...rev.commentList.map(comment => ({
          ...comment,
          customClass: '',
          loggedUser: this.state.config.loggedUser
        }))
      ], [])

    const localStorageComment = localStorage.getItem(
      generateLocalStorageContentId(resHtmlDocument.body.workspace_id, resHtmlDocument.body.content_id, appName, 'comment')
    )

    // first time editing the doc, open in edit mode, unless it has been created with webdav or db imported from tracim v1
    // see https://github.com/tracim/tracim/issues/1206
    // @fixme Côme - 2018/12/04 - this might not be a great idea
    const modeToRender = (
      resRevision.body.length === 1 && // if content has only one revision
      loggedUser.userRoleIdInWorkspace <= ROLE.contributor.id && // if user has EDIT authorization
      resRevision.body[0].raw_content === '' // has content been created with raw_content (means it's from webdav or import db)
    )
      ? APP_FEATURE_MODE.EDIT
      : APP_FEATURE_MODE.VIEW

    // can't use this.getLocalStorageItem because it uses state that isn't yet initialized
    const localStorageRawContent = localStorage.getItem(
      generateLocalStorageContentId(resHtmlDocument.body.workspace_id, resHtmlDocument.body.content_id, appName, 'rawContent')
    )
    const hasLocalStorageRawContent = !!localStorageRawContent

    this.setState({
      mode: modeToRender,
      content: {
        ...resHtmlDocument.body,
        raw_content: modeToRender === APP_FEATURE_MODE.EDIT && hasLocalStorageRawContent
          ? localStorageRawContent
          : resHtmlDocument.body.raw_content
      },
      newComment: localStorageComment || '',
      rawContentBeforeEdit: resHtmlDocument.body.raw_content,
      timeline: revisionWithComment
    })

    await putHtmlDocRead(loggedUser, config.apiUrl, content.workspace_id, content.content_id) // mark as read after all requests are finished
    GLOBAL_dispatchEvent({ type: CUSTOM_EVENT.REFRESH_CONTENT_LIST, data: {} }) // await above makes sure that we will reload workspace content after the read status update
  }

  handleClickBtnCloseApp = () => {
    this.setState({ isVisible: false })
    GLOBAL_dispatchEvent({ type: CUSTOM_EVENT.APP_CLOSED, data: {} })
  }

  handleSaveEditTitle = async newTitle => {
    const { props, state } = this
    props.appContentChangeTitle(state.content, newTitle, state.config.slug)
  }

  handleClickNewVersion = () => {
    const previouslyUnsavedRawContent = this.getLocalStorageItem('rawContent')

    this.setState(prev => ({
      content: {
        ...prev.content,
        raw_content: previouslyUnsavedRawContent || prev.content.raw_content
      },
      rawContentBeforeEdit: prev.content.raw_content, // for cancel btn
      mode: APP_FEATURE_MODE.EDIT
    }))
  }

  handleCloseNewVersion = () => {
    tinymce.remove('#wysiwygNewVersion')

    this.setState(prev => ({
      content: {
        ...prev.content,
        raw_content: prev.rawContentBeforeEdit
      },
      mode: APP_FEATURE_MODE.VIEW
    }))

    const { appName, content } = this.state
    localStorage.removeItem(
      generateLocalStorageContentId(content.workspace_id, content.content_id, appName, 'rawContent')
    )
  }

  handleSaveHtmlDocument = async () => {
    const { state, props } = this

    const backupLocalStorage = this.getLocalStorageItem('rawContent')

    localStorage.removeItem(
      generateLocalStorageContentId(state.content.workspace_id, state.content.content_id, state.appName, 'rawContent')
    )

    const fetchResultSaveHtmlDoc = await handleFetchResult(
      await putHtmlDocContent(state.config.apiUrl, state.content.workspace_id, state.content.content_id, state.content.label, state.content.raw_content)
    )

    switch (fetchResultSaveHtmlDoc.apiResponse.status) {
      case 200:
        this.handleCloseNewVersion()
        this.loadContent()
        break
      default:
        this.setLocalStorageItem('rawContent', backupLocalStorage)
        this.sendGlobalFlashMessage(props.t('Error while saving new version')); break
    }
  }

  handleChangeText = e => {
    const newText = e.target.value // because SyntheticEvent is pooled (react specificity)
    this.setState(prev => ({ content: { ...prev.content, raw_content: newText } }))

    this.setLocalStorageItem('rawContent', newText)
  }

  handleChangeNewComment = e => {
    const { props, state } = this
    props.appContentChangeComment(e, state.content, this.setState.bind(this))
  }

  handleClickValidateNewCommentBtn = async () => {
    const { props, state } = this
    const response = await props.appContentSaveNewComment(state.content, state.timelineWysiwyg, state.newComment, this.setState.bind(this), state.config.slug)

    if (response.apiResponse.status === 200) {
      if (state.timelineWysiwyg) tinymce.get('wysiwygTimelineComment').setContent('')
    }
  }

  handleToggleWysiwyg = () => this.setState(prev => ({ timelineWysiwyg: !prev.timelineWysiwyg }))

  loadTimeline = () => {
    console.log('loadTimeline called')
  }

  handleChangeStatus = async newStatus => {
    const { props, state } = this
    props.appContentChangeStatus(state.content, newStatus, state.config.slug)
  }

  handleClickArchive = async () => {
    const { props, state } = this
    props.appContentArchive(state.content, this.setState.bind(this), state.config.slug)
  }

  handleClickDelete = async () => {
    const { props, state } = this
    props.appContentDelete(state.content, this.setState.bind(this), state.config.slug)
  }

  handleClickRestoreArchive = async () => {
    const { props, state } = this
    props.appContentRestoreArchive(state.content, this.setState.bind(this), state.config.slug)
  }

  handleClickRestoreDelete = async () => {
    const { props, state } = this
    props.appContentRestoreDelete(state.content, this.setState.bind(this), state.config.slug)
  }

  handleClickShowRevision = revision => {
    const { mode, timeline } = this.state

    const revisionArray = timeline.filter(t => t.timelineType === 'revision')
    const isLastRevision = revision.revision_id === revisionArray[revisionArray.length - 1].revision_id

    if (mode === APP_FEATURE_MODE.REVISION && isLastRevision) {
      this.handleClickLastVersion()
      return
    }

    if (mode === APP_FEATURE_MODE.VIEW && isLastRevision) return

    this.setState(prev => ({
      content: {
        ...prev.content,
        label: revision.label,
        raw_content: revision.raw_content,
        number: revision.number,
        status: revision.status,
        is_archived: prev.is_archived, // archived and delete should always be taken from last version
        is_deleted: prev.is_deleted
      },
      mode: APP_FEATURE_MODE.REVISION
    }))
  }

  handleClickLastVersion = () => {
    this.loadContent()
    this.setState({ mode: APP_FEATURE_MODE.VIEW })
  }

  render () {
    const { isVisible, loggedUser, content, timeline, newComment, timelineWysiwyg, config, mode, rawContentBeforeEdit } = this.state
    const { t } = this.props

    if (!isVisible) return null

    return (
      <PopinFixed
        customClass={`${config.slug}`}
        customColor={config.hexcolor}
      >
        <PopinFixedHeader
          customClass={`${config.slug}`}
          customColor={config.hexcolor}
          faIcon={config.faIcon}
          rawTitle={content.label}
          componentTitle={<div>{content.label}</div>}
          userRoleIdInWorkspace={loggedUser.userRoleIdInWorkspace}
          onClickCloseBtn={this.handleClickBtnCloseApp}
          onValidateChangeTitle={this.handleSaveEditTitle}
          disableChangeTitle={!content.is_editable}
        />

        <PopinFixedOption
          customColor={config.hexcolor}
          customClass={`${config.slug}`}
          i18n={i18n}
        >
          <div /* this div in display flex, justify-content space-between */>
            <div className='d-flex'>
              {loggedUser.userRoleIdInWorkspace <= ROLE.contributor.id &&
                <NewVersionBtn
                  customColor={config.hexcolor}
                  onClickNewVersionBtn={this.handleClickNewVersion}
                  disabled={mode !== APP_FEATURE_MODE.VIEW || !content.is_editable}
                  label={t('Edit')}
                />
              }

              {mode === APP_FEATURE_MODE.REVISION &&
                <button
                  className='wsContentGeneric__option__menu__lastversion html-document__lastversionbtn btn highlightBtn'
                  onClick={this.handleClickLastVersion}
                  style={{ backgroundColor: config.hexcolor, color: '#fdfdfd' }}
                >
                  <i className='fa fa-history' />
                  {t('Last version')}
                </button>
              }
            </div>

            <div className='d-flex'>
              {loggedUser.userRoleIdInWorkspace <= ROLE.contributor.id &&
                <SelectStatus
                  selectedStatus={config.availableStatuses.find(s => s.slug === content.status)}
                  availableStatus={config.availableStatuses}
                  onChangeStatus={this.handleChangeStatus}
                  disabled={mode === APP_FEATURE_MODE.REVISION || content.is_archived || content.is_deleted}
                />
              }

              {loggedUser.userRoleIdInWorkspace <= ROLE.contentManager.id &&
                <ArchiveDeleteContent
                  customColor={config.hexcolor}
                  onClickArchiveBtn={this.handleClickArchive}
                  onClickDeleteBtn={this.handleClickDelete}
                  disabled={mode === APP_FEATURE_MODE.REVISION || content.is_archived || content.is_deleted}
                />
              }
            </div>
          </div>
        </PopinFixedOption>

        <PopinFixedContent
          customClass={`${config.slug}__contentpage`}
        >
          {/* FIXME - GB - 2019-06-05 - we need to have a better way to check the state.config than using config.availableStatuses[3].slug
            https://github.com/tracim/tracim/issues/1840 */}
          <HtmlDocumentComponent
            mode={mode}
            customColor={config.hexcolor}
            wysiwygNewVersion={'wysiwygNewVersion'}
            onClickCloseEditMode={this.handleCloseNewVersion}
            disableValidateBtn={rawContentBeforeEdit === content.raw_content}
            onClickValidateBtn={this.handleSaveHtmlDocument}
            version={content.number}
            lastVersion={timeline.filter(t => t.timelineType === 'revision').length}
            text={content.raw_content}
            onChangeText={this.handleChangeText}
            isArchived={content.is_archived}
            isDeleted={content.is_deleted}
            isDeprecated={content.status === config.availableStatuses[3].slug}
            deprecatedStatus={config.availableStatuses[3]}
            isDraftAvailable={mode === APP_FEATURE_MODE.VIEW && loggedUser.userRoleIdInWorkspace <= ROLE.contributor.id && this.getLocalStorageItem('rawContent')}
            onClickRestoreArchived={this.handleClickRestoreArchive}
            onClickRestoreDeleted={this.handleClickRestoreDelete}
            onClickShowDraft={this.handleClickNewVersion}
            key={'html-document'}
          />

          <PopinFixedRightPart
            customClass={`${config.slug}__contentpage`}
            customColor={config.hexcolor}
            menuItemList={[
              {
                id: 'timeline',
                label: t('Timeline'),
                icon: 'fa-history',
                children: <Timeline
                  customClass={`${config.slug}__contentpage`}
                  customColor={config.hexcolor}
                  loggedUser={loggedUser}
                  timelineData={timeline}
                  newComment={newComment}
                  disableComment={mode === APP_FEATURE_MODE.REVISION || mode === APP_FEATURE_MODE.EDIT || !content.is_editable}
                  availableStatusList={config.availableStatuses}
                  wysiwyg={timelineWysiwyg}
                  onChangeNewComment={this.handleChangeNewComment}
                  onClickValidateNewCommentBtn={this.handleClickValidateNewCommentBtn}
                  onClickWysiwygBtn={this.handleToggleWysiwyg}
                  onClickRevisionBtn={this.handleClickShowRevision}
                  shouldScrollToBottom={mode !== APP_FEATURE_MODE.REVISION}
                />
              }
            ]}
          />
        </PopinFixedContent>
      </PopinFixed>
    )
  }
}

export default translate()(
  Radium(
    appContentFactory(
      HtmlDocument
    )
  )
)
