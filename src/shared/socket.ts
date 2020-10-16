export enum ClientActions {
    joinRoom = "join_room",
    leaveRoom = "leave_rooms",
}

export enum ClientEvents {
    connect = "connect",
    disconnect = "disconnect",
    kickedFromRoom = "kicked_from_room",
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
