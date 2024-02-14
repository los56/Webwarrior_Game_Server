export default class GameMath {
    static getRandomInt(min: number, max: number) {
        max = Math.floor(max);
        min = Math.ceil(min);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}