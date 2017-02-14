/*
Nice cheat sheet of easing functions http://easings.net/
*/
import {
  Animated,
  Easing,
} from 'react-native';

/*
  NOTE: may want to consider refactor that passes back Animated objects that
  get their "start()" called directly by callee. This would allow for the
  callee to chain animations together in a way that we currently cannot.
  Forthermore, the callee would still pass callback functions and have more
  callee level clarity.
*/

function getSequenceX (options, componentValues) {
  const duration = options.duration;
  const numTrasitions = options.xTo.length;
  return options.xTo.map((x)=>{
    return Animated.timing(componentValues.left, {
        duration: duration / numTrasitions,
        toValue: x,
        easing: Easing.sin,
    });
  });
}

function getSequenceY (options, componentValues) {
  const duration = options.duration;
  const numTrasitions = options.yTo.length;
  return options.yTo.map((y)=>{
    return Animated.timing(componentValues.top, {
      duration: duration / numTrasitions,
      toValue: y,
      easing: Easing.sin,
    });
  });
}


const sineWave = {
  name: 'sine-wave',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.top.setValue(options.startXY[1]);
    componentValues.left.setValue(options.startXY[0]);
    Animated.sequence([
      Animated.delay(options.delay),
      Animated.parallel(
        [
          Animated.sequence(getSequenceX(options, componentValues)),
          Animated.sequence(getSequenceY(options, componentValues)),
        ]
      )]
    ).start(() => {
      if (options.loop === false) {
        // TODO: should pass end coordinates to onTweenFinish
        onTweenFinish();
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    // TODO: change stopVlaues from [] to {width: X, height: Y}
    let stopValues = [];
    // BUG: if stopping tween prior to actual finish and then removing
    // component RN wil not recognize first press event. WTF
    // try {
    //   componentValues.left.stopAnimation((value) => stopValues.push(value));
    //   componentValues.top.stopAnimation((value) => stopValues.push(value));
    // } catch (err) {
    //   console.warn('STOP ERROR TWEEN');
    // }
    stopValues.push(componentValues.left._value);
    stopValues.push(componentValues.top._value);
    sendStopValues(stopValues);
  },
};

const bounce = {
  name: 'bounce',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.scale.setValue(0.29);
    Animated.spring(
    componentValues.scale,
      {
        toValue: 1.0,
        friction: 2.5,
        duration: options.duration,
      }
    ).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      }
      startTween(options, componentValues, onTweenFinish);
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.scale.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const linearMove = {
  name: 'linear-move',
  start: function startTween  (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);

    Animated.parallel([
      Animated.timing(          // Uses easing functions
        componentValues.left,    // The value to drive
        {
          toValue: options.endXY[0],
          easing: Easing.linear,
          duration: options.duration,
        }            // Configuration
      ),

      Animated.timing(          // Uses easing functions
        componentValues.top,    // The value to drive
        {
          toValue: options.endXY[1],
          easing: Easing.linear,
          duration: options.duration,
        }            // Configuration
      ),
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      }
      startTween(options, componentValues, onTweenFinish);
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const zoomIntoExistence = {
  name: 'zoom-into-existence',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.scale.setValue(options.startScale);
    componentValues.opacity.setValue(options.startOpacity);
    Animated.parallel(
      [
        Animated.timing(
          componentValues.scale,
          {
            toValue: options.endScale,
            easing: Easing.bounce,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.opacity,
          {
            toValue: 1,
            easing: Easing.linear,
            duration: 500,
          }
        ),
      ]
    ).start(() => {
      if (options.loop === false) {
       onTweenFinish();
     } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    let stopValues = [];
    componentValues.scale.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const zoomOutExistence = {
  name: 'zoom-out-existence',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.scale.setValue(options.startScale);
    componentValues.opacity.setValue(options.startOpacity);
    Animated.parallel(
      [
        Animated.timing(
          componentValues.scale,
          {
            toValue: options.endScale,
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.opacity,
          {
            toValue: 0,
            easing: Easing.linear,
            duration: options.duration - (options.duration/10),
          }
        ),
      ]
    ).start(() => {
      if (options.loop === false) {
       onTweenFinish();
     } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    let stopValues = [];
    componentValues.scale.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const pulse = {
  name: 'pulse',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.scale.setValue(1);
    Animated.sequence([
      Animated.timing(
        componentValues.scale,
        {
          toValue: 1.25,
          easing: Easing.linear,
          duration: 400,
        }
      ),
      Animated.timing(
        componentValues.scale,
        {
          toValue: 1,
          easing: Easing.linear,
          duration: 400,
        }
      ),
    ]).start(() => {
      if (options.loop === false) {
       onTweenFinish();
     } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    let stopValues = [];
    componentValues.scale.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const wiggle = {
  name: 'wiggle',
  start: function startTween (options, componentValues, onTweenFinish) {
    Animated.sequence([
      Animated.timing(
        componentValues.rotateZ,
        {
          toValue: 3,
          easing: Easing.linear,
          duration: 100,
        }
      ),
      Animated.timing(
        componentValues.rotateZ,
        {
          toValue: -3,
          easing: Easing.linear,
          duration: 100,
        }
      ),
      Animated.spring(
        componentValues.rotateZ,
        {
          toValue: 0,
          friction: 1,
          duration: 0,
        }
      ),
    ]).start(() => {
      if (options.loop === false) {
       onTweenFinish();
       return;
     } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    let stopValues = [];
    componentValues.rotateZ.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const bounceDrop = {
  name: 'bounce-drop',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.top.setValue(options.startY);
    Animated.timing(
      componentValues.top,
      {
        toValue: options.endY,
        easing: Easing.bounce,
        duration: options.duration,
      }
    ).start(() => {
      if (options.loop === false) {
       onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const zoom = {
  name: 'zoom',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    Animated.timing(
      componentValues.left,
      {
        toValue: options.endXY[0],
        easing: Easing.back(3),
        duration: options.duration,
      }
    ).start();
    componentValues.top.setValue(options.startXY[1]);
    Animated.timing(
      componentValues.top,
      {
        toValue: options.endXY[1],
        easing: Easing.back(3),
        duration: options.duration,
      }
    ).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      }
      startTween(options, componentValues, onTweenFinish);
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const hop = {
  // TODO: this can be modified to include left then you can do more with it,
  // not just hop in place
      // see hopForward for this
  name: 'hop',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.top.setValue(options.startY);
    Animated.sequence([
      Animated.timing(
        componentValues.top,
        {
          toValue: options.yTo,
          easing: Easing.linear,
          duration: options.duration/2,
        }
      ),
      Animated.timing(
        componentValues.top,
        {
          toValue: options.endY,
          easing: Easing.bounce,
          duration: options.duration/2,
        }
      ),
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stop (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const tumbleOff = {
  name: 'tumble-off',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);
    componentValues.rotation.setValue(0);
    Animated.parallel([
      Animated.timing(
        componentValues.left,
        {
          toValue: options.endXY[0],
          easing: Easing.back(3),
          duration: options.duration,
        }
      ),
      Animated.timing(
        componentValues.top,
        {
          toValue: options.endXY[1],
          easing: Easing.back(3),
          duration: options.duration,
        }
      ),
      Animated.timing(
        componentValues.rotation,
        {
          toValue: options.endXY[0],
          easing: Easing.back(3),
          duration: options.duration,
        }
      )
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const spin = {
  name: 'spin',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.rotation.setValue(0);
    Animated.timing(
      componentValues.rotation,
      {
        toValue: 100,
        easing: Easing.linear,
        duration: options.duration,
      }
    ).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.rotation.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const hopForward = {
  name: 'hop-forward',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(
          componentValues.left,
          {
            toValue: options.endXY[0]/2,
            easing: Easing.sin,
            duration: options.duration/2,
          }
        ),
        Animated.timing(
          componentValues.left,
          {
            toValue: options.endXY[0],
            easing: Easing.sin,
            duration: options.duration/2,
            delay: 100,
          }
        ),
      ]),
      Animated.sequence([
        Animated.timing(
          componentValues.top,
          {
            toValue: options.yTo[0],
            easing: Easing.linear,
            duration: options.duration/4,
          }
        ),
        Animated.timing(
          componentValues.top,
          {
            toValue: options.startXY[1],
            easing: Easing.linear,
            duration: options.duration/4,
          }
        ),
        Animated.timing(
          componentValues.top,
          {
            toValue: options.yTo[0],
            easing: Easing.linear,
            duration: options.duration/4,
            delay: 100,
          }
        ),
        Animated.timing(
          componentValues.top,
          {
            toValue: options.startXY[1],
            easing: Easing.linear,
            duration: options.duration/4,
          }
        ),
      ]),
    ]).start(() => {
        if (options.loop === false) {
          onTweenFinish();
          return;
        } else {
          startTween(options, componentValues, onTweenFinish);
        }
      });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const sendOffScreen = {
  name: 'send-off-screen',
  start: function startTween (options, componentValues, onTweenFinish) {
      componentValues.top.setValue(-500);
    },
  stop: function stopTween (componentValues, sendStopValues) {
  },
};

const basicBack = {
  name: 'basic-back',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.top.setValue(options.startY);
    Animated.timing(
      componentValues.top,
      {
        toValue: options.endY,
        easing: Easing.back(1.5),
        duration: options.duration,
      }
    ).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

// TODO: look at refactor of multiple curveSpins into one.

const curveSpin = {
  name: 'curve-spin',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);
    Animated.sequence([
      Animated.parallel([
       Animated.timing(
          componentValues.top,
          {
            toValue: options.endXY[1],
            easing: Easing.quad,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.left,
          {
            toValue: options.endXY[0],
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.rotateZ,
          {
            toValue: 400,
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.scale,
          {
            toValue: 0.5,
            easing: Easing.linear,
            duration: options.duration,
          }
        )]
      ),
      Animated.timing(
        componentValues.top,
        {
          toValue: -500,
          duration: 0,
        }
      ),
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const curveSpin2 = {
  name: 'curve-spin2',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);
    Animated.sequence([
      Animated.parallel([
       Animated.timing(
          componentValues.top,
          {
            toValue: options.endXY[1],
            easing: Easing.quad,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.left,
          {
            toValue: options.endXY[0],
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.rotateZ,
          {
            toValue: 400,
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
      ]),
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return;
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const curveSpin3= {
  name: 'curve-spin3',
  start: function startTween (options, componentValues, onTweenFinish) {
    componentValues.left.setValue(options.startXY[0]);
    componentValues.top.setValue(options.startXY[1]);
    Animated.sequence([
      Animated.parallel([
       Animated.timing(
          componentValues.top,
          {
            toValue: options.endXY[1],
            easing: Easing.quad,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.left,
          {
            toValue: options.endXY[0],
            easing: Easing.quad,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.rotateZ,
          {
            toValue: 400,
            easing: Easing.linear,
            duration: options.duration,
          }
        ),
        Animated.timing(
          componentValues.scale,
          {
            toValue: 0.5,
            easing: Easing.linear,
            duration: options.duration,
          }
        )
      ]),
    ]).start(() => {
      if (options.loop === false) {
        onTweenFinish();
        return
      } else {
        startTween(options, componentValues, onTweenFinish);
      }
    });
  },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const curveFall = {
  name: 'curve-fall',
  start: function startTween (options, componentValues, onTweenFinish) {
      componentValues.left.setValue(options.startXY[0]);
      componentValues.top.setValue(options.startXY[1]);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(
            componentValues.top,
            {
              toValue: options.endXY[1],
              easing: Easing.quad,
              duration: options.duration,
            }
          ),
          Animated.timing(
            componentValues.left,
            {
              toValue: options.endXY[0],
              easing: Easing.linear,
              duration: options.duration,
            }
          ),
        ]),
      ]).start(() => {
        if (options.loop === false) {
          onTweenFinish();
          return;
        } else {
          startTween(options, componentValues, onTweenFinish);
        }
      });
    },
  stop: function stopTween (componentValues, sendStopValues) {
    const stopValues = [];
    componentValues.left.stopAnimation((value) => stopValues.push(value));
    componentValues.top.stopAnimation((value) => stopValues.push(value));
    sendStopValues(stopValues);
  },
};

const Tweens = {
  [bounce.name]: bounce,
  [zoomIntoExistence.name]: zoomIntoExistence,
  [zoomOutExistence.name]: zoomOutExistence,
  [pulse.name]: pulse,
  [linearMove.name]: linearMove,
  [sineWave.name]: sineWave,
  [wiggle.name]: wiggle,
  [bounceDrop.name]: bounceDrop,
  [zoom.name]: zoom,
  [hop.name]: hop,
  [tumbleOff.name]: tumbleOff,
  [spin.name]: spin,
  [hopForward.name]: hopForward,
  [sendOffScreen.name]: sendOffScreen,
  [basicBack.name]: basicBack,
  [curveSpin.name]: curveSpin,
  [curveSpin2.name]: curveSpin2,
  [curveSpin3.name]: curveSpin3,
  [curveFall.name]: curveFall,
};

export default Tweens;
