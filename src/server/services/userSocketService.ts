import SocketIo from 'socket.io';
import { Inject } from 'typescript-ioc';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import RoomService from './roomService';
import Debug from 'debug';
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
}
