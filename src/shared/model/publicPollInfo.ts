import PublicUserInfo from './publicUserInfo';
import Vote from './vote';

export default interface PublicPollInfo {
    id: string,
    question: string;
    votes: { id: string, user: PublicUserInfo, vote: Vote; }[],
    isActive: boolean;
}
