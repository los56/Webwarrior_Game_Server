import { Socket } from "socket.io";
import EventManager from "./EventManager";
import { AttackEvent, EventType, WWEvent } from "./Events";
import GameMath from "./GameMath";
import { AttackType, EnemyUnit, Unit } from "./Units";
import SyncManager from "./SyncManager";

export enum TurnEnum {
    Player,
    Enemy
}

export default class GameManager {
    eventManager: EventManager;
    syncManager: SyncManager;

    socket: Socket;
    
    warrior: Unit;
    enemies: Unit[] = [];

    turn: TurnEnum = TurnEnum.Player;
    turnCount: number = 1;
    //isWaitActions: boolean;

    enemyCount = 3;

    constructor(socket: Socket) {
        this.socket = socket;

        this.eventManager = new EventManager(this);
        this.eventManager.gameManager = this;

        this.syncManager = new SyncManager(socket);

        this.warrior = new Unit(this);
        this.warrior.atk = 10;

        for(let i = 0;i < this.enemyCount;i++) {
            this.enemies[i] = new EnemyUnit(this);
            this.enemies[i].index = i;
        }

        this.syncManager.doSync(this);

        // 플레이어 입력 대기
        this.eventManager.isListening = true;
    }

    kill(target: Unit) {
        if(target == this.warrior) {
            this.toLose();
        } else {
            for(let i = 0;i < this.enemies.length;i++) {
                if(target == this.enemies[i]) {
                    
                    this.enemies[i].death();
                    this.enemies[i] 
                }
            }
        }
    }

    changeTurn() {
        if(this.turn === TurnEnum.Player) {
            this.turn = TurnEnum.Enemy;

            // 적의 행동을 계산
            this.execEnemyTurn();

            this.eventManager.addEvents(new WWEvent(EventType.CHANGE_TURN));
        
            // 매 턴마다 이벤트 전송 및 동기화
            this.eventManager.sendEvents();
            this.syncManager.doSync(this);

            this.changeTurn();
        } else {
            this.turn = TurnEnum.Player;
            this.turnCount++;

            // 바뀌는 턴이 플레이어의 턴인 경우 액션 전달 대기
            this.eventManager.isListening = true;
            this.eventManager.addEvents(new WWEvent(EventType.CHANGE_TURN));
        
            // 매 턴마다 이벤트 전송 및 동기화
            this.eventManager.sendEvents();
            this.syncManager.doSync(this);
        }
        
    }

    toWin() {
        const winEvent = new WWEvent(EventType.WIN);

        this.eventManager.addEvents(winEvent);



        this.gameStop();
    }

    toLose() {
        const loseEvent = new WWEvent(EventType.LOSE);

        this.eventManager.addEvents(loseEvent);            
        // 결과 정리 후 서버에 전송

        // 최종 정보 전달

        this.gameStop();
    }

    attack(from: Unit, to: Unit, type: AttackType) {
        const attackResult = from.attack(to, type);

        const attackEvent = new AttackEvent(from, to, type);
        this.eventManager.addEvents(attackEvent);

        if(attackResult.leftHp < 1) {
            this.kill(to);
        }
    }

    resolveActions() {
        // 플레이어 턴이 아닌 경우 무시
        if(this.turn != TurnEnum.Player) {
            return;
        } 
        
        const actions = this.eventManager.currentActions;

        for(let i = 0;i < actions.length;i++) {
            const action = actions[i];
            switch(action.type) {
                case EventType.ATTACK:
                    const _a = action as AttackEvent;
                    this.warrior.attack(_a.to, _a.attackType);
            }
        }
        // 액션 계산 완료 후 턴 변경
        this.changeTurn();
    }

    gameStop() {
        process.exit(0);
    }
    
    execEnemyTurn() {
        for(let i = 0;i < this.enemies.length;i++) {
            if(this.enemies[i]) {
                this.attack(this.enemies[i], this.warrior, AttackType.Physical);
            }
        }
    }
}