import { AttackType, Unit } from "./Units"

export enum EventType {
    WIN,
    LOSE,
    ESCAPE,
    CHANGE_TURN,
    ATTACK,
    //HIT,
    DEATH,
    NONE
}

export interface EventPayload {
    type: EventType,
    from?: number,
    to?: number,
    attackType?: string
}

export class WWEvent {
    type: EventType;

    constructor(type: EventType) {
        this.type = type;
    }
}

export class AttackEvent extends WWEvent{
    from: Unit;
    to: Unit;
    attackType: AttackType;
    
    constructor(from: Unit, to: Unit, attackType: AttackType) {
        super(EventType.ATTACK);

        this.from = from;
        this.to = to;
        this.attackType = attackType;
    }
}

export class DeathEvent extends WWEvent {
    to: Unit;

    constructor(to: Unit) {
        super(EventType.DEATH);
        
        this.to = to;
    }
}