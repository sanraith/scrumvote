import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import userManager, { UserCookies } from './userManager';
import { EmitResponse } from 'src/shared/socket';
import UserInfo from '../models/userInfo';
import shortid from 'shortid';
import UserSocket from './userSocket';

const debug = Debug('vote-scrum:services:socketManager');
const errorDebug = Debug('vote-scrum:services:socketManager:ERROR');
type ErrorHandler = (action: () => void) => void;

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
}

class SocketService {
    init(httpServer: HttpServer) {
        const io = SocketIo(httpServer, { perMessageDeflate: false });
        io.on(SocketEvents.connection, (socket) => {
            const userInfo = this.getUserFromSocketCookies(socket.handshake.headers.cookie);
            if (userInfo === undefined) {
                debug(`Disconnected client, no user data: ${socket.client.id}`)
                socket.disconnect();
                return;
            }

            // Save user socket
            if (!this.userSockets[userInfo.id]) { this.userSockets[userInfo.id] = []; }
            const userSockets = this.userSockets[userInfo.id];
            const userSocket = new UserSocket(userInfo, socket);
            userSockets.push(userSocket);
            debug(`Client ${userInfo.name} #${userSockets.length - 1} connected: ${socket.client.id}`);

            const errorHandler: ErrorHandler = action => this.handleUserSocketError(userSocket, action);

            socket.on(SocketEvents.disconnect, () => {
                errorHandler(() => { this.handleDisconnect(userInfo, socket, userSocket); })
            });
        });

        this.io = io;
    }

    private handleDisconnect(userInfo: UserInfo, socket: SocketIo.Socket, userSocket: UserSocket) {
        if (!this.userSockets[userInfo.id]) {
            debug(`Disconnecting ${socket.id}, but cannot find any saved sockets for user ${userInfo.name}!`);
        }

        const userSockets = this.userSockets[userInfo.id];
        const index = userSockets.indexOf(userSocket);
        if (index < 0) {
            debug(`Disconnecting ${socket.id}, but cannot find saved socket for user ${userInfo.name}!`);
        }

        userSocket.socket.removeAllListeners();
        userSockets.splice(index, 1);
        if (userSockets.length === 0) {
            // TODO userSocket.markUserAsDisconnected();
            // TODO userSocket.leaveRoom();
            delete this.userSockets[userInfo.id];
        }
        debug(`Disconnecting user ${userInfo.name} socket ${socket.client.id}. ${userSockets.length} connections remain.`);
    }

    private handleUserSocketError(userSocket: UserSocket, action: () => void) {
        try {
            action();
        } catch (error) {
            const errorId = `err_${shortid()}`;
            errorDebug(`${errorId}:`, error);
            // TODO handle room and all room members in case of an error
            this.disconnectAllSocketsFor(userSocket.userInfo);
            errorDebug(`${errorId} cleanup finished.`);
        }
    }

    private disconnectAllSocketsFor(user: UserInfo) {
        const sockets = this.userSockets[user.id];
        for (let socket of sockets ?? []) {
            // TODO socket.markUserAsDisconnected();
            socket.socket.disconnect();
            socket.socket.removeAllListeners();
        }
        delete this.userSockets[user.id];
    }

    private getUserFromSocketCookies(cookies: any): UserInfo | undefined {
        if (!cookies) { return undefined; }
        const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(cookies);
        if (!userManager.isCookiesContainUserInfo(userCookies)) { return undefined; }

        return userManager.getUserFromCookies(userCookies);
    }

    private callbackMaybe(value: EmitResponse, callback: ((resp: EmitResponse) => void) | undefined) {
        if (callback) {
            callback(value);
        }
    }

    private io!: Server;
    private userSockets: Record<string, UserSocket[]> = {};
}

export default new SocketService();
