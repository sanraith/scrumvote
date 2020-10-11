export enum ClientActions {
    joinRoom = "join_room",
    leaveRooms = "leave_rooms",
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

export interface JoinRoomResponse extends EmitResponse {
    name?: string;
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
