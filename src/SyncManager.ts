import { Socket } from "socket.io";
import GameManager, { TurnEnum } from "./GameManager";
import { Unit, UnitStats } from "./Units";

export interface SyncPayload {
    turn: TurnEnum;
    turnCount: number;

    warrior: UnitStats;
    enemies: UnitStats[];
}

export default class SyncManager {
    socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    doSync(gameManger: GameManager) {
        const payload: SyncPayload = {
            turn: gameManger.turn,
            turnCount: gameManger.turnCount,
            warrior: gameManger.warrior.toObject(),
            enemies: gameManger.enemies.map(v => v.toObject())
        }

        this.socket.emit('WWSync', payload);
    }
}