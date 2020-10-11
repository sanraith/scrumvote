import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '../services/socket-client.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
    // instantly available
    roomId: string;
    roomAddress: string;

    // delayed
    roomName: string;

    constructor(private route: ActivatedRoute, private socketClient: SocketClientService) { }

    ngOnInit(): void {
        this.roomId = this.route.snapshot.paramMap.get('id');
        this.roomAddress = window.location.href;
        this.socketClient.connect();

    }

    ngOnDestroy(): void {
        this.socketClient.disconnect();
    }

    copyRoomAddressToClipboard(input: HTMLInputElement, button: HTMLButtonElement) {
        input.select();
        document.execCommand('copy');
        const previousButtonText = button.innerHTML;
        button.innerHTML = "Copied!";
        setTimeout(() => { button.innerHTML = previousButtonText; }, 2000);
    }
}
