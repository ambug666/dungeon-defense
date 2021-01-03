export const BLOCK_WIDTH = 30;
export const BLOCK_HEIGHT = 30;

export let MAP_WIDTH = 25;
export let MAP_HEIGHT = 20;
export let MAP_INCREASE = 8;
export let MAX_EXPANSIONS = 3;

export const STARTING_POS = {
    x: 1,
    y: 0
};

export const DIR_DELTA = [{
    x: 0,
    y: -1
}, {
    x: 1,
    y: 0
}, {
    x: 0,
    y: 1
}, {
    x: -1,
    y: 0
}];
export const DIR_STR = ['up', 'right', 'down', 'left'];

export function randomNumber(mod) {
    return Math.floor(Math.random() * mod);
}

export function createId(str) {
    return `${str}-${Math.random().toString(36).replace(/[^a-z]+/g, '')}`
}