import React from 'react'
import classnames from 'classnames'
import { translate } from 'react-i18next'
import { DIRECTION } from '../helper'
import PropTypes from 'prop-types'

const GalleryToolbarButtons = (props) => {
  return (
    <div className='gallery__action__button'>
      <button
        className='btn outlineTextBtn nohover primaryColorBorder'
        onClick={() => props.onClickSlickPlay(!props.autoPlay)}
      >
        <span className='gallery__action__button__text'>
          {props.autoPlay ? props.t('Pause') : props.t('Play')}
        </span>
        <i className={classnames('fa', 'fa-fw', props.autoPlay ? 'fa-pause' : 'fa-play')} />
      </button>

      <button
        className='btn outlineTextBtn nohover primaryColorBorder gallery__action__button__rotation__left'
        onClick={() => props.rotateImg(props.fileSelected, DIRECTION.LEFT)}
      >
        <span className='gallery__action__button__text'>{props.t('Rotate 90° left')}</span>
        <i className={'fa fa-fw fa-undo'} />
      </button>

      <button
        className='btn outlineTextBtn nohover primaryColorBorder gallery__action__button__rotation__right'
        onClick={() => props.rotateImg(props.fileSelected, DIRECTION.RIGHT)}
      >
        <span className='gallery__action__button__text'>{props.t('Rotate 90° right')}</span>
        <i className={'fa fa-fw fa-undo'} />
      </button>

      {/*
        INFO - CH - there is a bug with the property userRoleIdInWorkspace that comes from frontend, it might be it's default value which is 1
        So we won't use it for now and always display the delete button which will return 401 if user can't delete content
      */}
      <button className='btn outlineTextBtn nohover primaryColorBorder' onClick={props.handleOpenDeleteFilePopup}>
        <span className='gallery__action__button__text'>{props.t('Delete')}</span><i className={'fa fa-fw fa-trash'} />
      </button>
    </div>
  )
}

export default translate()(GalleryToolbarButtons)

GalleryToolbarButtons.propTypes = {
  autoPlay: PropTypes.number,
  fileSelected: PropTypes.number,
  onClickSlickPlay: PropTypes.func,
  rotateImg: PropTypes.func,
  handleOpenDeleteFilePopup: PropTypes.func
}

GalleryToolbarButtons.defaultProps = {
  autoPlay: false,
  fileSelected: 0,
  onClickSlickPlay: () => {},
  rotateImg: () => {},
  handleOpenDeleteFilePopup: () => {},
}
