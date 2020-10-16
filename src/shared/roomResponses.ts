export interface CreateRoomRequest {
    name: string;
}

export interface CreateRoomResponse {
    success: boolean;
    id: string,
    name: string,
    error?: string
}

export interface CreatePollRequest {
    question: string;
}

export interface CreatePollResponse {
    success: boolean;
    id: string,
    name: string,
    error?: string
}

export interface PollVoteRequest {
    vote: number;
    comment: string;
}
