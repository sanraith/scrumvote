import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { ClientActions, EmitResponse, JoinRoomData } from '../../../shared/socket';

@Injectable({
    providedIn: 'root'
})
export class SocketClientService {
    constructor(private roomSocket: Socket) { }

    connect(): void {
        this.roomSocket.connect();
    }

    joinRoomAsync(roomId: string): Observable<boolean> {
        return new Observable((subscriber) => {
            this.roomSocket.emit(ClientActions.joinRoom, <JoinRoomData>{ roomId: roomId }, (resp: EmitResponse) => {
                subscriber.next(resp.success);
                subscriber.complete();
            });
        });
    }

    disconnect(): void {
        this.roomSocket.emit(ClientActions.leaveRoom, null, (resp: EmitResponse) => { });
        this.roomSocket.removeAllListeners();
        this.roomSocket.disconnect();
    }
}
