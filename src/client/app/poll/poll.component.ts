import { Component, Input, OnInit } from '@angular/core';
import PollViewModel from '../models/pollViewModel';
import { RoomClientService } from '../services/room-client.service';
import { UiHelperService } from '../services/ui-helper.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-poll',
    templateUrl: './poll.component.html',
    styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
    @Input() roomId: string;
    @Input() isOwner: boolean;
    @Input() poll: PollViewModel;

    isBusy: boolean = false;
    voteComment: string;
    get userName(): string { return this.userService.userData.name; }

    constructor(
        public uiHelper: UiHelperService,
        private roomClient: RoomClientService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.roomClient.init(this.roomId);
    }

    submit(): void {
        if (!this.voteComment || this.voteComment.length === 0) { return; }
        this.isBusy = true;
        this.roomClient.votePollAsync(this.poll.id, this.voteComment).subscribe(resp => {
            this.isBusy = false;
        });
    }

    closePoll(): void {
        this.isBusy = true;
        this.roomClient.closePollAsync(this.poll.id).subscribe(resp => {
            this.isBusy = false;
        });
    }

    deletePoll(): void {
        const shouldDelete = confirm(`Are you sure you want to delete the poll '${this.poll.question}'?`);
        if (shouldDelete) {
            this.isBusy = true;
            this.roomClient.deletePollAsync(this.poll.id).subscribe(resp => {
                this.isBusy = false;
            });
        }
    }
}
