# The React Native Animated Sprite

react-native-animated-sprite (RNAS) package is a feature rich declarative component for animation, tweening, and dragging sprites. Animation is achieved using frame-by-frame animation, tweening uses the React Native Animated class, and dragging uses React Native PanResponder.

RNAS is ideal for use in general applications or games. Development has been driven by [Curious Learning's](http://www.curiouslearning.org/) work in cognitive assessment and literacy.

## Installation
```
$ npm install --save react-native-animated-sprite
```

## Overview
There are three key features to RNAS: AnimatedSprite, sprites, and tweens.
Together these three features provide the full capabilities of RNAS.

### AnimatedSprite
AnimatedSprite is the primary component interface which would be included in a
React Native application.

### Sprites
Sprites are objects that are required by AnimatedSprite. A sprite object contains
references to the images used for frame-by-frame animation and other related
information. See "example/sprites/monster/monsterSprite.js"

### Tweens
Tweens ("src/Tweens/Tweens.js") operate on AnimatedSprites to enable tweening.

### Example Use
![](./example/AnimateSpriteExample.gif =265x400)

### Example Declaration
```
<AnimatedSprite
  sprite={monsterSprite}
  animationFrameIndex={monsterSprite.animationIndex('WALK')}
  loopAnimation={true}
  coordinates={{
    top: 100,
    left: 100,
  }}
  size={monsterSprite.size}
  draggable={true}
/>
```
The above example would create an "AnimatedSprite" with the "monsterSprite." The animation loops and the animation is of the monster "walking". The coordinates place the start location of the AnimatedSprite, while size declares the size. Draggable set to true (draggable={true}) means that the AnimatedSprite can be dragged.

## Component Properties

| Name | Required | Type |  Description | Default Value |
|------|----------|------|-------------|---------------|
| sprite | true | object | sprite is the | none |
| coordinates | true | object | sprite is the | none |
| size | true | object | sprite is the | none |
| animationFrameIndex | true | array | sprite is the | none |
| rotate | false | array | array of objects | [{rotateY: '0deg'}] |
| scale | false | number | sprite is the | 1 |
| opacity | false | number | sprite is the | 1 |
| spriteUID | false | string | sprite is the | randome string of length 7 |
| draggable | false | bool | sprite is the | false |
| onPress | false | func | sprite is the | none |
| onPressIn | false | func | sprite is the | none |
| onPressOut | false | func | sprite is the | none |
| loopAnimation | false | bool | sprite is the | none |
| timeSinceMounted | false | func | sprite is the | none |
| currentLocation | false | func | sprite is the | none |
| timeSinceMounted | false | func | sprite is the | none |
| tweenStart | false | string | sprite is the | none |
| tweenOptions | false | object | sprite is the | none |
| stopAutoTweenOnPressIn | false | bool | sprite is the | none |
| onTweenStopped | false | func | sprite is the | none |
| onTweenFinish | false | func | sprite is the | none |
| onAnimationFinish | false | func | sprite is the | none |
| visible | false | bool | sprite is the | true |
| fps | false | number | sprite is the | 10 |


## Example Projects
**coming soon**

Add yours :D

## Notes on Usage
Mobile operating systems such as Android and iOS have significantly less application memory then other systems. As a result performance can be effected by the size and number of images used by an application using AnimatedSprite.
