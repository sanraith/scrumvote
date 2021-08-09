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

    _isAverageVisible?: boolean = null;
    get isAverageVisible(): boolean { return this._isAverageVisible ?? this.average.isValid; }
    set isAverageVisible(value: boolean) { this._isAverageVisible = value; };

    get average(): { display?: string, error?: string, isValid: boolean; } {
        if (this.poll.isActive) { return { error: 'Poll is still ongoing!', isValid: false }; }
        if (this.poll.votes.length === 0) { return { error: 'No votes registered!', isValid: false }; }

        const result = { isValid: true, error: undefined, display: undefined };
        let numbers: number[] = [];
        let hadParsingError = false;

        try {
            numbers = this.poll.votes
                .map(x => this.parseVoteAsNumber(x.vote.comment));
        } catch (error) {
            console.warn(`Error parsing numbers.`);
            console.warn(error);
            hadParsingError = true;
        }

        const invalidVotes = numbers
            .map((x, i) => ({ isValid: !isNaN(x), vote: this.poll.votes[i].vote.comment }))
            .filter(x => !x.isValid)
            .map(x => x.vote);

        if (invalidVotes.length > 0) {
            result.isValid = false;
            result.error = `Could not parse these votes as numbers: ${invalidVotes.join(', ')}`;
        }

        const validNumbers = numbers.filter(x => !isNaN(x));
        if (validNumbers.length > 0) {
            const average = validNumbers.reduce((a, x) => a + x, 0) / validNumbers.length;
            result.display = `Average(${validNumbers.join(', ')}) = ${average}`;
        } else {
            result.display = 'Cannot calculate average.';
        }

        if (hadParsingError) {
            result.isValid = false;
            result.error = "Could not parse numbers, you may be using an incompatible browser.";
        }

        return result;
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

    reopenPoll(): void {
        this.isBusy = true;
        this.roomClient.reopenPollAsync(this.poll.id).subscribe(resp => {
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
        // Matches the last number (e.g. 15 1,5 1.5 .5) in a line.
        // Not using lookbehind for Safari compatibility.
        const regex = new RegExp('(?:\\d+(?:[\\.\\,]?\\d+)?|(?:^|[^\\S\\r\\n])\\.\\d+)(?!.*\\d)', 'g');
        const [numberStr] = regex.exec(vote) ?? [];
        if (!numberStr) { return NaN; }

        const number = new Number(numberStr.replace(/\,/g, '.')).valueOf();
        return number;
    }
}
