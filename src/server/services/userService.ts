import { Singleton } from 'typescript-ioc';
import UserInfo from '../models/userInfo';

export interface UserCookies {
    "vote-scrum.user.id": string;
    "vote-scrum.user.secret": string;
    "vote-scrum.user.name": string;
}

@Singleton
export default class UserService {
    getUserByPrivateId(id: string) {
        return this.users[id];
    }

    getUserFromCookies(cookies: UserCookies): UserInfo {
        const userInfo = this.createUserFrom(cookies);
        let existingUser = this.users[userInfo.id];
        if (existingUser) {
            userInfo.copyTo(existingUser);
        } else {
            this.users[userInfo.id] = userInfo;
            existingUser = userInfo;
        }

        return existingUser;
    }

    isCookiesContainUserInfo(cookie: UserCookies): boolean {
        const user = this.createUserFrom(cookie);
        return Object.keys(user).every((k => user[<keyof UserInfo>k]));
    }

    /**
     * Generates an instance based on a cookie object containing the following properties:
     * "vote-scrum.user.name" => name;
     * "vote-scrum.user.id" => public id;
     * "vote-scrum.user.secret" => private id;
     * @param cookies The cookie containing the user data.
     */
    private createUserFrom(cookies: UserCookies) {
        return new UserInfo(cookies["vote-scrum.user.name"], cookies["vote-scrum.user.id"], cookies["vote-scrum.user.secret"]);
    }

    private readonly users: { [key: string]: UserInfo } = {};
}
