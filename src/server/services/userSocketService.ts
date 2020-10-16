import SocketIo from 'socket.io';
import { Inject } from 'typescript-ioc';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import RoomService from './roomService';
import Debug from 'debug';
import { JoinRoomData } from '../../shared/socket';
const debug = Debug("vote-scrum:services:userSocket");

export default class UserSocketService {
    @Inject private roomService: RoomService;

    userInfo: UserInfo;
    room?: Room;
    socket: SocketIo.Socket;

    constructor(user: UserInfo, socket: SocketIo.Socket) {
        this.userInfo = user;
        this.socket = socket;
    }

    joinRoom(data: JoinRoomData) {
        const room = this.roomService.getRoom(data.roomId);
        if (!room) { return { success: false }; }

        this.room = room;
        this.socket.join(this.getRoomChannelId(this.room.id));
        this.roomService.joinRoom(room, this.userInfo);
        return { name: this.room.name, success: true };
    }

    leaveCurrentRoom() {
        if (this.room) {
            debug(`Client ${this.userInfo.name} left room ${this.room.id}.`);
            this.roomService.leaveRoom(this.room, this.userInfo);
            return { success: true };
        } else {
            debug(`Client ${this.userInfo.name} tried to leave room, but is not part of any room!`);
            return { success: false };
        }
    }

    getRoomChannelId(roomId: string) {
        return `room_${roomId}`;
    }
}
