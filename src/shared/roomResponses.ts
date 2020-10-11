export interface CreateRoomRequest {
    name: string;
}

export interface CreateRoomResponse {
    success: boolean;
    id: string,
    name: string,
    error?: string
}
