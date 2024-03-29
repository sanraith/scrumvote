import UserInfo from './userInfo';
import Vote from '../../shared/model/vote';

export default interface Poll {
    id: string,
    question: string;
    votes: { id: string, user: UserInfo, vote: Vote; }[],
    isActive: boolean;
}
