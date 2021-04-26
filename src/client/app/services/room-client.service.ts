import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CANCEL_VOTE_API, CLOSE_POLL_API, CREATE_POLL_API, DELETE_POLL_API, POLL_ID_PARAM, REOPEN_POLL_API, ROOM_ID_PARAM, ROOM_INFO_API, VOTE_POLL_API } from 'src/shared/paths';
import { CancelVoteRequest, CancelVoteResponse, ClosePollResponse, CreatePollRequest, CreatePollResponse, DeletePollRequest, DeletePollResponse, EmptyRequest, PollVoteRequest as VotePollRequest, PollVoteResponse as VotePollResponse, ReopenPollResponse, ResponseBase, RoomInfoResponse } from 'src/shared/roomResponses';

@Injectable({
    providedIn: 'root'
})
export class RoomClientService {
    private roomId: string;

    constructor(private httpClient: HttpClient) { }

    init(roomId: string) {
        this.roomId = roomId;
    }

    getRoomInfoAsync(): Observable<RoomInfoResponse> {
        return this.httpClient.get<RoomInfoResponse>(ROOM_INFO_API.replace(ROOM_ID_PARAM, this.roomId));
    }

    createPollAsync(question: string): Observable<CreatePollResponse> {
        return this.httpClient.post<CreatePollResponse>(
            CREATE_POLL_API.replace(ROOM_ID_PARAM, this.roomId),
            <CreatePollRequest>{
                question: question
            });
    }

    votePollAsync(pollId: string, comment: string): Observable<VotePollResponse> {
        return this.httpClient.post<VotePollResponse>(
            VOTE_POLL_API.replace(ROOM_ID_PARAM, this.roomId).replace(POLL_ID_PARAM, pollId),
            <VotePollRequest>{
                comment: comment,
                value: 0
            });
    }

    cancelVoteAsync(pollId: string, voteId: string): Observable<CancelVoteResponse> {
        return this.httpClient.post<VotePollResponse>(
            CANCEL_VOTE_API.replace(ROOM_ID_PARAM, this.roomId).replace(POLL_ID_PARAM, pollId),
            <CancelVoteRequest>{
                voteId: voteId
            });
    }

    closePollAsync(pollId: string): Observable<ClosePollResponse> {
        return this.httpClient.post<ResponseBase>(
            CLOSE_POLL_API.replace(ROOM_ID_PARAM, this.roomId).replace(POLL_ID_PARAM, pollId),
            <EmptyRequest>{}
        );
    }


    reopenPollAsync(pollId: string): Observable<ReopenPollResponse> {
        return this.httpClient.post<ResponseBase>(
            REOPEN_POLL_API.replace(ROOM_ID_PARAM, this.roomId).replace(POLL_ID_PARAM, pollId),
            <EmptyRequest>{}
        );
    }

    deletePollAsync(pollId: string): Observable<DeletePollResponse> {
        return this.httpClient.post<DeletePollResponse>(
            DELETE_POLL_API.replace(ROOM_ID_PARAM, this.roomId).replace(POLL_ID_PARAM, pollId),
            <DeletePollRequest>{}
        );
    }
}
