import express from 'express';
import RandomNumberResponse from 'src/shared/randomNumberResponse';

function getRandomInt(minInclusive: number, maxExclusive: number) {
    return Math.floor(Math.random() * Math.floor(maxExclusive - minInclusive)) + minInclusive;
}

const randomRouter = express.Router();
randomRouter.get('/dice', (req, res) => {
    res.json(<RandomNumberResponse>{
        number: getRandomInt(1, 6)
    });
});

export default randomRouter;
