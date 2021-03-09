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

    isAverageVisible: boolean = false;
    get average(): string {
        if (this.poll.isActive) { return 'Poll is still ongoing!'; }

        const numbers = this.poll.votes
            .map(x => this.parseVoteAsNumber(x.vote.comment));

        const invalidVotes = numbers
            .map((x, i) => ({ isValid: !isNaN(x), vote: this.poll.votes[i].vote.comment }))
            .filter(x => !x.isValid)
            .map(x => x.vote);

        if (invalidVotes.length > 0) {
            return `Could not parse these votes as numbers: ${invalidVotes.join(', ')}`;
        }

        const average = numbers.reduce((a, x) => a + x, 0) / numbers.length;
        return `Average(${numbers.join(', ')}) = ${average}`;
    }

    constructor(
        public uiHelper: UiHelperService,
        public userService: UserService,
        private roomClient: RoomClientService
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

    cancelVote(voteId: string): void {
        this.isBusy = true;
        this.roomClient.cancelVoteAsync(this.poll.id, voteId).subscribe(resp => {
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

    showHideAverage(): void {
        this.isAverageVisible = !this.isAverageVisible;
    }

    private parseVoteAsNumber(vote: string): number {
        let result = new Number(vote).valueOf();
        if (isNaN(result)) {
            vote = vote.replace(/\,/g, '.').replace(/\D/g, '');
            if (vote === '') {
                result = NaN;
            } else {
                result = new Number(vote).valueOf();
            }
        }

        return result;
    }
}
