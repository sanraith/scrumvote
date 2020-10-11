import express from 'express';
import { CreateRoomResponse } from 'src/shared/roomResponses';

const roomRouter = express.Router();

roomRouter.post('/create', (req, res) => {
    const name = req.body?.name ?? "Room";
    res.json(<CreateRoomResponse>{
        id: "1234",
        name: name,
        success: true
    });
});

export default roomRouter;
