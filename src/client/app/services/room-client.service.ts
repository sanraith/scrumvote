import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import PublicRoomInfo from 'src/shared/model/publicRoomInfo';
import { CREATE_POLL_API, CREATE_ROOM_API, ROOM_ID_PARAM, ROOM_INFO_API } from 'src/shared/paths';
import { CreatePollRequest, CreatePollResponse } from 'src/shared/roomResponses';

@Injectable({
    providedIn: 'root'
})
export class RoomClientService {
    private roomId: string;

    constructor(private httpClient: HttpClient) { }

    init(roomId: string) {
        this.roomId = roomId;
    }

    getRoomInfoAsync(): Observable<PublicRoomInfo> {
        return this.httpClient.get<PublicRoomInfo>(ROOM_INFO_API.replace(ROOM_ID_PARAM, this.roomId));
    }

    createPollAsync(question: string): Observable<CreatePollResponse> {
        return this.httpClient.post<CreatePollResponse>(CREATE_POLL_API.replace(ROOM_ID_PARAM, this.roomId), <CreatePollRequest>{
            question: question
        });
    }
}
