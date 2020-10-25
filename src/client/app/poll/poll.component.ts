import { Component, Input, OnInit } from '@angular/core';
import PollViewModel from '../models/pollViewModel';
import { RoomClientService } from '../services/room-client.service';
import { UiHelperService } from '../services/ui-helper.service';

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

    constructor(
        public uiHelper: UiHelperService,
        private roomClient: RoomClientService) { }

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
}
