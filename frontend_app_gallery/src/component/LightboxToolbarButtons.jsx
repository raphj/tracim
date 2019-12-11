import React from 'react'
import classnames from 'classnames'
import { translate } from 'react-i18next'
import { DIRECTION } from '../helper'
import PropTypes from 'prop-types'

const LightboxToolbarButtons = (props) => {
  return (
    <div className={'gallery__action__button__lightbox'}>
      <button
        className={'btn iconBtn'}
        onClick={() => props.onClickSlickPlay(!props.autoPlay)}
        title={props.autoPlay ? props.t('Pause') : props.t('Play')}
      >
        <i className={classnames('fa', 'fa-fw', props.autoPlay ? 'fa-pause' : 'fa-play')} />
      </button>

      <button
        className={'btn iconBtn'}
        onClick={() => props.enableFullscreen()}
        title={props.fullscreen ? props.t('Disable fullscreen') : props.t('Enable fullscreen')}
      >
        <i className={classnames('fa', 'fa-fw', props.fullscreen ? 'fa-compress' : 'fa-expand')} />
      </button>

      <button
        className='btn iconBtn gallery__action__button__lightbox__rotation__left'
        onClick={() => props.rotateImg(props.fileSelected, DIRECTION.LEFT)}
        title={props.t('Rotate 90° left')}
      >
        <i className={'fa fa-fw fa-undo'} />
      </button>

      <button
        className='btn iconBtn gallery__action__button__lightbox__rotation__right'
        onClick={() => props.rotateImg(props.fileSelected, DIRECTION.RIGHT)}
        title={props.t('Rotate 90° right')}
      >
        <i className={'fa fa-fw fa-undo'} />
      </button>

      <a
        className='btn iconBtn gallery__action__button__lightbox__openRawContent'
        title={props.t('Open raw file')}
        href={props.rawFileUrlSelectedFile}
        target='_blank'
      >
        <i className={'fa fa-fw fa-download'} />
      </a>
    </div>
  )
}

export default translate()(LightboxToolbarButtons)

LightboxToolbarButtons.propTypes = {
  autoPlay: PropTypes.number,
  fileSelected: PropTypes.number,
  fullscreen: PropTypes.bool,
  onClickSlickPlay: PropTypes.func,
  enableFullscreen: PropTypes.func,
  rotateImg: PropTypes.func,
  rawFileUrlSelectedFile: PropTypes.string
}

LightboxToolbarButtons.defaultProps = {
  autoPlay: false,
  fileSelected: 0,
  fullscreen: false,
  rawFileUrlSelectedFile: '',
  onClickSlickPlay: () => {},
  enableFullscreen: () => {},
  rotateImg: () => {}
}
