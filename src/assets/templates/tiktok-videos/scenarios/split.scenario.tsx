import { Audio, blur, Rect, Video, View2D, Layout } from '@revideo/2d';
import { createRef, Scene, useTime, waitFor } from '@revideo/core';

function applyBlur(video: Video) {
  video.setVolume(0);
  video.opacity(0.3);
  video.height('100%');
  video.filters([blur(5)]);

  return video;
}

export function* split(scene: Scene, view: View2D) {
  // Is background blured?
  const withBlur = scene.variables.get('withBlur', false)();

  const backdropStart = +scene.variables.get('backdropStart', 0)();

  // Assets
  const audioUrl = scene.variables.get('audioUrl', '')();
  const videoUrl = scene.variables.get('videoUrl', '')();
  const backdropUrl = scene.variables.get('backdropVideoUrl', '')();

  // Volume config
  const mainAudioVolume = scene.variables.get('mainAudioVolume', 100)();
  const customAudioVolume = scene.variables.get('customAudioVolume', 100)();
  const backdropAudioVolume = scene.variables.get('backdropAudioVolume', 50)();

  // Placement and scaling
  const placement = scene.variables.get('position', 'top')();
  const [topVideoPercent, bottomVideoPercent] = scene.variables.get(
    'ratio',
    [50, 50]
  )();

  const $layout = createRef<Rect>();
  const $blured = createRef<Layout>();

  const $audio = createRef<Audio>();
  const $video = createRef<Video>();
  const $backdrop = createRef<Video>();

  const $top = createRef<Rect>();
  const $bottom = createRef<Rect>();

  const $topBlured = createRef<Rect>();
  const $bottomBlured = createRef<Rect>();

  const mainVideo = (
    <Video
      play
      src={videoUrl}
      zIndex={100}
      volume={mainAudioVolume / 100}
      ref={$video}
    />
  );

  const backdropVideo = (
    <Video
      loop
      play
      zIndex={100}
      time={backdropStart}
      src={backdropUrl}
      volume={backdropAudioVolume / 100}
      ref={$backdrop}
    />
  );

  // Create blured
  const mainVideoBlured = applyBlur(mainVideo.clone());

  // Calculate height
  const topContainerHeight = (1920 / 100) * topVideoPercent!;
  const bottomContainerHeight = (1920 / 100) * bottomVideoPercent!;

  yield view.add(
    <>
      <Layout ref={$blured} size={'100%'}>
        <Layout height={topContainerHeight} opacity={1}>
          <Rect
            fill="#ffffff"
            height="100%"
            width="100%"
            ref={$topBlured}
          ></Rect>
        </Layout>
        <Layout
          position={{ x: 0, y: 1920 - topContainerHeight! }}
          size="50%"
          opacity={1}
        >
          <Rect
            fill="#ffffff"
            height="100%"
            width="100%"
            ref={$bottomBlured}
          ></Rect>
        </Layout>
      </Layout>

      <Rect ref={$layout} layout direction="column" height="100%" width="100%">
        <Layout
          layout
          size="100%"
          height={topContainerHeight}
          grow={1}
          direction="column"
          alignItems="center"
          justifyContent="center"
          ref={$top}
        ></Layout>
        <Layout
          layout
          size="100%"
          height={bottomContainerHeight}
          grow={1}
          direction="column"
          alignItems="center"
          justifyContent="center"
          ref={$bottom}
        ></Layout>
      </Rect>
    </>
  );

  if (!!audioUrl) {
    yield view.add(
      <Audio
        src={audioUrl}
        loop
        volume={customAudioVolume / 100}
        ref={$audio}
      />
    );
  }

  let $mainVideoContainer, $backdropVideoContainer;
  if (placement == 'top') {
    $mainVideoContainer = $top;
    $backdropVideoContainer = $bottom;

    $top().add(mainVideo);
    $bottom().add(backdropVideo);

    withBlur && $topBlured().add(mainVideoBlured);
  } else {
    $mainVideoContainer = $bottom;
    $backdropVideoContainer = $top;

    $bottom().add(mainVideo);
    $top().add(backdropVideo);

    withBlur && $bottomBlured().add(mainVideoBlured);
  }

  // If main video - vertical
  if ($video().height() > $video().width()) {
    $video().height('100%');
  } else {
    $video().width('100%');
  }

  // If backdrop - vertical
  if ($backdrop().height() > $backdrop().width()) {
    $backdrop().width('100%');
  } else {
    $backdrop().height(bottomContainerHeight);
  }

  // Play video
  yield* waitFor($video().getDuration());

  // Do Cleanup
  $backdrop().pause();
  $video().pause();
  if (audioUrl) {
    $audio().pause();
  }

  if (withBlur) {
    mainVideoBlured.pause();
  }

  $layout().remove();
  $blured().remove();
}
