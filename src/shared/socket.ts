import PublicPollInfo from './model/publicPollInfo';

export enum ClientActions {
    joinRoom = "join_room",
    leaveRoom = "leave_rooms",
}

export enum ClientEvents {
    connect = "connect",
    disconnect = "disconnect",
    kickedFromRoom = "kicked_from_room",
    pollChanged = "pollChanged",
    pollListChanged = "pollListChanged"
}

export interface EmitResponse {
    success: boolean;
    message?: string;
}

export interface JoinRoomData {
    roomId: string
}

export interface KickUserData {
    publicId: string
}

export interface KickedFromRoomData {
    roomId: string,
    reason: string
}

export interface PollChangedData {
    poll: PublicPollInfo
}

export interface PollsChangedData {
    polls: PublicPollInfo[]
}
