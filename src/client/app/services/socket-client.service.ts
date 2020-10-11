import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ClientActions, EmitResponse } from 'src/shared/socket';

@Injectable({
    providedIn: 'root'
})
export class SocketClientService {
    constructor(private roomSocket: Socket) { }

    connect(): void {
        this.roomSocket.connect();
    }

    disconnect(): void {
        this.roomSocket.emit(ClientActions.leaveRooms, null, (resp: EmitResponse) => { });
        this.roomSocket.removeAllListeners();
        this.roomSocket.disconnect();
    }
}
