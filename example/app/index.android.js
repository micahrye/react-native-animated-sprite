/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import sample from 'lodash.sample';

import AnimatedSprite from 'react-native-animated-sprite';
import monsterSprite from './sprites/monster/monsterSprite';

export default class AnimatedSpriteExample extends Component {
  constructor () {
    super();
    this.state = {
      animationType: 'WALK',
      tweenOptions: {},
    };
  }

  onPress () {
    const animation = sample(monsterSprite.animationTypes);
    debugger;
    this.setState({ animationType: animation });
  }

  tweenSprite () {
    const coords = this.refs.monsterRef.getCoordinates();
    const location = [0, 100, 200, 300, 400, 500];
    this.setState({
      tweenOptions: {
        tweenType: 'sine-wave',
        startXY: [coords.left, coords.top],
        xTo: [sample(location), sample(location)],
        yTo: [sample(location), sample(location)],
        duration: 1000,
        loop: false,
      }
    }, () => {
      this.refs.monsterRef.startTween();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <AnimatedSprite
          ref={'monsterRef'}
          sprite={monsterSprite}
          animationFrameIndex={monsterSprite.animationIndex(this.state.animationType)}
          loopAnimation={false}
          coordinates={{
            top: 100,
            left: 100,
          }}
          size={{
            width: monsterSprite.size.width * 1.65,
            height: monsterSprite.size.height * 1.65,
          }}
          draggable={true}
          tweenOptions = {this.state.tweenOptions}
          tweenStart={'fromMethod'}
          onPress={() => {this.onPress();}}
        />
        <Button
          onPress={() => {this.tweenSprite()}}
          title="Tween me!"
          color="#841584"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AnimatedSpriteExample', () => AnimatedSpriteExample);
