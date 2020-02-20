import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import { css } from 'emotion'
import { Button, Paragraph, Typography, SkeletonImage, SkeletonContainer, SkeletonDisplayText, SkeletonBodyText } from '@contentful/forma-36-react-components'
import tokens from '@contentful/forma-36-tokens'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import { init, locations } from 'contentful-ui-extensions-sdk'
import '@contentful/forma-36-react-components/dist/styles.css'
import './index.css'

const styles = {
  dialog: css({
    margin: tokens.spacingL
  })
}

export class Asset extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    assetId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      asset: null
    }
  }

  async componentDidMount() {
    const asset = await this.props.sdk.space.getAsset(this.props.assetId)
    this.setState({asset})
  }

  render() {
    if (this.state.asset) {
      return <img src={this.state.asset.fields.file['en-US'].url + '?w=750'} />
    }

    return <SkeletonContainer><SkeletonImage width={750} height={100} /></SkeletonContainer>
  }
}

export class DialogExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      entry: undefined,
      loading: true
    }
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer()

    let entry
    try {
      entry = (await this.props.sdk.space.getEntries({
        'fields.contentTypeId': this.props.sdk.parameters.invocation.contentTypeId,
        content_type: 'internalContextualHelp'
      })).items[0]
    } catch(err) {
      console.log('could not fetch help text')
    }

    this.setState({entry, loading: false})
  }

  render() {
    if (this.state.loading) return (
      <SkeletonContainer className={styles.dialog}>
        <SkeletonDisplayText numberOfLines={1} offsetTop={10} />
        <SkeletonBodyText numberOfLines={3} offsetTop={45} />
      </SkeletonContainer>
    )

    try {
      return (
        <Typography className={styles.dialog}>{
          documentToReactComponents(
            this.state.entry.fields.helpText['en-US'],
            {
              renderNode: {
                [BLOCKS.PARAGRAPH]: (node, children) => <Paragraph>{children}</Paragraph>,
                [BLOCKS.EMBEDDED_ASSET]: node => {
                  try {
                    const id = node.data.target.sys.id
                    return <Asset assetId={id} sdk={this.props.sdk} />
                  } catch(err) { console.log(err) }
                }
              }
            }
          )
        }</Typography>
      )
    } catch(err) {
      return <Paragraph className={styles.dialog}><i>No help was found for this content type...</i></Paragraph>
    }
  }
}

export class SidebarExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      contentType: props.sdk.contentType
    }

    this.onButtonClick = this.onButtonClick.bind(this)
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer()
  }

  async onButtonClick() {
    const result = await this.props.sdk.dialogs.openExtension({
      width: 800,
      title: this.state.contentType.name + ' - Help',
      parameters: { contentTypeId: this.props.sdk.ids.contentType }
    })
    console.log(result)
  }

  render() {
    return (
      <>
        <Paragraph>{this.state.contentType.description}</Paragraph>
        <Button
          buttonType="positive"
          isFullWidth={true}
          testId="open-dialog"
          onClick={this.onButtonClick}>
          Display more help
        </Button>
      </>
    )
  }
}

export class FieldExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.emptyValue = {label: "Not selected", value: undefined}

    this.state = {
      contentTypes: [],
      contentTypeOptions: [],
      selectedContentType: props.sdk.field.getValue() || this.emptyValue
    }

    this.sdk = props.sdk
    this.onSelect = this.onSelect.bind(this)
    this.onMenuOpen = this.onMenuOpen.bind(this)
    this.onMenuClose = this.onMenuClose.bind(this)
  }

  async componentDidMount() {
    this.sdk.window.updateHeight(50)

    const contentTypes = (await this.sdk.space.getContentTypes()).items

    const contentTypeOptions = (contentTypes || []).map((ct) => {
      return {value: ct.sys.id, label: ct.name}
    })
    contentTypeOptions.unshift(this.emptyValue)

    this.setState({contentTypes, contentTypeOptions})
  }

  async onSelect(selectedContentType) {
    this.setState({selectedContentType: selectedContentType.value})
    await this.sdk.field.setValue(selectedContentType.value)
  }

  onMenuOpen() {
    this.sdk.window.updateHeight(300)
  }

  onMenuClose() {
    this.sdk.window.updateHeight(50)
  }

  selectedContentTypeOption() {
    return (
      this.state.contentTypeOptions.find(ct => ct.value === this.state.selectedContentType) ||
      this.emptyValue
    )
  }

  render() {
    return (
      <Select
        options={this.state.contentTypeOptions}
        value={this.selectedContentTypeOption()}
        onChange={this.onSelect}
        onMenuOpen={this.onMenuOpen}
        onMenuClose={this.onMenuClose}
      />
    )
  }
}

export const initialize = sdk => {
  let Component
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    Component = DialogExtension
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    Component = FieldExtension
  } else {
    Component = SidebarExtension
  }

  ReactDOM.render(<Component sdk={sdk} />, document.getElementById('root'))
}

init(initialize)

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept()
// }
