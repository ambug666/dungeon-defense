import React from 'react';
import moment from 'moment';
import './App.css';
import Block, { HALLWAY_BLOCK, ENTRY_BLOCK, ROCK_BLOCK, LAIR_BLOCK, Overlay } from './Block';
import TreasureList, { initGemstones, GEMSTONE_TYPES } from './Treasure';
import { BLOCK_WIDTH, BLOCK_HEIGHT, createId, randomNumber, STARTING_POS, DIR_DELTA, MAP_INCREASE, MAP_HEIGHT, MAP_WIDTH, MAX_EXPANSIONS } from './constants';
import HeroesList, { FIGHTER_STYLES, SHIELD_STYLES, HERO_WEAPONS, ROGUE_STYLES, ARCHER_STYLES, archerAttack } from './Heroes';
import { moveMinion, loadMinions } from './Minions';
import TrapsList, { loadTraps } from './Traps';
import { EffectsList, handleDamageNumber } from "./Effects";
import Market, { market, loadMarket, activateMarket, getMarketItemLevel, getMarketItemCost } from './Market';
import './StartButton.css';
import InfoBox from './InfoBox';
import MinionsList from './Minions';
import { weaponDamage } from './Weapons';
import { startArena } from './arena';
import LabList from './Lab';
import { loadCreatures } from './Creatures';
import { WelcomeModal } from './WelcomeModal';
import { BuyLandConfirm } from './BuyLandConfirm';
import { YouLoseModal } from './YouLoseModal';
import { GemstoneWinModal } from './GemstoneWinModal';
import { SellGemConfirm } from './SellGemConfirm';
import { Level100WinModal } from './Level100WinModal';
import { VolcanicLairWinModal } from './VolcanicLairWinModal';
let cloneDeep = require('lodash/fp/cloneDeep');

export let FASTER_SPEED = 1;
export let FAST_SPEED = 2;
export let NORMAL_SPEED = 3;
export let SLOW_SPEED = 4;
export let SLOWER_SPEED = 5;
let g_found = false;

let STARTING_GOLD = 45;
let LAIR_MAX_START = 20;

export let map = {
    wave: 0,
    data: {
        lairMax: LAIR_MAX_START,
        replaceableCaltrops: false,
        expansions: 0,
        lairExpanded: false,
        upgradedGasTrapDuration: false
    },
    treasure: [],
    gems: [],
    traps: [],
    effects: [],
    heroes: [],
    minions: [],
    labs: [],
    reputation: {}
};

class Level extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: true,
            turn: 0,
            log: [],
            research: []
        }
    }

    componentDidMount() {
        const { editing } = this.state;
        this.createMap();
        if (!editing) {
            this.startNextWave();
        }
    }

    createMap() {
        map.rows = [];
        let lair = { width: 4, height: 3 };
        let x, y;
        for (y = 0; y < MAP_HEIGHT; y++) {
            map.rows.push([]);
        }
        map.rows.forEach(row => {
            row.length = MAP_WIDTH;
            row.fill(ROCK_BLOCK);
        });

        //setup lair
        let { rows } = map;
        for (y = MAP_HEIGHT - 2; y > MAP_HEIGHT - 2 - lair.height; y--) {
            for (x = MAP_WIDTH - 2; x > MAP_WIDTH - 2 - lair.width; x--) {
                rows[y][x] = LAIR_BLOCK;
            }
        }
        rows[MAP_HEIGHT - 2][MAP_WIDTH - 2] = ROCK_BLOCK;

        let pos = { x: STARTING_POS.x, y: STARTING_POS.y };
        this.clearMapSpace(pos, ENTRY_BLOCK);
        pos.y = 1;
        this.clearMapSpace(pos, ENTRY_BLOCK);
        this.clearMapSpace({ x: pos.x + 1, y: pos.y }, ENTRY_BLOCK);

        //setup path
        while (pos.x < MAP_WIDTH - 2 - lair.width || pos.y < MAP_HEIGHT - 2 - lair.height) {
            let dir = Math.floor(Math.random() * 2);
            if (dir && pos.y < MAP_HEIGHT - 3) {
                pos.y += 1;
                this.clearMapSpace(pos);
                this.clearMapSpace({ x: pos.x + 1, y: pos.y });
            } else if (pos.x < MAP_WIDTH - 3) {
                pos.x += 1;
                this.clearMapSpace(pos);
                this.clearMapSpace({ x: pos.x, y: pos.y + 1 });
            }
        }

        this.cleanupTreasure(STARTING_GOLD);
        initGemstones();
        this.forceUpdate();
    }

    clearMapSpace({ x, y }, val = HALLWAY_BLOCK) {
        if (y >= 0 && y < map.rows.length && x >= 0 && x < map.rows[y].length) {
            map.rows[y][x] = val;
        }
    }

    initHero(hero) {
        hero.active = true;
        hero.explored = [{ x: hero.x, y: hero.y }];
        hero.moves = Math.floor(map.rows.length * map.rows[0].length / 3);
        hero.mode = (hero.level > 25 || randomNumber(2) === 0) ? 'smarter' : 'determined';
        hero.spturn = 0;
        hero.speed = randomNumber(4 + hero.level) === 0 ? SLOW_SPEED : NORMAL_SPEED;
        hero.escaping = false;
        hero.activateTraps = true;
        hero.looted = false;
        hero.gold = hero.level * 9 + randomNumber(10) - 5;
        hero.maxGold = hero.level * 15 + randomNumber(hero.level);
        if (hero.level > 50) {
            hero.gold += 7 * (randomNumber(hero.level) + hero.level);
            hero.maxGold += hero.gold;
        }
        hero.still = 0;
        hero.webbed = 0;
        hero.poisoned = null;
        hero.class = 'heroes';
        if (hero.level > 75 || (hero.level > 50 && randomNumber(2) === 0)) {
            hero.mode = 'brilliant';
        }
        if (hero.mode === 'smarter' || hero.mode === 'brilliant') {
            this.setHeroPath(hero);
        }
    }

    initFighter(hero) {
        this.initHero(hero);
        hero.health = hero.level * 8 + randomNumber(10) - 5;
        hero.health += (Math.floor(hero.level / 5) * randomNumber(5));
        hero.health += Math.floor(hero.level / 10) * 15;
        hero.health = Math.max(hero.health, hero.level * 2 + 1);
        hero.type = 'fighter';
        hero.strength = hero.level;
        hero.strength += Math.floor(hero.level / 10) * 3;
        hero.style = randomNumber(FIGHTER_STYLES.length);
        hero.shield = randomNumber(SHIELD_STYLES.length - 1) + 1;
        hero.weapon = randomNumber(hero.level) > 0 ? HERO_WEAPONS[randomNumber(HERO_WEAPONS.length)] : null;
        this.setHeroAncestry(hero);
        this.setHeroAttribute(hero);
    }

    initRogue(hero) {
        this.initHero(hero);
        hero.health = hero.level * 5 + randomNumber(6) - 5;
        hero.health += (Math.floor(hero.level / 5) * randomNumber(3));
        hero.health += Math.floor(hero.level / 10) * 7;
        hero.health = Math.max(hero.health, hero.level * 2 + 1);
        hero.maxGold += hero.level * 10;
        hero.type = 'rogue';
        hero.activateTraps = false;
        hero.strength = Math.floor((hero.level + 1) / 2);
        hero.strength += Math.floor(hero.level / 10);
        hero.style = randomNumber(ROGUE_STYLES.length);
        this.setHeroAncestry(hero);
        this.setHeroAttribute(hero);
    }

    initArcher(hero) {
        this.initHero(hero);
        hero.health = hero.level * 5 + randomNumber(6) - 5;
        hero.health += (Math.floor(hero.level / 5) * randomNumber(3));
        hero.health += Math.floor(hero.level / 10) * 7;
        hero.health = Math.max(hero.health, hero.level * 2 + 1);
        hero.type = 'archer';
        hero.weapon = 'bow';
        hero.strength = hero.level;
        hero.strength += Math.floor(hero.level / 10) * 3;
        hero.style = randomNumber(ARCHER_STYLES.length);
        hero.attack = (level, hero) => archerAttack(level, hero);
        this.setHeroAncestry(hero);
        this.setHeroAttribute(hero);
    }

    setHeroAncestry(hero) {
        hero.ancestry = randomNumber(4) === 0 ? 'orc' : 'human';
        if (hero.ancestry === 'orc') {
            hero.health += Math.floor(hero.level * 3 / 2);
        } else {
            hero.strength += Math.floor((hero.level + 1) / 2);
        }
    }

    setHeroAttribute(hero) {
        let { reputation, wave } = map;
        if (wave > 99) {
            hero.champion = true;
        }
        if (reputation.deadly > 0 && wave > 3) {
            if (randomNumber(5 + reputation.deadly) >= 4) {
                hero.attribute = 'elite';
            }
        }
        if (hero.champion) {
            hero.health = 99999;
            hero.strength = 666;
            hero.gold = 9999;
            hero.maxGold = 9999999;
            hero.mode = 'smarter';
            hero.activateTraps = false;
            hero.weapon = 'great sword';
            return;
        }
        if (hero.attribute === 'elite') {
            let mult = 1 + randomNumber((reputation.deadly + hero.level) / 10);
            let add = randomNumber(reputation.deadly + hero.level);
            hero.health = hero.health * mult + add;
            hero.strength = hero.strength * mult + add;
            hero.gold += add;
            hero.maxGold = hero.maxGold * mult + add;
            hero.mode = 'smarter';
            hero[hero.attribute] = true;
            return;
        }
        let num = reputation.rich ? randomNumber(5) : randomNumber(10);
        if (num === 0) {
            hero.attribute = 'greedy';
            hero.maxGold = 1000 * hero.maxGold;
            return;
        }
        num = reputation.easy ? randomNumber(5) : randomNumber(10);
        if (num === 0) {
            hero.attribute = 'cowardly';
            return;
        }
        num = (reputation.trapfilled || reputation.monsterous) ? randomNumber(5) : randomNumber(10);
        if (num === 0) {
            hero.attribute = 'cowardly';
            return;
        }
        if (hero.level > 50) {
            hero.health += hero.level * randomNumber(5);
            hero.strength += hero.level;
            hero.gold += hero.level * randomNumber(5);
            hero.maxGold += hero.level * randomNumber(10);
        }
        if (hero.level > 75) {
            hero.health += hero.level * randomNumber(10);
            hero.strength += hero.level;
            hero.gold += hero.level * randomNumber(5);
            hero.maxGold += hero.level * randomNumber(10);
        }
    }

    setHeroPath(hero) {
        let { x, y, target, escaping } = hero;
        let { treasure } = map;
        if (escaping) {
            hero.target = target = { x: STARTING_POS.x, y: STARTING_POS.y };
        } else {
            hero.target = target = treasure[randomNumber(treasure.length)];
        }
        hero.path = [];
        let checked = [];
        g_found = false;
        if (target) {
            if (hero.mode === 'smarter') {
                hero.path = this.generatePath({ x, y }, { x: target.x, y: target.y }, hero.path, checked);
            } else {
                hero.path = [];
                let newpath = [];
                for (let i = 0; i < 7; i++) {
                    newpath = [];
                    let checked = [];
                    g_found = false;
                    newpath = this.generatePath({ x, y }, { x: target.x, y: target.y }, newpath, checked);
                    if (newpath.length < hero.path.length || hero.path.length === 0) {
                        hero.path = cloneDeep(newpath);
                    }
                }
            }
        }
    }

    generatePath(pos, dest, path, checked) {
        let { rows } = map;
        let { x, y } = pos;
        if (x === dest.x && y === dest.y) {
            g_found = true;
            path.push(pos);
            return path;
        }
        let dir = Math.floor(Math.random() * 4);
        let dirs = DIR_DELTA;
        if (!g_found && !this.outOfBounds(x + dirs[dir].x, y + dirs[dir].y) && rows[y + dirs[dir].y][x + dirs[dir].x] !== ROCK_BLOCK && !checked.find(ch => ch.x === x + dirs[dir].x && ch.y === y + dirs[dir].y)) {
            path.push(pos);
            checked.push(pos);
            this.generatePath({ x: x + dirs[dir].x, y: y + dirs[dir].y }, dest, path, checked);
        }
        if (!g_found && !this.outOfBounds(x + dirs[(dir + 1) % 4].x, y + dirs[(dir + 1) % 4].y) && rows[y + dirs[(dir + 1) % 4].y][x + dirs[(dir + 1) % 4].x] !== ROCK_BLOCK && !checked.find(ch => ch.x === x + dirs[(dir + 1) % 4].x && ch.y === y + dirs[(dir + 1) % 4].y)) {
            path.push(pos);
            checked.push(pos);
            this.generatePath({ x: x + dirs[(dir + 1) % 4].x, y: y + dirs[(dir + 1) % 4].y }, dest, path, checked);
        }
        if (!g_found && !this.outOfBounds(x + dirs[(dir + 2) % 4].x, y + dirs[(dir + 2) % 4].y) && rows[y + dirs[(dir + 2) % 4].y][x + dirs[(dir + 2) % 4].x] !== ROCK_BLOCK && !checked.find(ch => ch.x === x + dirs[(dir + 2) % 4].x && ch.y === y + dirs[(dir + 2) % 4].y)) {
            path.push(pos);
            checked.push(pos);
            this.generatePath({ x: x + dirs[(dir + 2) % 4].x, y: y + dirs[(dir + 2) % 4].y }, dest, path, checked);
        }
        if (!g_found && !this.outOfBounds(x + dirs[(dir + 3) % 4].x, y + dirs[(dir + 3) % 4].y) && rows[y + dirs[(dir + 3) % 4].y][x + dirs[(dir + 3) % 4].x] !== ROCK_BLOCK && !checked.find(ch => ch.x === x + dirs[(dir + 3) % 4].x && ch.y === y + dirs[(dir + 3) % 4].y)) {
            path.push(pos);
            checked.push(pos);
            this.generatePath({ x: x + dirs[(dir + 3) % 4].x, y: y + dirs[(dir + 3) % 4].y }, dest, path, checked);
        }
        //this space is a dead end
        if (!g_found) {
            path.pop();
        }
        return path;
    }

    /*MISC**********************************************************************************/

    get totalGold() {
        let { treasure } = map;
        return treasure.reduce(((acc, tr) => acc + tr.value), 0);
    }

    get totalGems() {
        let { gems } = map;
        return gems.reduce(((acc, tr) => acc + (tr.found ? tr.value : 0)), 0);
    }

    gameTurn() {
        let { heroes, effects, minions } = map;
        let { turn } = this.state;
        if (!heroes || heroes.length === 0) {
            this.endWave();
            return;
        }
        heroes.forEach((hero, idx) => idx <= turn && this.moveHero(hero));
        minions.forEach(minion => minion.move(this, minion));
        effects.forEach(effect => this.handleEffect(effect));
        this.setState({ turn: turn + 1 });
    }

    startNextWave() {
        map.wave++;
        this.gemMessages = [];
        this.addHeroesToMap();
        this.resetMinions();
        this.setState({ editing: false, turn: 0, heroExit: 0, heroDie: 0, selected: null });
        this.initLog();
        this.gameTimer = setInterval(() => this.gameTurn(), 150);
    }

    endWave() {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
        map.effects = [];
        this.cleanupTraps();
        this.cleanupMinions();
        this.cleanupTreasure();
        this.setReputation();
        this.endLog();
        this.activateResearch();
        this.autosave();
        this.setState({ turn: 0 });
    }

    autosave() {
        if (this.totalGold > 0 && map.wave < 99) {
            window.localStorage.setItem('map', JSON.stringify(map));
            window.localStorage.setItem('market', JSON.stringify(market));
            window.localStorage.setItem('gold', this.totalGold);
            window.localStorage.setItem('wave', map.wave);
        }
    }

    loadGame() {
        let loadmap = JSON.parse(window.localStorage.getItem('map'));

        //rows
        map.rows = loadmap.rows;
        map.data = loadmap.data;
        map.wave = loadmap.wave;
        map.reputation = loadmap.reputation;

        //gems
        map.gems = loadmap.gems;

        //treasure
        map.treasure = loadmap.treasure;

        //traps
        map.traps = loadmap.traps;
        loadTraps();

        //labs
        map.labs = loadmap.labs;

        //minions
        map.minions = loadmap.minions;
        loadMinions();
        loadCreatures();

        //market
        loadMarket();
        this.forceUpdate();
    }

    /*REPUTATION****************************************************************************/

    setReputation() {
        let { numHeroes, heroDie, heroExit } = this.state;
        let deadly = map.reputation.deadly || 0;
        let spaces = this.countMapSpaces;
        map.reputation = {};
        if (heroDie === numHeroes) {
            map.reputation.deadly = deadly + 1;
            return;
        } else {
            map.reputation.deadly = 0;
        }
        if (heroExit === numHeroes) {
            map.reputation.easy = true;
        }
        if (map.traps.length > spaces / 2) {
            map.reputation.trapfilled = true;
        }
        if (map.traps.minions > spaces / 3) {
            map.reputation.monsterous = true;
        }
        if (this.totalGold > 50 * map.wave) {
            map.reputation.rich = true;
        }
    }

    /*HEROES********************************************************************************/

    moveHero(hero) {
        let x = hero.x;
        let y = hero.y;
        hero.spturn = (hero.spturn + 1) % hero.speed;
        if (hero.spturn === 0) {
            this.heroDealWithPoison(hero);
            if (hero.webbed > 0) {
                hero.webbed--;
                hero.moves++;
                hero.still = 0;
                if (hero.webbed === 0) {
                    this.removeTrapFromMap(hero.web);
                    hero.web = null;
                }
                return;
            }
            if (this.heroExit(hero)) {
                return;
            }
            this.considerRetargetting(hero);
            switch (hero.mode) {
                default:
                case 'brilliant': //a*
                case 'smarter': //follow path
                    this.moveHeroSmarter(hero);
                    break;
                case 'random':
                case 'explorer-random': //temporary random for explorer
                case 'explorer': //random but only to unexplored tiles.
                    this.moveHeroRandom(hero, hero.mode === 'explorer');
                    break;
                case 'determined':
                    this.moveHeroDetermined(hero);
                    break;
            }
            this.checkHeroTrap(hero);
            this.attackMinion(hero);
            this.checkHeroTreasure(hero);
        }
        this.checkHeroEffect(hero);
        hero.moves = (hero.webbed === 0) ? hero.moves - 1 : hero.moves;
        if (x === hero.x && y === hero.y && hero.webbed === 0) {
            hero.still++;
        } else {
            hero.still = 0;
        }
    }

    heroExit(hero) {
        if (hero.x === STARTING_POS.x && hero.y === STARTING_POS.y && hero.escaping) {
            this.displayMessage(`${hero.ancestry} ${hero.type} escaped with ${hero.gold} gold pieces.`);
            this.removeHeroFromMap(hero, false);
            this.setState({ heroExit: this.state.heroExit + 1 });
            return true;
        }
        return false;
    }

    considerRetargetting(hero) {
        let { treasure } = map;
        let { escaping, looted, moves, still, champion } = hero;
        let esc1 = !treasure || treasure.length === 0;
        let esc2 = !champion && (moves <= 0 || still > 10)
        if ((esc1 || esc2) && !escaping) {
            console.log(hero.id, 'is escaping because they sat in one place too long (', still, ') or ran out of moves (', moves, ')');
            this.startEscaping(hero);
            return;
        }

        if ((hero.gold >= hero.maxGold) && !escaping && looted && !champion) {
            console.log(hero.id, 'is escaping because they have ', hero.gold, 'gold out of', hero.maxGold);
            this.startEscaping(hero);
            return;
        }

        let limit = hero.brave ? 1 : hero.level;
        limit = hero.cowardly ? hero.level * 2 : limit;
        if (hero.health <= limit && !escaping && looted && !champion) {
            console.log(hero.id, 'is escaping because they have ', hero.health, 'health remaining');
            this.startEscaping(hero);
            return;
        }

        if (hero.target && !escaping && !this.findTreasure(hero.target)) {
            this.resetHeroTarget(hero);
            return;
        }
    }

    resetHeroTarget(hero) {
        let { treasure } = map;
        if (hero.mode === 'determined') {
            hero.target = treasure[Math.floor(Math.random() * treasure.length)];
            hero.explored = [{ x: hero.x, y: hero.y }];
        } else if (hero.mode === 'smarter') {
            this.setHeroPath(hero);
        }
    }

    startEscaping(hero) {
        if (!hero.escaping) {
            hero.mode = 'smarter';
            hero.escaping = true;
            this.setHeroPath(hero);
        }
    }

    moveHeroSmarter(hero) {
        let { path } = hero;
        if (path && path.length > 0) {
            hero.x = path[0].x;
            hero.y = path[0].y;
            path.shift();
        } else {
            this.setHeroPath(hero);
        }
    }

    moveHeroDetermined(hero) {
        let { x, y, target } = hero;
        let { rows } = map;
        if (!target) {
            this.resetHeroTarget(hero);
            target = hero.target;
        }
        let diffx = target.x - hero.x;
        let diffy = target.y - hero.y;
        let primary = (Math.abs(diffx) > Math.abs(diffy)) ? 'horizontal' : 'vertical';
        primary = (diffx === 0) ? 'vertical' : primary;
        primary = (diffy === 0) ? 'horizontal' : primary;
        if (diffx === 0 && diffy === 0) {
            this.resetHeroTarget(hero);
            return;
        }
        //primary
        if (primary === 'horizontal') {
            x += Math.sign(diffx);
        } else {
            y += Math.sign(diffy);
        }
        //secondary
        if (this.outOfBounds(x, y) || rows[y][x] === ROCK_BLOCK || (x === hero.x && y === hero.y)) {
            if (primary === 'horizontal') {
                x = hero.x;
                y = hero.y + Math.sign(diffy);
            } else {
                x = hero.x + Math.sign(diffx);
                y = hero.y;
            }
        }
        //tangential
        if (this.outOfBounds(x, y) || rows[y][x] === ROCK_BLOCK || this.heroExplored(hero, x, y)) {
            if (primary === 'horizontal') {
                x = hero.x;
                if (!this.heroExplored(hero, x, hero.y + 1)) {
                    y = hero.y + 1;
                } else if (!this.heroExplored(hero, x, hero.y - 1)) {
                    y = hero.y - 1;
                }
            }
            if (primary === 'vertical') {
                y = hero.y;
                if (!this.heroExplored(hero, hero.x + 1, y)) {
                    x = hero.x + 1;
                } else if (!this.heroExplored(hero, hero.x + 1, y)) {
                    x = hero.x - 1;
                }
            }
        }

        if (!this.outOfBounds(x, y) && rows[y][x] !== ROCK_BLOCK && !this.heroExplored(hero, x, y)) {
            hero.x = x;
            hero.y = y;
            hero.explored.push({ x, y });
        } else {
            hero.mode = 'explorer';
        }
    }

    moveHeroRandom(hero, unexploredOnly) {
        let { x, y } = hero;
        let { rows } = map;
        let dir = Math.floor(Math.random() * 4);
        let dirs = DIR_DELTA;
        x += dirs[dir].x;
        y += dirs[dir].y;

        let iterations = 0;
        let check = (hero, x, y) => {
            let ret = (this.outOfBounds(x, y) || rows[y][x] === ROCK_BLOCK);
            if (unexploredOnly) {
                ret = ret || !!this.heroExplored(hero, x, y);
            }
            return ret;
        }
        while (check(hero, x, y) && iterations < 4) {
            dir = (dir + 1) % 4;
            x = hero.x + dirs[dir].x;
            y = hero.y + dirs[dir].y;
            iterations++;
        }

        if (!this.outOfBounds(x, y) && rows[y][x] !== ROCK_BLOCK && iterations < 4) {
            hero.x = x;
            hero.y = y;
            hero.explored.push({ x, y });
            hero.mode = (hero.mode === 'explorer-random') ? 'explorer' : hero.mode;
        } else {
            hero.mode = (hero.mode === 'explorer') ? 'explorer-random' : hero.mode;
        }
    }

    outOfBounds(x, y) {
        let { rows } = map;
        return (x < 0 || y < 0 || y >= rows.length || x >= rows[y].length);
    }

    heroExplored(hero, x, y) {
        return hero.explored && hero.explored.find(ex => ex.x === x && ex.y === y);
    }

    checkHeroTreasure(hero) {
        let treasure = map.treasure.find(tr => tr.x === hero.x && tr.y === hero.y);
        if (treasure && hero.active) {
            let max = hero.maxGold - hero.gold;
            if (max > 0) {
                hero.looted = !treasure.dropped;
                if (max < treasure.value && !hero.champion) {
                    hero.gold += max;
                    treasure.value -= max;
                    this.displayMessage(`${hero.ancestry} ${hero.type} looted ${max} gold`);
                } else {
                    hero.gold += treasure.value;
                    this.displayMessage(`${hero.ancestry} ${hero.type} looted ${treasure.value} gold`);
                    let idx = map.treasure.findIndex(tr => tr.id === treasure.id);
                    map.treasure.splice(idx, 1);
                    this.resetHeroTarget(hero);
                }
            }
        }
    }

    checkHeroTrap(hero) {
        let trap = this.findTrapOnMap(hero.x, hero.y);
        if (trap && trap.active && trap.activate) {
            if (!hero.activateTraps && hero.level > 2) {
                let chance = (randomNumber(hero.level + Math.floor(hero.level / 7) - trap.level));
                if (chance > 2 || hero.level > trap.level + 10) {
                    return;
                }
            }
            trap.activate(this, trap, hero);
        }
    }

    checkHeroEffect(hero) {
        let effect = map.effects.find(ef => ef.x === hero.x && ef.y === hero.y);
        if (effect && effect.active && effect.activate) {
            effect.activate(this, effect, hero);
        }
    }

    attackMinion(hero) {
        if (hero.attack) {
            return hero.attack(this, hero);
        }
        let minion = this.findMinionOnMap(hero.x, hero.y);
        if (minion) {
            let damage = hero.strength;
            damage += weaponDamage(hero.weapon);
            this.minionTakesDamage(minion, damage, hero.type);
        }
    }

    heroTakesDamage(hero, damage, source = 'thing') {
        hero.health -= damage;
        this.addEffectToMap({
            type: 'damage-number',
            level: damage,
            handle: (level, dm) => handleDamageNumber(level, dm),
            data: {
                target: hero,
                xdiff: randomNumber(30),
                ydiff: -8,
                opacity: 0.8,
                type: source === 'poison' ? source : 'hero',
                end: moment().add(2, 'seconds')
            }
        });

        let vowels = 'aeiou';
        let a = vowels.includes(source[0]) ? 'an' : 'a';
        if (source === 'poison') {
            a = '';
        }

        if (hero.health <= 0) {
            this.displayMessage(`${hero.ancestry} ${hero.type} took ${damage} damage from ${a} ${source} and died`);
            this.removeHeroFromMap(hero);
            this.setState({ heroDie: this.state.heroDie + 1 });
            return true;
        }

        this.displayMessage(`${hero.ancestry} ${hero.type} took ${damage} damage from ${a} ${source}`);
        return false;
    }

    heroIsPoisoned(hero, damage, source = 'thing') {
        hero.poisoned = {
            damage,
            duration: damage + randomNumber(damage)
        }
        let vowels = 'aeiou';
        let a = vowels.includes(source[0]) ? 'an' : 'a';

        this.displayMessage(`${hero.ancestry} ${hero.type} has been poisoned by ${a} ${source}`);
        return false;
    }

    heroDealWithPoison(hero) {
        if (hero.poisoned) {
            this.heroTakesDamage(hero, hero.poisoned.damage, 'poison');
            hero.poisoned.duration--;
            if (hero.poisoned.duration <= 0) {
                hero.poisoned = null;
            }
        }
    }

    heroInLine(x, y, dir) {
        while (!(this.outOfBounds(x, y) || map.rows[y][x] === ROCK_BLOCK)) {
            x += DIR_DELTA[dir].x;
            y += DIR_DELTA[dir].y;
            let min = this.findHeroOnMap(x, y);
            if (min) {
                return min;
            }
        }
        return null;
    }

    findHeroOnMap(x, y) {
        return map.heroes.find(hero => hero.x === x && hero.y === y);
    }

    /*MINIONS******************************************************************************/

    minionTakesDamage(minion, damage, source) {
        minion.health -= damage;

        this.addEffectToMap({
            type: 'damage-number',
            level: damage,
            handle: (level, dm) => handleDamageNumber(level, dm),
            data: {
                target: minion,
                xdiff: randomNumber(30),
                ydiff: -8,
                opacity: 0.8,
                type: 'minion',
                end: moment().add(2, 'seconds')
            }
        });

        if (minion.health <= 0) {
            this.displayMessage(`${minion.type} took ${damage} damage from a ${source} has died`);
            this.removeMinionFromMap(minion);
            return;
        }

        this.displayMessage(`${minion.type} took ${damage} damage from a ${source}`);
    }

    resetMinions() {
        map.minions.forEach(minion => {
            minion.active = true;
            minion.spturn = 0;
            minion.levelUp = false;
            minion.specialReset && minion.specialReset(minion);
        });
    }

    cleanupMinions() {
        map.minions.forEach(minion => {
            minion.cleanupMinion && minion.cleanupMinion(this, minion);
        });
    }

    onClickMinion(minion) {
        if (this.state.editing && minion.onClick) {
            minion.onClick(this, minion);
        }
    }

    minionInLine(x, y, dir) {
        while (!(this.outOfBounds(x, y) || map.rows[y][x] === ROCK_BLOCK)) {
            x += DIR_DELTA[dir].x;
            y += DIR_DELTA[dir].y;
            let min = this.findMinionOnMap(x, y);
            if (min) {
                return min;
            }
        }
        return null;
    }

    //finds creatures too
    findMinionOnMap(x, y) {
        let minion = null;
        map.minions.forEach(min => {
            let width = min.size ? min.size.width : 1;
            let height = min.size ? min.size.height : 1;
            if (x >= min.x && x < min.x + width &&
                y >= min.y && y < min.y + height) {
                minion = min;
            }
        });
        return minion;
    }

    /*EFFECTS*******************************************************************************/

    handleEffect(effect) {
        if (effect.handle) {
            effect.handle(this, effect);
        }
    }

    /*MARKET********************************************************************************/

    onClickMarketItem(item) {
        if (item && item.onClickMarket) {
            item.onClickMarket(this, item);
        } else {
            this.selectMarketItem('market', item);
        }
    }

    selectMarketItem(palette, item) {
        if (item) {
            this.setState({ selected: { palette, item } });
        } else {
            this.setState({ selected: null });
        }
    }

    researchMarketItem(research) {
        research.purchase(this, research);
    }

    beginResearch(item) {
        let { research } = this.state;
        research.push(item);
        this.setState({ research });

    }

    activateResearch() {
        let { research } = this.state;
        if (research) {
            research.forEach(r => r.research.activate(this, r));
            this.setState({ research: [] });
        }
    }

    purchaseMarketResearchItem(research) {
        if (this.spendGold(research.cost(research))) {
            let item = market[research.itemClass] && market[research.itemClass].find(m => m.id === research.itemId);
            this.beginResearch({
                text: research.researchText,
                item: item,
                research: research
            });
        }
    }

    activateMarketItems(research) {
        let ret = research.research;
        ret.targetItems && ret.targetItems.forEach(target => {
            activateMarket(target.class, target.id, target.activate);
        });
        ret.researchData && ret.researchData.forEach(item => map.data[item.name] = item.set);
    }

    /*MAP***********************************************************************************/

    onClickMap(x, y, type) {
        const { editing } = this.state;
        if (editing) {
            let item = this.tileContainsSomething(x, y);
            if (type === 'clear') {
                this.clearMapElements(x, y);
            } else if (item) {
                if (item.class === 'traps') {
                    this.onClickTrap(item);
                }
                if (item.class === 'minions') {
                    this.onClickMinion(item);
                }
            } else if (type === 'lair') {
                this.addLairToMap(x, y);
            } else {
                this.onClickMapEditing(x, y, type);
            }
        }
    }

    onClickMapEditing(x, y, type) {
        let { selected } = this.state;
        if (selected && selected.palette === 'market') {
            let { item } = selected;
            let match = this.itemFitsOnMap(item, x, y, type);
            if (item.itemAddTest) {
                match = match && item.itemAddTest(this, item, { y });
            }
            if (match) {
                if (this.spendGold(item.cost(item))) {
                    item.class === 'trap' && this.addTrapToMap(item, x, y);
                    item.class === 'minions' && this.addMinionToMap(item, x, y);
                    item.class === 'lab' && this.addLabToMap(item, x, y);
                    item.class === 'creatures' && this.addMinionToMap(item, x, y);
                    this.forceUpdate();
                } else {
                    this.displayMessage(`Cannot afford ${item.name}`);
                }
                return;
            }
            let types = { [LAIR_BLOCK]: 'Lair', [ROCK_BLOCK]: 'Stone', [ENTRY_BLOCK]: 'Dungeon Entrance' };
            this.displayMessage(`Cannot add ${item.name} to ${types[type]}`);
        }
    }

    itemFitsOnMap(item, x, y) {
        function cellMatch(x, y, item) {
            let type = map.rows[y][x];
            return item.mapCells ? item.mapCells.includes(type) : type === HALLWAY_BLOCK;
        }
        if (item.size) {
            let { width, height } = item.size;
            let good = true;
            let i, j;
            for (j = 0; j < height; j++) {
                for (i = 0; i < width; i++) {
                    let tcs = this.tileContainsSomething(x + i, y + j);
                    good = good && !this.outOfBounds(x + i, y + j) && cellMatch(x + i, y + j, item) && !tcs;
                }
            }
            return good;
        }
        return cellMatch(x, y, item) && !this.tileContainsSomething(x, y);
    }

    addTrapToMap(trap, x = 0, y = 0) {
        let newTrap = {
            id: createId(trap.type),
            type: trap.type,
            class: 'traps',
            x: x,
            y: y,
            data: cloneDeep(trap.data),
            level: trap.level,
            active: true,
            onClick: trap.onClick,
            activate: trap.activate,
            refresh: trap.refresh,
            cleanup: trap.cleanup
        };
        trap.addToMap && trap.addToMap(this, newTrap);
        map.traps.push(newTrap);
    }

    spendGold(amount) {
        if (!map.treasure || map.treasure.length === 0 || this.totalGold <= amount) {
            this.displayMessage(`Out of Gold!`);
            if (this.state.editing && this.gemFound) {
                this.setState({ outOfFunds: true })
            }
            return false;
        }
        if (map.treasure && map.treasure[0]) {
            if (map.treasure[0].value > amount) {
                map.treasure[0].value -= amount;
            } else {
                amount -= map.treasure[0].value;
                map.treasure.shift();
                if (amount > 0) {
                    return this.spendGold(amount);
                }
            }
        }
        return true;
    }

    addEffectToMap(effect, x = 0, y = 0) {
        map.effects.push({
            id: createId(effect.type),
            type: effect.type,
            x: x,
            y: y,
            level: effect.level,
            active: true,
            handle: effect.handle,
            data: cloneDeep(effect.data),
            activate: effect.activate
        })
    }

    removeEffectFromMap(effect) {
        let { effects } = map;
        let idx = effects.findIndex(ef => ef.id === effect.id);
        effects.splice(idx, 1);
    }

    removeHeroFromMap(hero, dropTreasure = true) {
        let { heroes } = map;
        let idx = heroes.findIndex(h => h.id === hero.id);
        heroes.splice(idx, 1);
        hero.active = false;
        if (dropTreasure) {
            this.addTreasureToMap(hero.gold, hero.x, hero.y, true);
        }
    }

    removeMinionFromMap(minion) {
        let { minions } = map;
        let idx = minions.findIndex(h => h.id === minion.id);
        minions.splice(idx, 1);
        minions.active = false;
    }

    removeTrapFromMap(trap) {
        let { traps } = map;
        let idx = traps.findIndex(tr => tr.id === trap.id);
        if (idx >= 0) {
            traps.splice(idx, 1);
        }
    }

    addTreasureToMap(gold, x, y, dropped = false) {
        if (gold > 0) {
            map.treasure.push({
                type: 'treasure',
                id: createId(`treasure`),
                x,
                y,
                dropped,
                value: gold
            });
        }
    }

    addHeroesToMap(amount, type, level) {
        let num = 3 + randomNumber(4 + (map.reputation.deadly || 0));
        num = num > 2 + map.wave ? 2 + map.wave : num;
        num = amount ? amount : num;
        num = map.wave > 99 ? 3 : num;
        this.setState({ numHeroes: num })
        while (num > 0) {
            let hero = {
                id: createId('hero'),
                level: level ? level : map.wave,
                x: 1,
                y: 0,
            };
            if (type === 'fighter' || map.wave > 99) {
                this.initFighter(hero);
            } else if (type === 'rogue' || map.reputation.trapfilled) {
                this.initRogue(hero);
            } else if (type === 'archer' || map.reputation.monsterous) {
                this.initArcher(hero);
            } else {
                let num = randomNumber(4);
                if (num === 0) {
                    this.initRogue(hero);
                } else if (num === 1) {
                    this.initArcher(hero);
                } else {
                    this.initFighter(hero);
                }
            }

            map.heroes.push(hero);
            num--;
        }
    }

    addMinionToMap(minion, x, y) {
        let level = minion.level;
        let health = minion.startingHealth ? minion.startingHealth(level) : 3;
        health = Math.max(health, 3);
        let newMinion = {
            type: minion.type,
            class: 'minions',
            id: createId(minion.type),
            x,
            y,
            weapon: minion.startingWeapon ? minion.startingWeapon() : null,
            level: level,
            strength: level + 1,
            health,
            maxHealth: health,
            speed: minion.startingSpeed ? minion.startingSpeed() : SLOW_SPEED,
            spturn: 0,
            size: minion.size,
            levelUp: false,
            pacifist: false,
            mode: 'random',
            move: (level, minion) => moveMinion(level, minion),
            specialAction: minion.specialAction,
            specialReset: minion.specialReset,
            initMinion: minion.initMinion,
            cleanupMinion: minion.cleanupMinion,
            moveMinion: minion.moveMinion
        };
        minion.initMinion && minion.initMinion(newMinion);
        map.minions.push(newMinion);
        return newMinion;
    }

    get countMapSpaces() {
        let { rows } = map;
        let count = 0;
        rows.forEach(row => count += row.filter(cell => cell === HALLWAY_BLOCK).length);
        return count;
    }

    onMouseOverMap(x, y) {
        const { editing, selected } = this.state;
        let inTile = false;
        if (selected && selected.item) {
            inTile = (selected.item.mapCells) ? selected.item.mapCells.includes(map.rows[y][x]) : map.rows[y][x] === HALLWAY_BLOCK;
        }
        if (editing && selected && inTile) {
            selected.x = x;
            selected.y = y;
            this.forceUpdate();
        }
    }

    onMouseOverItem(x, y, item) {
        const { editing, selected } = this.state;
        if (editing && selected) {
            selected.x = Math.floor(x / BLOCK_WIDTH);
            selected.y = Math.floor(y / BLOCK_HEIGHT);
            this.forceUpdate();
        }
    }

    checkForLair(x, y) {
        return (this.outOfBounds(x, y) ||
            map.rows[y][x] !== HALLWAY_BLOCK ||
            map.minions.find(m => m.x === x && m.y === y) ||
            map.traps.find(tr => tr.x === x && tr.y === y));
    }

    addLairToMap(x, y) {
        let { rows } = map;
        let { selected } = this.state;
        let { item } = selected;
        let count = 0;
        let i, j;
        for (j = 0; j < 2; j++) {
            for (i = 0; i < 3; i++) {
                count += (!this.checkForLair(x + i, y + j)) ? 1 : 0;
            }
        }
        if (this.spendGold(item.cost(item) * count)) {
            for (j = 0; j < 2; j++) {
                for (i = 0; i < 3; i++) {
                    if (!this.outOfBounds(x + i, y + j)) {
                        rows[y + j][x + i] = (!this.checkForLair(x + i, y + j)) ? LAIR_BLOCK : rows[y + j][x + i];
                    }
                }
            }
            map.data.lairExpanded = true;
            this.setState({ selected: null });
        }
    }

    addLabToMap(lab, x = 0, y = 0) {
        map.labs.push({
            id: createId('lab'),
            type: lab.type,
            x: x,
            y: y,
            style: randomNumber(lab.styles),
            active: true
        });
        lab.targetItems && lab.targetItems.forEach(target => {
            activateMarket(target.class, target.id, target.activate);
        });
    }

    upgradeLair(research) {
        research.research.level++;
        map.data.lairMax += 5;
    }

    tryExpandMap(cost) {
        if (cost < this.totalGold) {
            this.setState({ buyLandCost: cost });
        }
    }

    closeExpandMap() {
        this.setState({ buyLandCost: 0 });
    }

    expandMap() {
        let { expansions } = map.data;
        if (expansions < MAX_EXPANSIONS) {
            let dir = expansions % 2 ? 'rows' : 'columns';
            let cost = this.state.buyLandCost;
            if (this.spendGold(cost)) {
                if (dir === 'columns') {
                    map.rows.forEach(row => {
                        let num = MAP_INCREASE;
                        while (num > 0) {
                            row.push(ROCK_BLOCK);
                            num--;
                        }
                    });
                } else {
                    let num = MAP_INCREASE;
                    let len = map.rows[0].length;
                    while (num > 0) {
                        let row = [];
                        row.length = len;
                        row.fill(ROCK_BLOCK);
                        map.rows.push(row);
                        num--;
                    }
                }
                map.data.expansions++;
            }
        }
        this.closeExpandMap();
    }

    buyVolcanoLair(cost) {
        if (this.spendGold(cost)) {
            this.setState({ volcanicLair: true });
        }
    }

    lairCount() {
        let count = 0;
        map.rows.forEach(row => {
            count += row.filter(cell => cell === LAIR_BLOCK).length;
        });
        return count;
    }

    clearElementsFromMapSpace(x, y) {
        let { traps, minions, treasure, gems } = map;
        let idx = traps.findIndex(tr => tr.x === x && tr.y === y);
        if (idx >= 0) {
            traps.splice(idx, 1);
        }
        idx = minions.findIndex(min => min.x === x && min.y === y);
        while (idx >= 0) {
            minions.splice(idx, 1);
            idx = minions.findIndex(min => min.x === x && min.y === y)
        }
        idx = minions.findIndex(min => min.size && x >= min.x && y >= min.y && x < min.x + min.size.width && y < min.y + min.size.height);
        while (idx >= 0) {
            minions.splice(idx, 1);
            idx = minions.findIndex(min => min.size && x >= min.x && y >= min.y && x < min.x + min.size.width && y < min.y + min.size.height);
        }
        idx = treasure.findIndex(tr => tr.x === x && tr.y === y);
        if (idx >= 0) {
            treasure.splice(idx, 1);
        }
        idx = gems.findIndex(tr => tr.x === x && tr.y === y);
        if (idx >= 0) {
            gems.splice(idx, 1);
        }
    }

    clearMapElements(x, y) {
        let cost = this.state.selected.item.cost();
        if (this.tileContainsSomething(x, y) && this.spendGold(cost)) {
            this.clearElementsFromMapSpace(x, y);
        }
        if (this.tileContainsSomething(x + 1, y) && this.spendGold(cost)) {
            this.clearElementsFromMapSpace(x + 1, y);
        }
        if (this.tileContainsSomething(x, y + 1) && this.spendGold(cost)) {
            this.clearElementsFromMapSpace(x, y + 1);
        }
        if (this.tileContainsSomething(x + 1, y + 1) && this.spendGold(cost)) {
            this.clearElementsFromMapSpace(x + 1, y + 1);
        }
        this.forceUpdate();
    }

    /*TRAPS************************************************************************************/

    onClickTrap(trap) {
        if (trap.onClick) {
            trap.onClick(this, trap);
        } else {
            this.refreshTrap(trap);
        }
    }

    refreshTrap(trap, refreshScreen = true) {
        if (!trap.active && this.spendGold(trap.level)) {
            if (trap.refresh) {
                trap.refresh(this, trap);
            }
            trap.active = true;
            if (refreshScreen) {
                this.forceUpdate();
            }
            return;
        }
        if (refreshScreen && (trap.data && trap.data.dir !== undefined) && this.state.editing) {
            trap.data.dir = (trap.data.dir + 1) % 4;
            this.forceUpdate();
        }
    }

    findTrapOnMap(x, y) {
        return map.traps.find(tr => tr.x === x && tr.y === y);
    }

    cleanupTraps() {
        map.traps.forEach(trap => {
            trap.cleanup && trap.cleanup(this, trap);
        });
    }

    costToResetAllTraps() {
        let cost = 0;
        map.traps.forEach(trap => {
            if (!trap.active) {
                cost += trap.level;
            }
        });
        return cost;
    }

    resetAllTraps() {
        map.traps.forEach(trap => {
            this.refreshTrap(trap, false);
        });
        this.forceUpdate();
    }

    upgradeCaltropsCost() {
        let level = getMarketItemLevel("traps", "caltrops");
        let cost = getMarketItemCost("traps", "caltrops");
        let totalCost = 0;
        map.traps.forEach(trap => {
            if (trap.type === 'caltrops') {
                if (trap.level < level) {
                    totalCost += cost - trap.level;
                }
            }
        });
        return totalCost;
    }

    replaceAllCaltrops() {
        let level = getMarketItemLevel("traps", "caltrops");
        let cost = getMarketItemCost("traps", "caltrops");
        map.traps.forEach(trap => {
            if (trap.type === 'caltrops') {
                if (trap.level < level) {
                    if (this.spendGold(cost - trap.level)) {
                        trap.level = level;
                    }
                }
            }
        });
        this.forceUpdate();
    }

    /*TREASURE*********************************************************************************/

    findTreasure(treasure) {
        return map.treasure.find(tr => tr.id === treasure.id);
    }

    treasureInLair(treasure) {
        return map.rows[treasure.y][treasure.x] === LAIR_BLOCK;
    }

    findTreasureOnMap(x, y) {
        return map.treasure.find(tr => tr.x === x && tr.y === y);
    }

    tileContainsSomething(x, y) {
        return this.findTreasureOnMap(x, y) ||
            map.labs.find(lab => lab.x === x && lab.y === y) ||
            this.findGemstoneOnMap(x, y) ||
            this.findMinionOnMap(x, y) ||
            this.findTrapOnMap(x, y);
    }

    firstEmptyLairSpace() {
        let { rows } = map;
        let y = 0;
        let ydiff = 1;
        if (randomNumber(2) === 0) {
            y = rows.length - 1;
            ydiff = -1;
        }
        while (y >= 0 && y < rows.length) {
            let x = 0;
            let xdiff = 1;
            if (randomNumber(2) === 0) {
                x = rows[y].length - 1;
                xdiff = -1;
            }
            while (x >= 0 && x < rows[y].length) {
                let tcs = !!this.tileContainsSomething(x, y);
                if (rows[y][x] === LAIR_BLOCK && !tcs) {
                    return { x, y };
                }
                x += xdiff;
            }
            y += ydiff;
        }
        return null;
    }

    cleanupTreasure(forceTotal) {
        let { lairMax } = map.data;
        let total = forceTotal || this.totalGold;
        map.treasure = [];
        this.cleanupGems();
        let lair = this.firstEmptyLairSpace();
        while (lair && total > 0) {
            if (total > lairMax) {
                this.addTreasureToMap(lairMax, lair.x, lair.y);
                total -= lairMax;
            } else {
                this.addTreasureToMap(total, lair.x, lair.y);
                total = 0;
            }
            lair = this.firstEmptyLairSpace();
        }
    }

    checkedGems = [];

    getClosestEmptyLairSpace(x, y) {
        if (this.outOfBounds(x, y) || map.rows[y][x] !== LAIR_BLOCK || this.checkedGems.find(item => item.x === x && item.y === y)) {
            this.checkedGems.push({ x, y });
            return null;
        }
        this.checkedGems.push({ x, y });
        if (!this.tileContainsSomething(x, y)) {
            return ({ x, y });
        }
        let dir = Math.floor(Math.random() * 4);
        let dirs = DIR_DELTA;
        let pos = this.getClosestEmptyLairSpace(x + dirs[dir].x, y + dirs[dir].y);
        if (pos) {
            return pos;
        }
        pos = this.getClosestEmptyLairSpace(x + dirs[(dir + 1) % 4].x, y + dirs[(dir + 1) % 4].y);
        if (pos) {
            return pos;
        }
        pos = this.getClosestEmptyLairSpace(x + dirs[(dir + 2) % 4].x, y + dirs[(dir + 2) % 4].y);
        if (pos) {
            return pos;
        }
        pos = this.getClosestEmptyLairSpace(x + dirs[(dir + 3) % 4].x, y + dirs[(dir + 3) % 4].y);
        if (pos) {
            return pos;
        }
        return null;
    }

    cleanupGems() {
        if (map.gems.find(gem => gem.found)) {
            let gemInLair = map.gems.find(gem =>
                gem.found && !this.outOfBounds(gem.x, gem.y) && map.rows[gem.y][gem.x] === LAIR_BLOCK
            );
            if (!gemInLair) {
                gemInLair = map.gems.find(gem => gem.found && !this.outOfBounds(gem.x, gem.y));
                let lair = this.firstEmptyLairSpace();
                gemInLair.x = lair.x;
                gemInLair.y = lair.y;
            }
            map.gems.forEach(gem => {
                if (gem.found && !this.outOfBounds(gem.x, gem.y) && map.rows[gem.y][gem.x] !== LAIR_BLOCK) {
                    this.checkedGems = [];
                    let lair = this.getClosestEmptyLairSpace(gemInLair.x, gemInLair.y);
                    gem.x = lair.x;
                    gem.y = lair.y;
                }
            });

        }
    }

    findGemstoneOnMap(x, y) {
        return map.gems.find(gem => gem.x === x && gem.y === y);
    }

    get allGemsFound() {
        return map.gems.filter(gem => gem.found === true).length === GEMSTONE_TYPES.length;
    }

    get gemFound() {
        return map.gems.find(gem => gem.found === true);
    }

    closeSellGemConfirm() {
        this.setState({ outOfFunds: false });
    }

    sellGem() {
        let gemIdx = map.gems.findIndex(gem => gem.found === true);
        if (gemIdx >= 0) {
            let gem = map.gems[gemIdx];
            this.addTreasureToMap(gem.value, gem.x, gem.y, false);
            map.gems.splice(gemIdx, 1);
        }
        this.closeSellGemConfirm();
    }

    /*MESSAGE**********************************************************************************/

    displayMessage(msg) {
        this.state.log.unshift(msg);
        //console.log(msg);
    }

    initLog() {
        this.displayMessage(`starting wave ${map.wave}`);
        this.displayMessage(`you have ${map.minions.length} minions and ${this.totalGold} gold`);
        this.displayMessage('-----------------------------');
    }

    endLog() {
        const { research } = this.state;
        let lairGold = map.data.lairMax * this.lairCount();
        this.displayMessage('-----------------------------');
        this.gemMessages.forEach(msg => this.displayMessage(msg));
        this.displayMessage(`You earned ${this.totalGold} gold${this.totalGold > lairGold ? `, but only can hold ${lairGold} gold in your lair.` : '.'}`);
        research.forEach(r => this.displayMessage(` ⚈ ${r.text}`));
        this.displayMessage('Sucessfully researched:');
        let types = ['goblin', 'hireling', 'troll', 'spider', 'dragon'];
        types.forEach(type => {
            let count = map.minions.filter(min => min.type === type).length;
            if (count > 0) {
                this.displayMessage(` ⚈ ${count} ${type}${count === 1 ? '' : 's'}`);
            }
        });
        this.displayMessage(`you have ${map.minions.length} minions/creatrues`);
        this.displayMessage(`ending wave ${map.wave}`);
    }


    /*INFO*************************************************************************************/

    showInfo(item, title) {
        this.setState({
            info: {
                title,
                text: `${item.value} Gold`
            }
        });
    }

    /*RENDER***********************************************************************************/

    get showLoadButton() {
        const { editing } = this.state;
        return editing && map.rows && map.rows.length > 0 && window.localStorage.getItem('map') && window.localStorage.getItem('market');
    }

    get loadButtonText() {
        return `Load Game (Wave: ${window.localStorage.getItem('wave')}, Gold: ${window.localStorage.getItem('gold')})`;
    }

    upgradeCaltropsUnlocked() {
        return map.data.replaceableCaltrops;
    }

    render() {
        const { editing, selected, research, buyLandCost, outOfFunds, volcanicLair } = this.state;
        const showMarket = (editing && map.rows && map.rows.length > 0);
        const showOverlay = editing && selected;
        const showEndButton = !editing && map.heroes.length === 0 && this.totalGold > 0;
        const showWelcomePopup = !window.localStorage.getItem('map');
        const showYouLose = (map.heroes.length === 0 && this.totalGold === 0);
        const showGemWin = (map.heroes.length === 0 && this.allGemsFound);
        const showLevel100Win = (map.heroes.length === 0 && map.wave > 99);
        const trapResetCost = this.costToResetAllTraps();
        const showResetTrapButton = showMarket && trapResetCost > 0;
        const caltropUpgradeCost = this.upgradeCaltropsCost();
        const showCaltropButton = showMarket && caltropUpgradeCost > 0 && this.upgradeCaltropsUnlocked();
        const clearMapSelected = selected && selected.item && selected.item.id === "clear";
        return (
            <div >
                <BlockList onClick={this.onClickMap.bind(this)} onMouseOver={this.onMouseOverMap.bind(this)} />
                <TrapsList map={map} onClick={(item) => this.onClickTrap(item)} onMouseOver={clearMapSelected ? this.onMouseOverItem.bind(this) : () => { }} />
                <LabList map={map} onMouseOver={clearMapSelected ? this.onMouseOverItem.bind(this) : () => { }} />
                <TreasureList map={map} onMouseOver={clearMapSelected ? this.onMouseOverItem.bind(this) : () => { }} />
                {!editing && <HeroesList map={map} />}
                <MinionsList map={map} editing={editing} onClick={(item) => this.onClickMinion(item)} onMouseOver={clearMapSelected ? this.onMouseOverItem.bind(this) : () => { }} />
                {showOverlay && <Overlay x={selected.x} y={selected.y} type={selected.item.id} onClick={this.onClickMap.bind(this)} />}
                <EffectsList map={map} />
                {!editing && <InfoBox
                    x={map.rows[0].length * BLOCK_WIDTH}
                    gold={this.totalGold}
                    wave={map.wave}
                    heroes={map.heroes}
                    log={this.state.log}
                    research={research}
                />}
                {showMarket && <Market
                    x={map.rows[0].length * BLOCK_WIDTH}
                    selected={selected}
                    gold={this.totalGold}
                    gems={this.totalGems}
                    wave={map.wave}
                    onClick={(item) => this.onClickMarketItem(item)}
                    onResearch={(item) => this.researchMarketItem(item)}
                    research={research}
                    reputation={map.reputation}
                    showReputation={map.data.gossip}
                />}
                {showMarket && <GameButton
                    x={map.rows[0].length * BLOCK_WIDTH}
                    y={map.rows.length * BLOCK_HEIGHT}
                    text={`Start Wave ${map.wave + 1}`}
                    onClick={() => this.startNextWave()}
                />}
                {this.showLoadButton && <GameButton
                    x={map.rows[0].length * BLOCK_WIDTH + 130}
                    y={map.rows.length * BLOCK_HEIGHT}
                    text={this.loadButtonText}
                    onClick={() => this.loadGame()}
                />}
                {showEndButton && <GameButton
                    x={map.rows[0].length * BLOCK_WIDTH}
                    y={map.rows.length * BLOCK_HEIGHT}
                    text={`Got it!`}
                    onClick={() => this.setState({ editing: true, log: [] })}
                />}
                {showResetTrapButton && <GameButton
                    x={map.rows[0].length * BLOCK_WIDTH}
                    y={map.rows.length * BLOCK_HEIGHT + 30}
                    text={`Reset All Traps (Cost: $${trapResetCost})`}
                    onClick={() => this.resetAllTraps()}
                />}
                {showCaltropButton && <GameButton
                    x={map.rows[0].length * BLOCK_WIDTH + (showResetTrapButton ? 220 : 0)}
                    y={map.rows.length * BLOCK_HEIGHT + 30}
                    text={`Replace All Caltrops (Cost: $${caltropUpgradeCost})`}
                    onClick={() => this.replaceAllCaltrops()}
                />}
                {false && <GameButton
                    text={"Begin the Testing Arena"}
                    x={map.rows[0].length * BLOCK_WIDTH}
                    y={(map.rows.length * BLOCK_HEIGHT) + 40}
                    onClick={() => startArena(this)}
                />}
                <WelcomeModal open={showWelcomePopup} />
                <YouLoseModal open={showYouLose} />
                <GemstoneWinModal open={showGemWin} />
                <Level100WinModal open={showLevel100Win} />
                <VolcanicLairWinModal open={volcanicLair} />
                {buyLandCost > 0 && <BuyLandConfirm cost={buyLandCost} onCancel={() => this.closeExpandMap()} onOK={() => this.expandMap()} />}
                {outOfFunds && <SellGemConfirm onCancel={() => this.closeSellGemConfirm()} onOK={() => this.sellGem()} />}
            </div>
        );
    }
}

function BlockList({ onClick, onMouseOver }) {
    let blocks = [];
    onClick = onClick || (() => { });
    onMouseOver = onMouseOver || (() => { });
    map.rows && map.rows.forEach((row, y) => row.forEach((block, x) => {
        blocks.push(<Block key={`block-${x}-${y}`} x={x} y={y} type={block} onClick={onClick} onMouseOver={onMouseOver} />);
    }));
    return blocks;
}

function GameButton({ x, y, text, onClick }) {
    return <button className="start-button" style={{ left: x, top: y }} onClick={onClick}>{text}</button>;
}

export default Level;
