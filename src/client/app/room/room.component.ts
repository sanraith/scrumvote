import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import PublicPollInfo from 'src/shared/model/publicPollInfo';
import PublicRoomInfo from 'src/shared/model/publicRoomInfo';
import PublicUserInfo from 'src/shared/model/publicUserInfo';
import { PollChangedData, PollsChangedData, UsersChangedData } from 'src/shared/socket';
import PollViewModel from '../models/pollViewModel';
import { RoomClientService } from '../services/room-client.service';
import { SocketClientService } from '../services/socket-client.service';
import { UiHelperService } from '../services/ui-helper.service';
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
    get roomName(): string {
        return this.roomInfo?.name ?? 'Unknown room';
    }
    get userNames(): string[] {
        return this.users.map(x => x.name).sort((a, b) => a.localeCompare(b));
    }
    roomInfo: PublicRoomInfo = null;
    pollModels: PollViewModel[] = [];
    users: PublicUserInfo[] = [];

    private previousTitles: string[] = [];

    constructor(
        public uiHelper: UiHelperService,
        private router: Router,
        private route: ActivatedRoute,
        private socketClient: SocketClientService,
        private userService: UserService,
        private roomClient: RoomClientService,
        private titleService: Title
    ) { }

    ngOnInit(): void {
        this.previousTitles.push(this.titleService.getTitle());
        this.user = this.userService.userData;
        this.roomId = this.route.snapshot.paramMap.get('id');
        this.roomAddress = window.location.href;
        this.roomClient.init(this.roomId);

        this.socketClient.disconnected.subscribe(() => console.log('Socket disconnected.'));
        this.socketClient.connected.subscribe(() => {
            console.log('Socket connected.');
            this.roomClient.getRoomInfoAsync().subscribe(resp => {
                if (resp.success) {
                    this.roomInfo = resp.room;
                    this.titleService.setTitle(`scrum-vote | ${this.roomInfo.name}`);
                }
            });
            this.socketClient.joinRoomAsync(this.roomId).subscribe(joinSuccess => {
                if (!joinSuccess) {
                    console.log('Room does not exist anymore, redirecting to home.');
                    this.router.navigate(['']);
                }
            });
        });
        this.socketClient.pollChanged.subscribe(args => this.handlePollChanged(args));
        this.socketClient.pollListChanged.subscribe(args => this.handlePollListChanged(args));
        this.socketClient.usersChanged.subscribe(args => this.handleUsersChanged(args));
        this.socketClient.connect();
    }

    copyPollData(source: PublicPollInfo, target: PollViewModel) {
        target.id = source.id;
        target.question = source.question;
        target.isActive = source.isActive;
        target.votes = source.votes.map(x => ({
            id: x.id,
            name: x.user.name,
            userId: x.user.id,
            vote: x.vote
        }));
        target.isAlreadyVoted = source.votes.find(x => x.user.id === this.user.id) !== undefined;
    }

    handlePollListChanged(args: PollsChangedData): void {
        this.pollModels.splice(0, this.pollModels.length);
        args.polls.forEach(x => {
            const newPoll = <PollViewModel>{};
            this.pollModels.push(newPoll);
            this.copyPollData(x, newPoll);
        });
    }

    handlePollChanged(args: PollChangedData): void {
        const existingPoll = this.pollModels.filter(x => x.id === args.poll.id)[0];
        if (existingPoll) {
            this.copyPollData(args.poll, existingPoll);
        } else {
            console.log("Error: Update for not existing poll!");
            console.log(args.poll);
        }
    }

    handleUsersChanged(args: UsersChangedData) {
        this.users = args.users;
    }

    ngOnDestroy(): void {
        this.socketClient.disconnect();
        this.titleService.setTitle(this.previousTitles.pop());
    }

    copyRoomAddressToClipboard(input: HTMLInputElement, button: HTMLButtonElement) {
        input.select();
        document.execCommand('copy');
        const previousButtonText = button.innerHTML;
        button.innerHTML = "Copied!";
        setTimeout(() => { button.innerHTML = previousButtonText; }, 2000);
    }

    createNewPoll() {
        if (!this.newPollQuestion || this.newPollQuestion.length === 0) { return; }
        this.isBusy = true;
        this.roomClient.createPollAsync(this.newPollQuestion).subscribe(resp => {
            this.isBusy = false;
        });
        this.newPollQuestion = '';
    }
}
