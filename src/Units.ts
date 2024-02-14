import GameManager from "./GameManager";
import GameMath from "./GameMath";

export enum EnemyType {
    Goblin
};

export enum AttackType {
    Physical,
    Magical
}

export interface UnitStats {
    hp: number;
    maxHp: number;
    atk: number;
    matk: number;
    def: number;
    mdef: number;
    criticalRate: number;
    criticalMag: number;
    index: number;
}

export class Unit {
    gameManager: GameManager;

    hp = 50;
    maxHp = 50;

    atk = 1;
    matk = 1;
    def = 1;
    mdef = 1;

    criticalRate = 10;
    criticalMag = 2;

    index = -1;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
    }

    attack(target: Unit, type: AttackType): {damage: number, leftHp: number} {
        const isCritical = this.attemptCritial();
        let damage = (type === AttackType.Physical) ? this.atk : this.matk;
        
        damage *= GameMath.getRandomInt(8, 11) * 0.1;
        if(isCritical) {
            damage *= this.criticalMag;
        }

        return target.hit(this, damage, type);
    }

    hit(from: Unit, damage: number, type: AttackType): {damage: number, leftHp: number} {
        if(type === AttackType.Physical) {
            damage -= this.def;
        } else {
            damage -= this.mdef;
        }

        if(damage < 1) {
            damage = 1;
        }

        this.hp -= damage;

        return {damage: damage, leftHp: this.hp};
    }

    death() {
        
    }

    private attemptCritial(): boolean {
        if(GameMath.getRandomInt(0, 100) < this.criticalRate) {
            return true;
        }

        return false;
    }

    toObject(): UnitStats {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            atk: this.atk,
            matk: this.matk,
            def: this.def,
            mdef: this.mdef,
            criticalRate: this.criticalRate,
            criticalMag: this.criticalMag,
            index: this.index
        }
    }
}

export class EnemyUnit extends Unit {

}