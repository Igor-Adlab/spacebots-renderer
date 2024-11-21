//@ts-ignore
import { makeScene2D, Rect, Video } from '@revideo/2d';
//@ts-ignore
import { createRef, makeProject, useScene, waitFor } from '@revideo/core';

import { split } from './scenarios/split.scenario';
import { postRoll, preRoll } from './general-timeline';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const scene = useScene();

  yield* preRoll(scene, view);
  yield* split(scene, view);
  yield* postRoll(scene, view);
});

/**
 * The final revideo project
 */
export default makeProject({
  name: 'tgtok-popup-view',
  scenes: [scene],
  settings: {
    // Example settings:
    shared: {
      size: { x: 1080, y: 1920 },
    },
  },
});
