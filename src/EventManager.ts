import { Socket } from "socket.io";
import { AttackEvent, DeathEvent, EventPayload, EventType, WWEvent } from "./Events";
import GameManager from "./GameManager";
import { AttackType } from "./Units";

interface ActionPayload {
    type: string;
    target?: number;
    attackType: string;
}

export default class EventManager {
    gameManager: GameManager;

    socket: Socket;

    beforeEvents: WWEvent[] = [];
    currentEvents: WWEvent[] = [];

    currentActions: WWEvent[] = [];

    isListening = true;

    receiveActionListener: any;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
        this.socket = gameManager.socket;

        this.socket.on('WWActions', (args) => {
            this.receiveActions(args.actions);
            //this.gameManager.syncManager.doSync(this.gameManager);
        })
    }

    setReceiveActionListener(listener: any) {
        this.receiveActionListener = listener;
    }

    sendEvents() {
        if(this.isListening) {
            return;
        }

        const eventPayload: EventPayload[] = [];
        for(let i of this.currentEvents) {
            const _p: EventPayload = {
                type: i.type
            }
            if(i.type === EventType.ATTACK) {
                const _t = i as AttackEvent;
                _p.from = _t.from.index;
                _p.to = _t.to.index;
                _p.attackType = _t.attackType == AttackType.Physical ? "PHYSICAL" : "MAGICAL";
            } else if(i.type === EventType.DEATH) {
                const _t = i as DeathEvent;
                _p.to = _t.to.index;
            }

            eventPayload.push(_p);
        }
        

        this.socket.emit('WWResponseEvents', {events: eventPayload});

        this.beforeEvents = this.beforeEvents.concat(this.currentEvents);
        this.currentEvents = [];
    }
    
    receiveActions(actions: Array<ActionPayload>) {
        if(!this.isListening) {
            return;
        }
        
        const tempArray: WWEvent[] = [];
        console.log(actions);

        // JSON -> Event 매핑
        for(let i = 0;i < actions.length;i++) {
            if(actions[i].type.toUpperCase() == "ATTACK") {
                const targetIndex = actions[i].target;
                const attackTypeString = actions[i].attackType;

                if(targetIndex == undefined || !attackTypeString) {
                    continue;
                }
                if(!this.gameManager.enemies[targetIndex]) {
                    continue;
                }

                let attackType: AttackType;
                if(attackTypeString.toUpperCase() == "MAGICIAL") {
                    attackType = AttackType.Magical;
                } else {
                    attackType = AttackType.Physical;
                }

                const attackEvent = new AttackEvent(this.gameManager.warrior, this.gameManager.enemies[targetIndex], attackType);

                tempArray.push(attackEvent)
            } else {
                const tempAction = new WWEvent(EventType.NONE);
                switch(actions[i].type.toUpperCase()) {
                    case "ESCAPE":
                        tempAction.type = EventType.ESCAPE;
                        break;
                    default:
                        continue;
                }
                tempArray.push(tempAction);
            }
        }

        this.currentActions = tempArray;
        this.isListening = false;
        this.gameManager.resolveActions();
    }

    addEvents(e: WWEvent) {
        this.currentEvents.push(e);
    }
}