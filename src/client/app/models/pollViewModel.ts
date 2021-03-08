import Vote from 'src/shared/model/vote';

export default interface PollViewModel {
    isActive: boolean;
    isAlreadyVoted: boolean;
    id: string;
    question: string;
    votes: { id: string, name: string, userId: string, vote: Vote; }[];
}
