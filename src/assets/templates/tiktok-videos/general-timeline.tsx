import { Layout, Video, View2D, Rect } from "@revideo/2d";
import { createRef, Promisable, Scene, ThreadGenerator, waitFor } from "@revideo/core";

export function* preRoll(scene: Scene, view: View2D) {
    // Pre roll
    const $preroll = {
        $video: createRef<Video>(),
        $container: createRef<Rect>(),
        videoUrl: scene.variables.get('preRollVideoUrl', '')(),
        duration: scene.variables.get('preRollVideoDuration', 0)(),
    };
    // Process pre-roll
    if ($preroll.videoUrl) {
        const $video: Video = <Video play height="100%" src={$preroll.videoUrl} ref={$preroll.$video} />

        view.add(
            <Rect direction="column" justifyContent="center" alignItems="center" opacity={1} layout size="100%" ref={$preroll.$container}>
                {$video}
            </Rect>
        );

        yield* waitFor($preroll.duration);
        
        $preroll.$video().pause();
        yield* $preroll.$container().opacity(0, .3)
        view.removeChildren()
    }
}

export function* postRoll(scene: Scene, view: View2D,
) {
    // Post roll
    const $postroll = {
        $video: createRef<Video>(),
        $container: createRef<Rect>(),
        videoUrl: scene.variables.get('postRollVideoUrl', '')(),
        duration: scene.variables.get('postRollVideoDuration', 0)(),
    }

    // Process post-roll
    if ($postroll.videoUrl) {
        view.add(
            <Rect direction="column" justifyContent="center" alignItems="center" opacity={1} layout size="100%" ref={$postroll.$container}>
                <Video play src={$postroll.videoUrl} height="100%" ref={$postroll.$video} />
            </Rect>
        );

        yield* waitFor($postroll.duration);

        $postroll.$video().pause();
        yield* $postroll.$container().opacity(0, .3)
        view.removeChildren()
    }
}