// @ts-ignore
import { makeScene2D } from '@revideo/2d';
// @ts-ignore
import { makeProject, useScene } from '@revideo/core';
import { postRoll, preRoll } from './general-timeline';
import { popup } from './scenarios/popup.scenario';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const scene = useScene();
  yield* preRoll(scene, view);
  yield* popup(scene, view);
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
