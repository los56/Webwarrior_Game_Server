import express, {Request, Response} from 'express';
import { createServer } from 'http'
import { Server } from 'socket.io';
import GameManager from './GameManager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

app.get('/client', (req: Request, res: Response) => {res.sendFile(`${__dirname}/test.html`)});

let gameManager: GameManager;
io.on("connection", (socket) => {
    console.log('user connected');
    gameManager = new GameManager(socket);

    socket.on('init', (args) => {
        console.log(JSON.parse(args).token);
    });
}); 

httpServer.listen(2222, () => {
    console.log('opened');
});