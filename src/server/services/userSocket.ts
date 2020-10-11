import SocketIo from 'socket.io';
import Room from '../models/room';
import UserInfo from '../models/userInfo';

export default class UserSocket {
    userInfo: UserInfo;
    room?: Room;
    socket: SocketIo.Socket;

    constructor(user: UserInfo, socket: SocketIo.Socket) {
        this.userInfo = user;
        this.socket = socket;
    }
}
