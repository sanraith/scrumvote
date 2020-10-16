import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import PublicRoomInfo from 'src/shared/model/publicRoomInfo';
import { RoomClientService } from '../services/room-client.service';
import { SocketClientService } from '../services/socket-client.service';
import { ClientUser, UserService } from '../services/user.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
    // instantly available
    roomId: string;
    roomAddress: string;
    user: ClientUser;
    newPollQuestion: string;
    isBusy: boolean;

    // delayed
    get isConnected(): boolean {
        return this.roomInfo !== null;
    }
    get isOwner(): boolean {
        return this.roomInfo && this.user.id === this.roomInfo.owner.id;
    }
    roomName: string = null;
    roomInfo: PublicRoomInfo = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private socketClient: SocketClientService,
        private userService: UserService,
        private roomClient: RoomClientService) { }

    ngOnInit(): void {
        this.user = this.userService.userData;
        this.roomId = this.route.snapshot.paramMap.get('id');
        this.roomAddress = window.location.href;
        this.roomClient.init(this.roomId);

        this.roomClient.getRoomInfoAsync().subscribe(x => this.roomInfo = x);

        this.socketClient.connect();
        this.socketClient.joinRoomAsync(this.roomId).subscribe(joinSuccess => {
            if (!joinSuccess) {
                this.router.navigate(['']);
            }
        });
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

    createNewPoll() {
        this.isBusy = true;
        this.roomClient.createPollAsync(this.newPollQuestion).subscribe(resp => {
            this.isBusy = false;
        });
    }
}
