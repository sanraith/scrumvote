import PublicPollInfo from './publicPollInfo';
import PublicUserInfo from './publicUserInfo';

export default interface PublicRoomInfo {
    id: string,
    name: string,
    owner: PublicUserInfo,
    users: PublicUserInfo[],
    polls: PublicPollInfo[]
}
