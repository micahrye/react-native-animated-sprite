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
<img src="https://raw.githubusercontent.com/micahrye/react-native-animated-sprite/master/example/AnimateSpriteExample.gif" width="265" height="400">

## Example Projects
**coming soon**

Add yours :D

## Example Declaration
This is the declaration used for the example application included in this projects
Github [repo](https://github.com/micahrye/react-native-animated-sprite/blob/master/example/app/index.android.js), and demonstrated in the GIF above.

```
<AnimatedSprite
  ref={'monsterRef'}
  sprite={monsterSprite}
  animationFrameIndex={monsterSprite.animationIndex(this.state.animationType)}
  loopAnimation={true}
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
```
The above example would create an "AnimatedSprite" with the "monsterSprite." The animation loops and is set to an animation type of the sprite. The coordinates place the start location of the AnimatedSprite, while size declares the size. Draggable set to true (draggable={true}) means that the AnimatedSprite can be dragged. The tween options are
set to a tween object, and the tween can be started 'fromCode', i.e. programmatically.
There is also an "onPress" handler declared that is used to switch animation type.
See [the code](https://github.com/micahrye/react-native-animated-sprite/blob/master/example/app/index.android.js) for full details.

## Component Properties (need to finish)

| Name | Required | Type |  Description | Default Value |
|------|----------|------|-------------|---------------|
| sprite | true | object | An object that describes the underlying sprite asset. | See [Sprite fields](#sprite-fields) below. |
| coordinates | true | object | The top/left coordinates of the AnimatedSprite. | none |
| size | true | object | The width/height size of the sprite assets. | none |
| animationFrameIndex | true | array | The indices of the current animation. | none |
| rotate | false | array | Rotation information for sprite. | [{rotateY: '0deg'}] |
| opacity | false | number | Opacity of sprite. | 1 |
| spriteUID | false | string | Unique string used for ID purposes. | randome string of length 7 |
| draggable | false | bool | Set draggable state of sprite. | false |
| onPress | false | func | Function handle for press (touch) event. | none |
| onPressIn | false | func | Function handle for pressIn event. | none |
| onPressOut | false | func | Function handle for pressOut event. | none |
| loopAnimation | false | bool | Indicates if animation should loop | none |
| timeSinceMounted | false | func | Indicates time since component was mounted | none |
| currentLocation | false | func | Function to retrieve current coordinates. | none |
| tweenStart | false | string | Indicates how tween should start, one of ['fromMethod', 'fromPress', 'fromMount'] | none |
| tweenOptions | false | object | Describes tween options. | See [Tweens](#tweens-overview) |
| stopAutoTweenOnPressIn | false | bool | Indicates if tween started at component mount should stop on press event. | none |
| onTweenStopped | false | func | Function handle called when tween stopped by press event. | none |
| onTweenFinish | false | func | Function handle called when tween completes full tween. | none |
| onAnimationFinish | false | func | Function handle called when animation comes to end. | none |
| visible | false | bool | Indicates if sprite is visible. | true |
| fps | false | number | Indicates the number of frames per second. | 10 |

## Use of Refs to Access AnimatedSprite Methods
While "refs" should be avoided in most cases they can be useful. As Facebook [states](https://facebook.github.io/react/docs/refs-and-the-dom.html),
"there are a few cases where you need to imperatively modify a child outside of the typical dataflow." One of those cases is triggering imperative animations.

There are several methods of AnimatedSprite that you will want to access via refs.
The are:
  * **startTween**: Allows for programatic starting a tween.
  * **getCoordinates**: Gets the current position ([top, left]) coordinates for an AnimatedSprite.

The following is an example of usage. Suppose you had the following AnimatedSprite component:
```
<AnimatedSprite
  sprite={monsterSprite}
  ref={'monsterRef'}
  ...
/>
```
Then in your declaring application you would be able to access the AnimatedSprite
references as follows (See [example app](https://github.com/micahrye/react-native-animated-sprite/blob/master/example/app/index.android.js)):
```
this.refs.monsterRef.startTween();
// or
const coords = this.refs.monsterRef.getCoordinates();
```

## Sprites & Tweens Overview
Sprites and tweens are key aspects of the AnimatedSprite component. The following
gives an overview of each.

### Sprites Overview
A sprite is an object that contain with the following shape:
```
{
  name: <string>,
  size: <object>,
  animationTypes: <array>,
  frames: <array>,
  animationIndex: <function>,
}
```
See [example app](https://github.com/micahrye/react-native-animated-sprite/blob/master/example/sprites/monster/monsterSprite.js) for working example.

#### Sprite Fields
  * **name**: A string representing the name of the sprite
  * **size**: An object containing the width and height of the individual image frames, e.g. {width: 220, height: 220}. Note that all image frames should be the same size.
  * **animationTypes**: An array of animation types for the sprite, e.g. ['WALK', 'JUMP'] would
  indicate that the sprite has a walk and jump animation.
  * **frames**: An array of image require statements. React Native loads images through
  require.
  * **animationIndex**: Is a function that should return the array indices from "frames" for
  a given animation type defined in "animationTypes".

### Tweens Overview
Tweens.js contains many tween objects that can be used by AnimatedSprite for creating
tweening effects. Tweens.js defines "high" level tweens, such as "zoomIntoExistence"
and "wiggle," which can be used by AnimatedSprite. AnimatedSprite can take "tweenOptions,"
which define the tween. For example:
```
{
  tweenType: 'sine-wave',
  startXY: [coords.left, coords.top],
  xTo: [sample(location), sample(location)],
  yTo: [sample(location), sample(location)],
  duration: 1000,
  loop: false,
}
```
Defines a tween of type "sine-wave" that starts at "startXY" and has "x, y" coordinates
that change over time. "xTo" and "yTo" are arrays that indicate where a AnimatedSprite
coordinate will tween too. Duration indicates the total duration of the tween, and
loop indicates if the tween will loop (true) or be only happen once (false).

## Notes on Usage
Mobile operating systems such as Android and iOS have significantly less application memory then other systems. As a result performance can be effected by the size and number of images used by an application using AnimatedSprite.

For performance reasons changes in AnimatedSprite dimensions must maintain the
aspect ratio of the underlying image media.
