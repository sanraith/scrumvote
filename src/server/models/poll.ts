import UserInfo from './userInfo';
import Vote from './vote';

export default interface Poll {
    id: string,
    question: string;
    votes: { user: UserInfo, vote: Vote }[],
    isActive: boolean
}
