import express, { Router } from 'express';
import Debug from 'debug';
import { CreateRoomResponse } from 'src/shared/roomResponses';
import routerErrorHandler, { ErrorHandler } from './routerErrorHandler';
import { Inject } from 'typescript-ioc';
import RoomService from '../services/roomService';
import UserService from '../services/userService';
const errorDebug = Debug('vote-scrum:routes:room:ERROR');

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

    private init() {
        this.router.post('/create', (req, res) => {
            this.errorHandler(res, () => {
                const owner = this.userService.getUserFromCookies(req.cookies);
                const name = req.body?.name ?? `${owner.name}'s room`;
                const room = this.roomService.createRoom(owner, name);

                res.json(<CreateRoomResponse>{
                    id: room.id,
                    name: room.name,
                    success: true
                });
            });
        });
    }

}
