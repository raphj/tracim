import React from 'react'
import { translate } from 'react-i18next'
import Radium from 'radium'
import { Popover, PopoverBody } from 'reactstrap'
import { isMobile } from 'react-device-detect'
import { generateRandomPassword } from '../../helper.js'
import ComposedIcon from '../Icon/ComposedIcon.jsx'

const color = require('color')

export class NewShareDownload extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isPasswordActive: false,
      popoverMultipleEmailsOpen: false,
      hidePassword: true
    }
  }

  handleTogglePopoverMultipleEmails = () => {
    this.setState(prevState => ({
      popoverMultipleEmailsOpen: !prevState.popoverMultipleEmailsOpen
    }))
  }

  handleTogglePasswordVisibility = () => {
    this.setState(prevState => ({
      hidePassword: !prevState.hidePassword
    }))
  }

  handleRandomPassword = () => {
    this.props.onChangePassword({target: {value: generateRandomPassword()}})
    if (this.state.hidePassword) {
      this.handleTogglePasswordVisibility()
    }
  }

  handleTogglePasswordActive = () => {
    this.setState(prevState => ({
      isPasswordActive: !prevState.isPasswordActive
    }))
  }

  render () {
    const { props, state } = this

    return (
      <div className='shareDownload__new'>
        <div className='shareDownload__title'>
          {props.t('New share')}
        </div>

        <div className='shareDownload__email'>
          <textarea
            className='shareDownload__email__input form-control'
            placeholder={props.t("Recipient's email addresses")}
            rows='1'
            value={props.shareEmails}
            onChange={props.onChangeEmails}
            onKeyDown={props.onKeyDownEnter}
          />

          <button
            type='button'
            className='shareDownload__email__icon'
            id='popoverMultipleEmails'
            key='share_emails'
            style={{ ':hover': { color: props.hexcolor } }}
          >
            <i className='fa fa-fw fa-question-circle' />
          </button>

          <Popover
            placement='bottom'
            isOpen={state.popoverMultipleEmailsOpen}
            target='popoverMultipleEmails'
            toggle={this.handleTogglePopoverMultipleEmails}
            trigger={isMobile ? 'focus' : 'hover'}
          >
            <PopoverBody>{props.t('To add multiple recipients, separate the email addresses with a comma, a semicolon or a line break.')}</PopoverBody>
          </Popover>
        </div>

        {state.isPasswordActive
        ? (
          <div className='shareDownload__password'>
            <div className='shareDownload__password__active'>
              <div className='shareDownload__password__wrapper'>
                <i className='fa fa-fw fa-lock' />

                <input
                  type={state.hidePassword ? 'password' : 'text'}
                  className='shareDownload__password__input form-control'
                  placeholder={props.t('Password')}
                  value={props.sharePassword}
                  onChange={props.onChangePassword}
                  onFocus={props.onKeyDownEnter}
                />

                <button
                  type='button'
                  className='shareDownload__password__icon'
                  key='seeSharePassword'
                  title={props.t('Show password')}
                  style={{ ':hover': { color: props.hexcolor } }}
                  data-cy='seePassword'
                  onClick={this.handleTogglePasswordVisibility}
                >
                  <i className={state.hidePassword ? 'fa fa-fw fa-eye' : 'fa fa-fw fa-eye-slash'} />
                </button>
              </div>

              <button
                type='button'
                className='shareDownload__password__icon'
                key='randomSharePassword'
                title={props.t('Generate random password')}
                style={{ ':hover': { color: props.hexcolor } }}
                onClick={this.handleRandomPassword}
              >
                <i className='fa fa-fw fa-repeat' />
              </button>
            </div>
            <span className='shareDownload__password__link' onClick={this.handleTogglePasswordActive}>
              {props.t('Cancel protection by password')}
            </span>
          </div>
        )
        : (
          <div className='shareDownload__password'>
            <span className='shareDownload__password__link' onClick={this.handleTogglePasswordActive}>
              {props.t('Protect by password')}
            </span>
          </div>
        )}

        <div className='d-flex mt-3'>
          <button
            className='shareDownload__cancel btn outlineTextBtn'
            key='cancelNewShare'
            onClick={props.onClickCancelButton}
            style={{
              borderColor: props.hexcolor,
              ':hover': {
                backgroundColor: props.hexcolor
              }
            }}
          >
            {props.t('Cancel')}
          </button>

          <button
            className='shareDownload__newBtn btn highlightBtn'
            key='newShareDownload'
            onClick={() => props.onClickNewShare(state.isPasswordActive)}
            disabled={props.shareEmails === '' || (state.isPasswordActive && props.sharePassword === '')}
            style={{
              backgroundColor: props.hexcolor,
              ':hover': {
                backgroundColor: color(props.hexcolor).darken(0.15).hex()
              }
            }}
          >
            {props.t('Validate')}
          </button>
        </div>

        {!props.emailNotifActivated && (
          <div className='shareDownload__emailWarning'>
            <ComposedIcon
              mainIcon='envelope'
              smallIcon='warning'
              smallIconCustomClass='text-danger'
            />
            {props.t('Email notification are disabled, please manually share the link')}
          </div>
        )}
      </div>
    )
  }
}

export default translate()(Radium(NewShareDownload))
