export interface ResponseBase {
    success: boolean;
    error?: string;
}

export interface EmptyRequest { }

export interface CreateRoomRequest {
    name: string;
}

export interface CreateRoomResponse extends ResponseBase {
    id: string;
    name: string;
}

export interface CreatePollRequest {
    question: string;
}

export interface CreatePollResponse extends ResponseBase {
    id: string;
    name: string;
}

export interface PollVoteRequest {
    value: number;
    comment: string;
}
export interface PollVoteResponse extends ResponseBase {
}
