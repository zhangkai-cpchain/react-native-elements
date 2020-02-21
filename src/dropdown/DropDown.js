import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Modal, Platform, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, ViewPropTypes } from 'react-native'
import { getStatusBarHeight } from '../config'

export default class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      top: null,
      left: null,
      width: null,
      height: null,
    }
  }

  show = () => {
    const { onShow, theme } = this.props
    this.measure(true)
    onShow()
    Platform.OS === 'android' && StatusBar.setBackgroundColor(theme.colors.get('background.dark'))
  }

  hide = () => {
    this.setState({ visible: false })
    this.measure(false)
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent')
  }

  toggle = () => (this.state.visible ? this.hide() : this.show())

  getSelectorPosition = () => {
    const { top, left, width } = this.state
    return {
      width,
      top,
      left,
    }
  }

  measure = (visible = false) => {
    this.selector.measure((fx, fy, width, height, px, py) => {
      this.setState({
        top: py - (Platform.OS === 'android' ? getStatusBarHeight() : 0),
        left: px,
        width,
        height,
        visible,
      })
    })
  }

  onChange = (index, option) => {
    const { onChange } = this.props
    // The omit lodash returns an object so the index is a string...
    onChange(parseInt(index, 10), option)
    this.hide()
  }

  renderSelector = withRef => {
    const {
      style,
      options,
      selectedIndex,
      renderItem,
      renderSelectedItem = renderItem,
    } = this.props

    return (
      <View style={style} collapsable={false} ref={ref => (this.selector = ref)}>
        <TouchableOpacity onPress={this.toggle}>
          {renderSelectedItem(options[selectedIndex])}
        </TouchableOpacity>
      </View>
    )
  }

  renderOptions = () => {
    const { options, optionsContainerStyle, keyExtractor, renderItem, theme } = this.props
    const { height, width } = this.state
    return (
      <View
        animation="fadeIn"
        duration={300}
        style={[
          styles.optionsContainer,
          { paddingTop: height, width, backgroundColor: theme.colors.get('background.default') },
          optionsContainerStyle,
        ]}>
        {options.map((option, index) => (
          <View key={keyExtractor(option, index)}>
            <TouchableOpacity onPress={() => this.onChange(index, option)}>
              {renderItem(option, index)}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )
  }

  renderModal = () => {
    const { visible } = this.state
    const { theme } = this.props
    if (!visible) {
      return null
    }
    return (
      <Modal onRequestClose={this.hide} animationType="fade" visible={visible} transparent>
        <TouchableWithoutFeedback onPress={this.hide}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.colors.get('background.dark'),
            }}>
            <View style={[styles.selector, this.getSelectorPosition()]}>
              {this.renderOptions()}
              {this.renderSelector()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  render() {
    return (
      <View>
        {this.renderSelector(true)}
        {this.renderModal()}
      </View>
    )
  }
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
  selectedIndex: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  renderSelectedItem: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  keyExtractor: PropTypes.func,
  onShow: PropTypes.func,
  style: ViewPropTypes.style,
  optionsContainerStyle: ViewPropTypes.style,
}

Dropdown.defaultProps = {
  selectedIndex: 0,
  style: null,
  onChange: () => null,
  onShow: () => null,
  keyExtractor: (item, index) => index.toString(),
}

const styles = StyleSheet.create({
  optionsContainer: {
    position: 'absolute',
    top: 0,
  },
  selector: {
    position: 'absolute',
  },
})
