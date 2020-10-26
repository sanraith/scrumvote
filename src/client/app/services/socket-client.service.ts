import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { SimpleEventDispatcher } from 'strongly-typed-events';
import { ClientActions, ClientEvents, EmitResponse, JoinRoomData, PollChangedData, PollsChangedData } from '../../../shared/socket';

@Injectable({
    providedIn: 'root'
})
export class SocketClientService {
    private _connected = new SimpleEventDispatcher<void>();
    private _disconnected = new SimpleEventDispatcher<void>();
    private _pollChanged = new SimpleEventDispatcher<PollChangedData>();
    private _pollListChanged = new SimpleEventDispatcher<PollsChangedData>();

    get connected() { return this._connected.asEvent(); }
    get disconnected() { return this._disconnected.asEvent(); }
    get pollChanged() { return this._pollChanged.asEvent(); }
    get pollListChanged() { return this._pollListChanged.asEvent(); }

    constructor(private roomSocket: Socket) { }

    connect(): void {
        this.roomSocket.on(ClientEvents.connect, () => {
            this._connected.dispatch();
        });
        this.roomSocket.on(ClientEvents.disconnect, () => {
            this._disconnected.dispatch();
        });
        this.roomSocket.on(ClientEvents.pollChanged, (args: PollChangedData) => {
            this._pollChanged.dispatch(args);
        });
        this.roomSocket.on(ClientEvents.pollListChanged, (args: PollsChangedData) => {
            this._pollListChanged.dispatch(args);
        });
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
        [this._connected, this._disconnected, this._pollChanged, this._pollListChanged]
            .forEach(x => x.clear());
    }
}
