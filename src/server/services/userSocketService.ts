import SocketIo from 'socket.io';
import { Factory, Inject, ObjectFactory, OnlyInstantiableByContainer, Scope } from 'typescript-ioc';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import RoomService from './roomService';
import Debug from 'debug';
import { JoinRoomData } from '../../shared/socket';
import SocketManagerService from './socketManagerService';
const debug = Debug("vote-scrum:services:userSocket");

const userSocketFactory: ObjectFactory = context => new UserSocketService(context.resolve(RoomService), context.resolve(SocketManagerService));

@Factory(userSocketFactory)
export default class UserSocketService {
    userInfo: UserInfo;
    room?: Room;
    socket: SocketIo.Socket;

    constructor(@Inject private roomService: RoomService, @Inject private socketManager: SocketManagerService) { }

    init(user: UserInfo, socket: SocketIo.Socket): UserSocketService {
        this.userInfo = user;
        this.socket = socket;
        return this;
    }

    joinRoom(data: JoinRoomData) {
        const room = this.roomService.getRoom(data.roomId);
        if (!room) { return { success: false }; }

        this.room = room;
        this.socket.join(this.getRoomChannelId(this.room.id));
        this.roomService.joinRoom(room, this.userInfo);
        this.socketManager.emitPollsChanged(room, [this.userInfo]);

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
