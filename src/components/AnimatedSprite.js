"use strict";

import React from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
} from 'react-native';
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
      scale: new Animated.Value(props.scale),
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

  componentWillReceiveProps (nextProps) {
    if (this.props.animationFrameIndex !== nextProps.animationFrameIndex) {
      this.startAnimation();
    }
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
      onPanResponderGrant:(e, gestureState) => {
        this.handlePanResponderGrant(e, gestureState);},
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

  handlePanResponderGrant (/*e, gestureState*/) {
    // do something on grant
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

  startAnimation () {
    this.fps = this.props.fps || this.fps;
    this.frameIndex = -1;
    clearInterval(this.defaultAnimationInterval);
    this.defaultAnimationInterval = setInterval(()=>{
      this.frameIndex++;
      if (this.frameIndex > (this.props.animationFrameIndex.length - 1)) {
        this.frameIndex = this.frameIndex - 1;
        if (this.props.loopAnimation) {
            this.frameIndex = 0;
        } else {
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
    this.props.onTweenStopped(stopValues);
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

  handlePressOut (e) {
    e.preventDefault();
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
  sprite: React.PropTypes.object.isRequired,
  coordinates: React.PropTypes.shape({
    top: React.PropTypes.number,
    left: React.PropTypes.number,
  }).isRequired,
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }).isRequired,
  animationFrameIndex: React.PropTypes.array.isRequired,

  rotate: React.PropTypes.arrayOf(React.PropTypes.object),
  scale: React.PropTypes.number,
  opacity: React.PropTypes.number,
  spriteUID: React.PropTypes.string,
  draggable: React.PropTypes.bool,
  onPress: React.PropTypes.func,
  onPressIn: React.PropTypes.func,
  onPressOut: React.PropTypes.func,
  loopAnimation: React.PropTypes.bool,
  timeSinceMounted: React.PropTypes.func,
  currentLocation: React.PropTypes.func,
  tweenStart: React.PropTypes.oneOf(['fromMount','fromMethod', 'fromPress']),
  // probably should validate tweenOptions, since Tweens.js uses them
  // and expects a certian shape.
  tweenOptions: React.PropTypes.object,
  stopAutoTweenOnPressIn: React.PropTypes.bool,
  onTweenStopped: React.PropTypes.func,
  onTweenFinish: React.PropTypes.func,
  onAnimationFinish: React.PropTypes.func,
  visible: React.PropTypes.bool,
  fps: React.PropTypes.number,
};

AnimatedSprite.defaultProps = {
  draggable: false,
  spriteUID: randomstring({ length: 7 }),
  rotate: [{rotateY: '0deg'}],
  scale: 1,
  opacity: 1,
  fps: 10,
  visible: true,
};

export default AnimatedSprite;
