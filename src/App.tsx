import { useState } from 'react';
import {
  RoomContext,
} from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';

import { AppMain } from './AppMain'

export default function App() {
  const [room] = useState(() => new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
  }));

  return (
    <div className={"h-screen"}>
      <RoomContext.Provider value={room}>
        <AppMain />
      </RoomContext.Provider>
    </div>
  )
}

