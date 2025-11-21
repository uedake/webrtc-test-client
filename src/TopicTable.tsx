
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./components/ui/table"

export interface PubStat {
    track_sid: string;
    track_name: string;
    time: number;
    width: number;
    height: number;
    fps: number;
    bytes: number;
    frames: number;
    bps: number;
    bytes_per_frame: number;
    delay: number;
    connected: boolean;
}


type Props = {
    topicMsg: Record<string, PubStat>
};

export const TopicTable: React.FC<Props> = (props) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>WxH</TableHead>
                    <TableHead>FPS</TableHead>
                    <TableHead>B/F</TableHead>
                    <TableHead>kbps</TableHead>
                    <TableHead>exit</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.values(props.topicMsg).map(
                    (stat) => {
                        return (
                            <TableRow key={stat.track_sid} className={
                                !stat.connected
                                    ? "bg-gray-200 opacity-60 pointer-events-none"
                                    : ""
                            }>
                                <TableCell>{stat.track_name}</TableCell>
                                <TableCell>{stat.width}x{stat.height}</TableCell>
                                <TableCell>{stat.fps.toFixed(0)}</TableCell>
                                <TableCell>{stat.bytes_per_frame.toFixed(2)}</TableCell>
                                <TableCell>{(stat.bps / 1000).toFixed(2)}</TableCell>
                                <TableCell>{stat.connected ? "false" : "true"}</TableCell>
                            </TableRow>
                        )
                    }
                )}
            </TableBody>
        </Table>
    )
}