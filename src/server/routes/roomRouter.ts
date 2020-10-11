import express from 'express';
import Debug from 'debug';
import { CreateRoomResponse } from 'src/shared/roomResponses';
import roomService from '../services/roomService';
import userService from '../services/userManager';
import routerErrorHandler from './routerErrorHandler';

const errorDebug = Debug('vote-scrum:routes:room:ERROR');
const errorHandler = routerErrorHandler(errorDebug);
const roomRouter = express.Router();

roomRouter.post('/create', (req, res) => {
    errorHandler(res, () => {
        const owner = userService.getUserFromCookies(req.cookies);
        const name = req.body?.name ?? `${owner.name}'s room`;
        const room = roomService.createRoom(owner, name);

        res.json(<CreateRoomResponse>{
            id: room.id,
            name: room.name,
            success: true
        });
    });
});

export default roomRouter;
