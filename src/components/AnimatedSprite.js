"use strict";

import React from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
} from 'react-native';

import PropTypes from 'prop-types';

import shallowCompare from 'react-addons-shallow-compare';
import _ from 'lodash';
import randomstring from 'random-string';

import Tweens from "../Tweens/Tweens";

class AnimatedSprite extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      top: new Animated.Value(props.coordinates.top),
      left: new Animated.Value(props.coordinates.left),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(props.opacity),
      width: props.size.width,
      height: props.size.height,
      rotate: props.rotate,
      frameIndex: this.props.animationFrameIndex,
    };

    this.sprite = this.props.sprite;
    this.frameIndex = 0;
    this.defaultAnimationInterval = undefined;
    this.fps = 8;
    this.endValues = undefined;
    // used for panResponder
    this.spriteStyles = {};
    this.panResponder = {};
  }

  componentWillMount () {
    if (this.props.draggable) {
      this.initPanResponder();
    }

    this.tweenablValues = {
      top: this.state.top,
      left: this.state.left,
      scale: this.state.scale,
      opacity: this.state.opacity,
    };
  }

  componentDidMount () {
    this.startAnimation();
    // part of PanResponder and drag behavior
    if (this.spriteComponentRef) {
      this.spriteComponentRef.setNativeProps(this.spriteStyles);
    }
    if (this.props.tweenStart === 'fromMount' && this.props.tweenOptions !== null) {
      this.startTween();
    }
    this.fps = this.props.fps || this.fps;
  }

  shouldComponentUpdate (nextProps, nextState) {
     return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount () {
    clearInterval(this.defaultAnimationInterval);
  }

  initPanResponder () {
    // note that with PanResponder we setNativeProps for performance reasons,
    // as stated by FB.
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        this.handlePanResponderMove(e, gestureState);},
      onPanResponderRelease: (e, gestureState) => {
        this.handlePanResponderEnd(e, gestureState);},
      onPanResponderTerminate:
        (e, gestureState) => {
        this.handlePanResponderEnd(e, gestureState);},
    });
    // spriteStyles used by PanResponder
    this.previousTop = this.state.top._value;
    this.previousLeft =  this.state.left._value;
    this.spriteStyles = {
      style: {
        left: this._previousLeft,
        top: this._previousTop,
        width: this.state._width,
        height: this.state._height,
      },
    };
  }

  updateNativeStyles () {
    this.spriteComponentRef && this.spriteComponentRef.setNativeProps(this.spriteStyles);
  }

  handleStartShouldSetPanResponder (/*e, gestureState*/) {
    return true;
  }

  handleMoveShouldSetPanResponder (/*e, gestureState*/) {
    return true;
  }

  handlePanResponderMove (e, gestureState) {
    this.spriteStyles.style.left = this.previousLeft + gestureState.dx;
    this.spriteStyles.style.top = this.previousTop + gestureState.dy;
    this.updateNativeStyles();
  }

  handlePanResponderEnd (e, gestureState) {
    // do anything you want onPanResponderRelease
    this.previousLeft += gestureState.dx;
    this.previousTop += gestureState.dy;
    // PanResponder mutates state directly
    this.state.top._value = this.spriteStyles.style.top;
    this.state.left._value = this.spriteStyles.style.left;
    if (this.props.currentLocation) {
      this.props.currentLocation(this.spriteStyles.style.left, this.spriteStyles.style.top);
    }
  }
  
  animationSequenceComplete(frameIndex) {
    return (frameIndex > (this.props.animationFrameIndex.length - 1));
  }
  
  startAnimation () {
    this.fps = this.props.fps || this.fps;
    this.frameIndex = -1;
    clearInterval(this.defaultAnimationInterval);
    this.defaultAnimationInterval = setInterval(()=>{
      this.frameIndex++;
      if (this.animationSequenceComplete(this.frameIndex)) {
        this.frameIndex = this.frameIndex - 1;
        if (this.props.loopAnimation) {
            this.frameIndex = 0;
        } else {
          // not looping animation
          clearInterval(this.defaultAnimationInterval);
          if (this.props.onAnimationFinish) {
             this.props.onAnimationFinish(this.props.spriteUID);
          }
          return;
        }
      }
      this.setState({
        frameIndex: this.props.animationFrameIndex[this.frameIndex]
      });
    }, 1000 / this.fps);
  }

  // notify parent that tween has ended
  tweenCompleted (spriteUID) {
    if (this.props.onTweenFinish) {
      this.props.onTweenFinish(spriteUID);
    }
  }

  // meant to be used from instance of AnimatedSprite. User would invoke
  // this.refs.<refname>.tweenSprite. This allows for programatic contorl
  // of starting tween
  tweenSprite () {
    if (this.props.tweenStart !== 'fromMethod') return 0;
    this.startTween();
  }

  startTween () {
    const tweenOptions = this.props.tweenOptions;
    const tweenType = this.props.tweenOptions.tweenType;
    Tweens[tweenType].start(tweenOptions,
      this.tweenablValues,
      () => this.tweenCompleted(this.props.spriteUID),
    );
  }

  getCoordinates () {
    return { top: this.state.top._value, left: this.state.left._value};
  }

  handlePress (e) {
    e.preventDefault();
    if (this.props.onPress) {
      this.props.onPress(this.props.spriteUID);
    }
    if (this.props.tweenStart === 'fromPress') {
      this.startTween();
    }
  }

  stoppedTween (stopValues) {
    if (this.props.onTweenStopped) {
      this.props.onTweenStopped(stopValues);
    }
  }
  
  stopTween () {
    // 
    const tweenType = this.props.tweenOptions.tweenType;
    Tweens[tweenType].stop(this.tweenablValues,
      (stopValues) => this.stoppedTween(stopValues));
  }

  handlePressIn () {
    if (this.props.onPressIn) {
      this.props.onPressIn();
    }

    if (this.props.stopAutoTweenOnPressIn) {
      const tweenType = this.props.tweenOptions.tweenType;
      Tweens[tweenType].stop(this.tweenablValues,
        (stopValues) => this.stoppedTween(stopValues));
    }
  }

  handlePressOut () {
    // e.preventDefault();
    if (this.props.onPressOut) {
      this.props.onPressOut();
    }
  }

  getStyle () {
    const opacity = !this.props.visible ? new Animated.Value(0) : this.state.opacity;
    const rotateAxes = _.map(this.state.rotate, axis => axis);
    const transform = _.concat([{scale: this.state.scale}], rotateAxes);
    return (
      // TODO: this.props.visible part of hack to what may be a
      // RN bug associated with premiture stopping of Tween and removing
      // The related component
      {
        opacity,
        transform,
        top: this.state.top,
        left: this.state.left,
        width: this.state.width,
        height: this.state.height,
        position: 'absolute',
      }

    );
  }

  render () {
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={this.getStyle()}
        ref={(sprite) => {
          this.spriteComponentRef = sprite;
        }}>
        <TouchableOpacity
          activeOpacity={1.0}
          onPress={(evt) => this.handlePress(evt)}
          onPressIn={(evt) => this.handlePressIn(evt)}
          onPressOut={(evt) => this.handlePressOut(evt)}>
          <Image
            source={this.sprite.frames[this.state.frameIndex]}
            style={{
              width: this.state.width,
              height: this.state.height,
            }}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

AnimatedSprite.propTypes = {
  sprite: PropTypes.object.isRequired,
  coordinates: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  animationFrameIndex: PropTypes.array.isRequired,

  rotate: PropTypes.arrayOf(PropTypes.object),
  opacity: PropTypes.number,
  spriteUID: PropTypes.string,
  draggable: PropTypes.bool,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  loopAnimation: PropTypes.bool,
  timeSinceMounted: PropTypes.func,
  currentLocation: PropTypes.func,
  tweenStart: PropTypes.oneOf(['fromMount','fromMethod', 'fromPress']),
  // probably should validate tweenOptions, since Tweens.js uses them
  // and expects a certian shape.
  tweenOptions: PropTypes.object,
  stopAutoTweenOnPressIn: PropTypes.bool,
  onTweenStopped: PropTypes.func,
  onTweenFinish: PropTypes.func,
  onAnimationFinish: PropTypes.func,
  visible: PropTypes.bool,
  fps: PropTypes.number,
};

AnimatedSprite.defaultProps = {
  draggable: false,
  spriteUID: randomstring({ length: 7 }),
  rotate: [{rotateY: '0deg'}],
  opacity: 1,
  fps: 10,
  visible: true,
};

export default AnimatedSprite;

