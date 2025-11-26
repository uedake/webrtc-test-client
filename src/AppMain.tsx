import { useState, useEffect } from 'react';
import {
  useDataChannel,
  useTracks,
} from '@livekit/components-react';
import { ChevronsUpDown } from "lucide-react"

import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible"
import {
  Button
} from "./components/ui/button"

import { AppSideBar } from "./AppSideBar"
import { AppContents } from "./AppContents"
import { TopicTable, type PubStat } from "./TopicTable"

export function AppMain() {
  const [topicMsg, setTopicMsg] = useState<Record<string, PubStat>>({})
  useDataChannel(
    (message) => {
      if (message && message.topic) {
        const topic: string = message.topic
        const msg_json = new TextDecoder().decode(message.payload)
        const msg_obj = JSON.parse(msg_json)
        msg_obj.connected = true
        setTopicMsg(
          prev => {
            return { ...prev, [topic]: msg_obj }
          }
        )
      }
    }
  )
  const tracks = useTracks()

  useEffect(() => {
    const track_sid_list = tracks.map((track) => track.publication.trackSid)
    for (const topic in topicMsg) {
      if (!track_sid_list.includes(topicMsg[topic].track_name)) {
        const newMsg = { ...topicMsg[topic], "connected": false }
        setTopicMsg(
          prev => {
            return { ...prev, [topic]: newMsg }
          }
        )
      }
    }
  }, [tracks])

  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSideBar topicMsg={topicMsg} />
        <main className="flex-1 p-4 bg-gray-100">
          <SidebarTrigger />
          <Collapsible defaultOpen={true}>

            <CollapsibleTrigger asChild>
              <h1 className="text-xl font-bold text-blue-800 mb-4">
                Tracks Data({Object.values(topicMsg).length})
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                </Button>
              </h1>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TopicTable topicMsg={topicMsg} />
            </CollapsibleContent>
          </Collapsible>
          <hr />
          <AppContents />
        </main>
      </SidebarProvider>
    </div>
  )
}

