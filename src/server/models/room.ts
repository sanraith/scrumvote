import Poll from './poll';
import UserInfo from './userInfo';

export default interface Room {
    id: string,
    name: string,
    owner: UserInfo
    users: UserInfo[],
    polls: Map<string, Poll>
}
