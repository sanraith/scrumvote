import Debug from 'debug';
import express, { Router } from 'express';
import { Inject } from 'typescript-ioc';
import * as util from 'util';
import { CancelVoteRequest, CancelVoteResponse, ClosePollResponse, CreatePollRequest, CreatePollResponse, CreateRoomResponse, DeletePollResponse, PollVoteRequest, PollVoteResponse as VotePollResponse, ReopenPollResponse, RoomInfoResponse } from '../../shared/roomResponses';
import UserInfo from '../models/userInfo';
import RoomService from '../services/roomService';
import UserService from '../services/userService';
import routerErrorHandler, { ErrorHandler } from './routerErrorHandler';
const debug = Debug('vote-scrum:routes:roomRouter');
const errorDebug = Debug('vote-scrum:routes:roomRouter:ERROR');
const DEBUG_SECRET = process.env.DEBUG_SECRET;

interface ParsedRequestParams {
    userInfo: UserInfo,
    roomId: string,
    pollId: string;
}

export default class RoomRouter {
    @Inject private roomService: RoomService;
    @Inject private userService: UserService;

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
        this.router.get("/debug/:secret", (req, res) => this.handler(req, res, p => {
            if (req.params['secret'] !== DEBUG_SECRET) {
                res.send('NONONO');
                return;
            }

            res.send(util.inspect(this.roomService._rooms, false, 6));
        }));

        this.router.post('/create', (req, res) => this.handler(req, res, p => {
            const name = req.body?.name ?? `${p.userInfo.name}'s room`;
            const room = this.roomService.createRoom(p.userInfo, name);
            if (!room) {
                res.json(<CreateRoomResponse>{ success: false, error: 'Room not found.' });
                return;
            }

            res.json(<CreateRoomResponse>{
                id: room.id,
                name: room.name,
                success: true
            });
        }));

        this.router.get('/:roomId/info', (req, res) => this.handler(req, res, p => {
            const room = this.roomService.getRoom(p.roomId);
            if (!room) {
                res.json(<RoomInfoResponse>{ success: false, error: 'Room not found.' });
                return;
            }

            res.json(<RoomInfoResponse>{
                success: true,
                room: {
                    id: room.id,
                    name: room.name,
                    owner: room.owner.publicInfo,
                    users: room.users.map(u => u.publicInfo)
                }
            });
        }));

        this.router.post('/:roomId/poll/create', (req, res) => this.handler(req, res, p => {
            const params: CreatePollRequest = req.body;
            const room = this.roomService.getRoom(p.roomId);
            if (!room) {
                res.json(<CreatePollResponse>{ success: false, error: 'Room not found.' });
                return;
            }
            const poll = this.roomService.createPoll(room, params.question);

            res.json(<CreatePollResponse>{
                id: poll.id,
                success: true
            });
        }));

        this.router.post('/:roomId/poll/:pollId/vote', (req, res) => this.handler(req, res, p => {
            const params: PollVoteRequest = req.body;
            const success = this.roomService.votePoll(p.roomId, p.pollId, p.userInfo, { comment: params.comment, value: params.value }); // TODO check for foreign object?
            res.json(<VotePollResponse>{
                success: success
            });
        }));

        this.router.post('/:roomId/poll/:pollId/cancelVote', (req, res) => this.handler(req, res, p => {
            const params: CancelVoteRequest = req.body;
            const success = this.roomService.cancelVote(p.roomId, p.pollId, p.userInfo, params.voteId);
            res.json(<CancelVoteResponse>{
                success: success
            });
        }));

        this.router.post('/:roomId/poll/:pollId/close', (req, res) => this.handler(req, res, p => {
            const success = this.roomService.closePoll(p.roomId, p.pollId, p.userInfo);
            res.json(<ClosePollResponse>{
                success: success
            });
        }));

        this.router.post('/:roomId/poll/:pollId/reopen', (req, res) => this.handler(req, res, p => {
            const success = this.roomService.reopenPoll(p.roomId, p.pollId, p.userInfo);
            res.json(<ReopenPollResponse>{
                success: success
            });
        }));

        this.router.post('/:roomId/poll/:pollId/delete', (req, res) => this.handler(req, res, p => {
            const success = this.roomService.deletePoll(p.roomId, p.pollId, p.userInfo);
            res.json(<DeletePollResponse>{
                success: success
            });
        }));
    }
}
