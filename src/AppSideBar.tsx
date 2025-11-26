import { useState, useEffect } from 'react';
import axios from "axios";
import {
    useConnectionState,
    useRoomContext,
    useTracks,
    useLocalParticipant,
    useRemoteParticipants,
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client'

import { Sidebar, SidebarContent, SidebarHeader } from "./components/ui/sidebar"
import { Input } from "./components/ui/input";
import { Field, FieldLabel } from "./components/ui/field";

import { type PubStat } from "./TopicTable"


const serverUrl = 'wss://test-rh5n4iee.livekit.cloud';

type TokenResponse = {
    token: string;
};

async function getToken(identity: string, userName: string, roomName: string) {
    const url = `https://sample-api.wal-test.com/test/livekit_token?room_name=${roomName}&identity=${identity}&username=${userName}`
    const res = await axios.get<TokenResponse>(url);
    return res.data.token
}

type Props = {
    topicMsg: Record<string, PubStat>
};

export const AppSideBar: React.FC<Props> = () => {
    const [roomName, setRoomName] = useState("testroom")

    const room = useRoomContext()
    const connectionState = useConnectionState(room);
    const me = useLocalParticipant()
    const others = useRemoteParticipants()
    const tracks = useTracks(
        undefined,
        { onlySubscribed: false },
    )

    useEffect(() => {
        const connect = async () => {
            const token = await getToken("testuser", "testuser", roomName)
            await room.connect(serverUrl, token);
        };
        connect();

        return () => {
            room.disconnect();
        };
    }, [roomName]);

    const sub_tracks = tracks.filter(track => track.publication?.isSubscribed)
    const not_sub_tracks = tracks.filter(track => !track.publication?.isSubscribed)

    useEffect(() => {
        room.on(RoomEvent.TrackMuted, (pub) => {
            console.log('Track muted',pub.trackSid);
        });

        room.on(RoomEvent.TrackUnmuted, (pub) => {
            console.log('Track unmuted',pub.trackSid);
        });
    }, [room]);

    return (
        <Sidebar>
            <SidebarHeader>
                <Field>
                    <FieldLabel htmlFor="roomName">Room : {connectionState}</FieldLabel>
                    <Input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                </Field>
            </SidebarHeader>
            <SidebarContent>
                <FieldLabel htmlFor="participants">Participants</FieldLabel>
                <ul id="participants">
                    <li>
                        {me.localParticipant.name ? me.localParticipant.name : me.localParticipant.identity} (me)
                    </li>
                    {
                        others.map((other) => {
                            return (
                                <li key={other.sid}>
                                    {other.name ? other.name : other.identity}
                                    : {other.getTrackPublications().length} stream
                                </li>
                            )
                        })
                    }
                </ul>
                <FieldLabel htmlFor="tracks">Subscribed Tracks</FieldLabel>
                <ul id="tracks">
                    {
                        sub_tracks.length > 0 ? sub_tracks.map((track) => {
                            return (
                                <li key={track.publication?.trackSid}>
                                    {track.publication?.trackName}({track.publication?.kind})
                                    by {track.participant.name ? track.participant.name : track.participant.identity}
                                </li>
                            )
                        }) : "none"
                    }
                </ul>
                <FieldLabel htmlFor="pending_tracks">Not Subscribed Tracks</FieldLabel>
                <ul id="pending_tracks">
                    {
                        not_sub_tracks.length > 0 ? not_sub_tracks.map((track) => {
                            return (
                                <li key={track.publication?.trackSid}>
                                    {track.publication?.trackName}({track.publication?.kind}{track.publication?.track?.isMuted ? ":muted" : ""})
                                    by {track.participant.name ? track.participant.name : track.participant.identity}
                                </li>
                            )
                        }) : "none"
                    }
                </ul>
            </SidebarContent>
        </Sidebar >
    )
}
