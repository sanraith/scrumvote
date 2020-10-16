import express, { Router } from 'express';
import Debug from 'debug';
import { CreateRoomResponse, CreatePollRequest, PollVoteRequest, CreatePollResponse } from '../../shared/roomResponses';
import routerErrorHandler, { ErrorHandler } from './routerErrorHandler';
import { Inject } from 'typescript-ioc';
import RoomService from '../services/roomService';
import UserService from '../services/userService';
import UserInfo from '../models/userInfo';
import PublicRoomInfo from 'src/shared/model/publicRoomInfo';
const debug = Debug('vote-scrum:routes:roomRouter');
const errorDebug = Debug('vote-scrum:routes:roomRouter:ERROR');

interface ParsedRequestParams {
    userInfo: UserInfo,
    roomId: string,
    pollId: string
}

export default class RoomRouter {
    @Inject private roomService: RoomService;
    @Inject private userService: UserService

    router: Router;

    private errorHandler: ErrorHandler;

    constructor() {
        this.router = express.Router();
        this.errorHandler = routerErrorHandler(errorDebug);
        this.init();
    }

    private handler(req: express.Request, res: express.Response, action: (prp: ParsedRequestParams) => void) {
        this.errorHandler(res, () => action({
            userInfo: this.userService.getUserFromCookies(req.cookies),
            roomId: req.params["roomId"],
            pollId: req.params["pollId"]
        }));
    }

    private init() {
        this.router.post('/create', (req, res) => this.handler(req, res, p => {
            const name = req.body?.name ?? `${p.userInfo.name}'s room`;
            const room = this.roomService.createRoom(p.userInfo, name);

            res.json(<CreateRoomResponse>{
                id: room.id,
                name: room.name,
                success: true
            });
        }));

        this.router.get('/:roomId/info', (req, res) => this.handler(req, res, p => {
            const room = this.roomService.getRoom(p.roomId);
            res.json(<PublicRoomInfo>{
                id: room.id,
                name: room.name,
                owner: room.owner.publicInfo,
                users: room.users.map(u => u.publicInfo)
            });
        }));

        this.router.post('/:roomId/poll/create', (req, res) => this.handler(req, res, p => {
            const params: CreatePollRequest = req.body;
            const room = this.roomService.getRoom(p.roomId);
            const poll = this.roomService.createPoll(room, params.question);

            res.json(<CreatePollResponse>{
                id: poll.id,
                success: true
            });
        }));

        this.router.post('/:roomId/poll/:pollId/vote', (req, res) => this.handler(req, res, p => {
            const params: PollVoteRequest = req.body;
            debug(params);

            // TODO implement
        }));

        this.router.post('/:roomId/poll/:pollId/close', (req, res) => this.handler(req, res, p => {

            // TODO implement
        }));
    }
}
