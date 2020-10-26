import SocketIo, { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import Debug from 'debug';
import UserService, { UserCookies } from './userService';
import { ClientActions, ClientEvents, EmitResponse, JoinRoomData, PollChangedData, PollsChangedData } from '../../shared/socket';
import UserInfo from '../models/userInfo';
import shortid from 'shortid';
import UserSocketService from './userSocketService';
import { Container, Inject, OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import Room from '../models/room';
import Poll from '../models/poll';
import PublicPollInfo from 'src/shared/model/publicPollInfo';

const debug = Debug('vote-scrum:services:socketManager');
const errorDebug = Debug('vote-scrum:services:socketManager:ERROR');
type ErrorHandler = (action: () => void) => void;

enum SocketEvents {
    connection = "connection",
    disconnect = "disconnect",
}

@Singleton
@OnlyInstantiableByContainer
export default class SocketManagerService {
    @Inject
    private userService: UserService;

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
            const userSocket = Container.get(UserSocketService).init(userInfo, socket);
            userSockets.push(userSocket);
            debug(`Client ${userInfo.name} #${userSockets.length - 1} connected: ${socket.client.id}`);

            const errorHandler: ErrorHandler = action => this.handleUserSocketError(userSocket, action);

            socket.on(SocketEvents.disconnect, () => {
                errorHandler(() => { this.handleDisconnect(userInfo, socket, userSocket); })
            });

            socket.on(ClientActions.joinRoom, (data: JoinRoomData, callback?: (resp: EmitResponse) => void) => {
                errorHandler(() => this.callbackMaybe(userSocket.joinRoom(data), callback));
            });

            socket.on(ClientActions.leaveRoom, (data: object, callback?: (resp: EmitResponse) => void) => {
                errorHandler(() => this.callbackMaybe(userSocket.leaveCurrentRoom(), callback));
            });
        });

        this.io = io;
    }

    emitPollsChanged(room: Room, targetUsers?: UserInfo[]) {
        const recipients = targetUsers ?? room.users;
        for (const targetUser of recipients) {
            const targetSockets = this.getUserSocketsForRoom(targetUser, room);
            if (!targetSockets?.length) { debug(`Cannot reach player ${targetUser.name}`); continue; }

            for (const targetSocket of targetSockets) {
                const emittedData = <PollsChangedData>{
                    polls: Array.from(room.polls.values()).reverse().map(p => this.convertPollToPublicPollInfo(p, targetUser))
                };
                targetSocket.socket.emit(ClientEvents.pollListChanged, emittedData);
            }
        }
    }

    emitPollChanged(room: Room, poll: Poll, targetUsers?: UserInfo[]) {
        const recipients = targetUsers ?? room.users;
        for (const targetUser of recipients) {
            const targetSockets = this.getUserSocketsForRoom(targetUser, room);
            if (!targetSockets?.length) { debug(`Cannot reach player ${targetUser.name}`); continue; }

            for (const targetSocket of targetSockets) {
                const emittedData = <PollChangedData>{
                    poll: this.convertPollToPublicPollInfo(poll, targetUser)
                };
                targetSocket.socket.emit(ClientEvents.pollChanged, emittedData);
            }
        }
    }

    private convertPollToPublicPollInfo(poll: Poll, targetUser: UserInfo): PublicPollInfo {
        return {
            id: poll.id,
            question: poll.question,
            votes: poll.votes.map(v => ({
                user: v.user.publicInfo,
                vote: (!poll.isActive /*|| v.user === targetUser*/) ? v.vote : null // uncomment to show own vote while the poll is open
            })),
            isActive: poll.isActive
        }
    }

    private handleDisconnect(userInfo: UserInfo, socket: SocketIo.Socket, userSocket: UserSocketService) {
        this.disconnectSocket(userSocket);
        const remainingSocketCount = this.userSockets[userInfo.id]?.length ?? 0;
        debug(`Disconnecting user ${userInfo.name} socket ${socket.client.id}. ${remainingSocketCount} connections remain.`);
    }

    private handleUserSocketError(userSocket: UserSocketService, action: () => void) {
        try {
            action();
        } catch (error) {
            const errorId = `err_${shortid()}`;
            errorDebug(`${errorId}:`, error);
            // TODO handle room and all room members in case of an error
            this.disconnectAllSocketsInRoom(userSocket);
            errorDebug(`${errorId} cleanup finished.`);
        }
    }

    private disconnectAllSocketsInRoom(userSocket: UserSocketService) {
        const userRoomSockets = this.getUserSocketsForRoom(userSocket.userInfo, userSocket.room);
        for (let socket of userRoomSockets ?? []) {
            this.disconnectSocket(socket);
        }
    }

    private disconnectSocket(userSocket: UserSocketService): void {
        const userInfo = userSocket.userInfo;
        const userSockets = this.userSockets[userInfo.id];
        const index = userSockets.indexOf(userSocket);
        if (index < 0) {
            debug(`Disconnecting ${userSocket.socket.id}, but cannot find saved socket for user ${userInfo.name}!`);
            return;
        }
        userSockets.splice(index, 1);
        if (userSockets.length === 0) {
            delete this.userSockets[userInfo.id];
        }
        userSocket.socket.disconnect();
        userSocket.socket.removeAllListeners();

        const roomOfSocket = userSocket.room;
        if (roomOfSocket && this.getUserSocketsForRoom(userInfo, roomOfSocket).length === 0) {
            userSocket.leaveCurrentRoom();
            debug(`Removed user ${userInfo.name} from room ${roomOfSocket.id} due to disconnect.`);
        }
    }

    private getUserSocketsForRoom(userInfo: UserInfo, room: Room): UserSocketService[] {
        return this.userSockets[userInfo.id]?.filter(x => x.room === room) ?? [];
    }

    private getUserFromSocketCookies(cookies: any): UserInfo | undefined {
        if (!cookies) { return undefined; }
        const userCookies = <{ [P in keyof UserCookies]: UserCookies[P] }>cookie.parse(cookies);
        if (!this.userService.isCookiesContainUserInfo(userCookies)) { return undefined; }

        return this.userService.getUserFromCookies(userCookies);
    }

    private callbackMaybe(value: EmitResponse, callback: ((resp: EmitResponse) => void) | undefined) {
        if (callback) {
            callback(value);
        }
    }

    private io!: Server;
    private userSockets: Record<string, UserSocketService[]> = {};
}
