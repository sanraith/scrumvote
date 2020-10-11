import Debug from 'debug';
import { generate as shortid } from 'shortid';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import routerErrorHandler from '../routes/routerErrorHandler';

const debug = Debug("vote-scrum:services:roomManager");

class RoomService {
    createRoom(owner: UserInfo, name: string): Room {
        const newRoom: Room = {
            id: this._roomIdGenerator.generate(),
            name: name,
            owner: owner,
            users: []
        };
        this._rooms[newRoom.id] = newRoom;

        debug(`Created: ${newRoom.id} for ${owner.name}`);
        return newRoom;
    }

    _roomIdGenerator: { generate(): string } = { generate() { return shortid(); } };
    private _rooms: { [id: string]: Room } = {};
}

export default new RoomService();
