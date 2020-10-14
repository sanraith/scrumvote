import Debug from 'debug';
import shortid from 'shortid';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
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

    leaveRoom(room: Room, player: UserInfo): void {
        const existingUserIndex = room.users.findIndex(x => player.id == x.id);
        if (existingUserIndex < 0) { return; }

        const leftPlayer = room.users.splice(existingUserIndex, 1)[0];
        if (room.users.length === 0) {
            // Delete room after some time if no players rejoin
            // TODO refine this to cancel timeout after someone rejoins
            // setTimeout(() => {
            //     if (room.users.length === 0) { this.deleteRoom(room); }
            // }, 60000);
        }

        // TODO emit users changed
        // socketManager.emitPlayersChanged(room);

        debug(`Client ${leftPlayer.name} left room ${room.id}`);
    }


    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}

export default RoomService;
