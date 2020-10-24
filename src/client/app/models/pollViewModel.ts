import Vote from 'src/shared/model/vote';

export default interface PollViewModel {
    isActive: boolean;
    isAlreadyVoted: boolean;
    id: string;
    question: string;
    votes: { name: string, vote: Vote }[]
}
