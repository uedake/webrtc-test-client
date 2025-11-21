import {
  TrackLoop,
  TrackRefContext,
  ParticipantTile,
  useTracks,
  ControlBar,
} from '@livekit/components-react';
import { Track } from 'livekit-client';


type Props = {
};

export const AppContents: React.FC<Props> = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: false },
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-blue-800 mb-4">Publish</h1>
      <ControlBar />
      <h1 className="text-xl font-bold text-blue-800 mb-4">Videos</h1>
      <TrackLoop tracks={tracks}>
        <TrackRefContext.Consumer>
          {(trackRef) => {
            return <ParticipantTile trackRef={trackRef} />
          }
          }
        </TrackRefContext.Consumer>
      </TrackLoop>
    </div>
  );
}
