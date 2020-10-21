import { Injectable, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { SimpleEventDispatcher } from 'strongly-typed-events';
import { ClientActions, ClientEvents, EmitResponse, JoinRoomData, PollsChangedData } from '../../../shared/socket';

@Injectable({
    providedIn: 'root'
})
export class SocketClientService {
    private _pollChanged = new SimpleEventDispatcher<PollsChangedData>();
    get pollChanged() { return this._pollChanged.asEvent(); }

    constructor(private roomSocket: Socket) { }

    connect(): void {
        this.roomSocket.connect();
        this.roomSocket.on(ClientEvents.pollChanged, (args: PollsChangedData) => {
            this._pollChanged.dispatch(args);
        });
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
        this._pollChanged.clear();
    }
}
