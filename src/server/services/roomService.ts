import Debug from 'debug';
import shortid from 'shortid';
import { Inject, OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import Poll from '../models/poll';
import Room from '../models/room';
import UserInfo from '../models/userInfo';
import Vote from '../../shared/model/vote';
import SocketManagerService from './socketManagerService';
const debug = Debug("vote-scrum:services:roomManager");

@Singleton
@OnlyInstantiableByContainer
export default class RoomService {
    constructor(@Inject private socketManager: SocketManagerService) { }

    getRoom(id: string): Room | undefined {
        return this._rooms[id];
    }

    createRoom(owner: UserInfo, name: string): Room {
        const newRoom: Room = {
            id: this._roomIdGenerator.generate(),
            name: name,
            owner: owner,
            users: [],
            polls: new Map()
        };
        this._rooms[newRoom.id] = newRoom;

        debug(`Created: ${newRoom.id} for ${owner.name}`);
        return newRoom;
    }

    joinRoom(room: Room, user: UserInfo) {
        const existingUserIndex = room.users.findIndex(x => user.id == x.id);
        if (existingUserIndex > -1) { return; }

        room.users.push(user);
        debug(`User ${user.name} joined room ${room.id}.`);
        //TODO emit users changed
    }

    leaveRoom(room: Room, user: UserInfo): void {
        const existingUserIndex = room.users.findIndex(x => user.id == x.id);
        if (existingUserIndex < 0) { return; }

        const leftPlayer = room.users.splice(existingUserIndex, 1)[0];
        if (room.users.length === 0) {
            // Delete room after some time if no users rejoin
            // TODO refine this to cancel timeout after someone rejoins
            // setTimeout(() => {
            //     if (room.users.length === 0) { this.deleteRoom(room); }
            // }, 60000);
        }

        // TODO emit users changed
        // socketManager.emitPlayersChanged(room);

        debug(`Client ${leftPlayer.name} left room ${room.id}`);
    }

    createPoll(room: Room, question: string): Poll {
        const poll: Poll = {
            id: this._pollIdGenerator.generate(),
            isActive: true,
            question: question,
            votes: []
        };
        room.polls.set(poll.id, poll);

        this.socketManager.emitPollsChanged(room);

        return poll;
    }

    votePoll(roomId: string, pollId: string, userInfo: UserInfo, vote: Vote): void {
        const room = this.getRoom(roomId);
        const poll = room.polls.get(pollId);
        const isVotedAlready = poll.votes.filter(x => x.user === userInfo).length > 0;

        if (!isVotedAlready) {
            poll.votes.push({ user: userInfo, vote: vote });
            this.socketManager.emitPollChanged(room, poll);
        }
    }

    closePoll(roomId: string, pollId: string, userInfo: UserInfo) {
        const room = this.getRoom(roomId);
        const poll = room.polls.get(pollId);
        if (poll.isActive) {
            poll.isActive = false;
            this.socketManager.emitPollChanged(room, poll);
        }
    }

    _pollIdGenerator: { generate(): string } = shortid;
    _roomIdGenerator: { generate(): string } = shortid;
    private _rooms: { [id: string]: Room } = {};
}
