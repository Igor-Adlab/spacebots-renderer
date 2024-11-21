import { Audio, blur, Rect, Video, View2D, Layout } from '@revideo/2d';
import { createRef, Scene, waitFor } from '@revideo/core';

function getFlexPosition(position: string) {
  switch (position) {
    case 'top':
      return 'start';
    case 'bottom':
      return 'end';
    default:
      return 'center';
  }
}

function applyBlur(video: Video) {
  video.setVolume(0);
  video.opacity(0.3);
  video.height('100%');
  video.filters([blur(5)]);

  return video;
}

export function* popup(scene: Scene, view: View2D) {
  // Assets
  const audioUrl = scene.variables.get('audioUrl', '')();
  const videoUrl = scene.variables.get('videoUrl', '')();
  const backdropUrl = scene.variables.get('backdropVideoUrl', '')();

  const backdropStart = +scene.variables.get('backdropStart', 0)();

  // Volume config
  const mainAudioVolume = scene.variables.get('mainAudioVolume', 100)();
  const customAudioVolume = scene.variables.get('customAudioVolume', 100)();
  const backdropAudioVolume = scene.variables.get('backdropAudioVolume', 50)();

  // Placement and scaling
  const placement = scene.variables.get('position', '')();

  const $audio = createRef<Audio>();
  const $video = createRef<Video>();
  const $backdrop = createRef<Video>();

  const mainVideo = (
    <Video
      src={videoUrl}
      volume={mainAudioVolume / 100}
      play={true}
      ref={$video}
    />
  );

  const backdropVideo = (
    <Video
      loop
      src={backdropUrl}
      time={backdropStart}
      volume={backdropAudioVolume / 100}
      play={true}
      ref={$backdrop}
    />
  );

  yield view.add(
    <>
      <Rect layout direction="column" height="100%" width="100%">
        <Rect
          layout
          height="100%"
          width="100%"
          justifyContent="center"
          alignItems="end"
        >
          {backdropVideo}
        </Rect>
      </Rect>
      <Rect
        layout
        height="90%"
        width="90%"
        justifyContent="center"
        alignItems={getFlexPosition(placement)}
      >
        {mainVideo}
      </Rect>
    </>
  );

  if (!!audioUrl) {
    yield view.add(
      <Audio
        src={audioUrl}
        play
        loop
        volume={customAudioVolume / 100}
        ref={$audio}
      />
    );
  }

  // If main video - vertical
  if ($video().height() > $video().width()) {
    $video().height('60%');
  } else {
    $video().width('100%');
  }

  // If backdrop - vertical
  if ($backdrop().height() > $backdrop().width()) {
    $backdrop().width('100%');
  } else {
    $backdrop().height('100%');
  }

  // Play video
  yield* waitFor($video().getDuration());

  // Do Cleanup
  $backdrop().pause();
  $video().pause();
  if (audioUrl) {
    $audio().pause();
  }

  view.removeChildren();
}
