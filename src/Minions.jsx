import React from 'react';
import ReactTooltip from "react-tooltip";
import './Block.css';
import './Traps.css';
import './Effects.css';
import './InfoBox.css';
import GoblinImage1 from './images/minions/goblin1.png';
import GoblinImage2 from './images/minions/goblin2.png';
import OrcHirelingImage from './images/minions/orchireling.png';
import HirelingImage1 from './images/minions/hireling1.png';
import HirelingImage2 from './images/minions/hireling2.png';
import HirelingImage3 from './images/minions/hireling3.png';
import DwarfImage1 from './images/minions/dwarf1.png';
import DwarfImage2 from './images/minions/dwarf2.png';
import TrollImage from './images/minions/troll.png';
import DirArrowImage from './images/itemDir.png';
import { BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber, DIR_DELTA, DIR_STR } from './constants';
import { weaponDamage, WEAPON_STYLES } from './Weapons';
import { map, SLOW_SPEED, NORMAL_SPEED, FAST_SPEED } from './Level';
import { Spider, Dragon } from './Creatures';
let classNames = require('classnames');

export default function MinionsList({ map, editing, onClick, onMouseOver }) {
    let items = [];
    onMouseOver = onMouseOver || (() => { });
    onClick = onClick || (() => { });
    map.minions && map.minions.forEach((item) => {
        let { id, type } = item;
        switch (type) {
            default:
            case 'goblin':
                items.push(<Goblin key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'hireling':
                items.push(<Hireling key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'dwarf':
                items.push(<Dwarf key={id} item={item} editing={editing} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'troll':
                items.push(<Troll key={id} item={item} editing={editing} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'spider':
                items.push(<Spider key={id} item={item} editing={editing} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'dragon':
                items.push(<Dragon key={id} item={item} editing={editing} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
        }
    });
    return items;
}

export const GOBLIN_STYLES = [GoblinImage1, GoblinImage2];

function Goblin({ item, onClick, onMouseOver }) {
    let { id, level, health, infoBox, market, weapon } = item;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let classname = classNames(item.market ? "market-trap" : "block");
    let wo = { x: 2, y: 4 };
    let image = GOBLIN_STYLES[item.style];
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
            >
                <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`goblin`} />
                {weapon && <img src={WEAPON_STYLES[weapon]} className={classname} style={{ left: `${x + wo.x}px`, top: `${y + wo.y}px` }} alt={`club`} />}
            </div>
            {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                <div>{`Level ${level} Goblin`}</div>
                <div>{`${health} hit points`}</div>
            </ReactTooltip>}
        </div>
    );
}

export const HIRELING_STYLES = [HirelingImage1, HirelingImage2, HirelingImage3];
export const HIRELING_STARTING_WEAPONS = ['club', 'mace'];

function Hireling({ item, onClick, onMouseOver }) {
    let { id, level, health, infoBox, market, weapon } = item;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let classname = classNames(item.market ? "market-trap" : "block");
    let image = (item.ancestry === 'orc') ? OrcHirelingImage : HIRELING_STYLES[item.style];
    onClick = onClick || (() => { });
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onMouseEnter={() => onMouseOver(x, y, item)}
                onClick={() => onClick(item)}>
                <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`hireling`} />
                {weapon && <img src={WEAPON_STYLES[weapon]} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`weapon`} />}
            </div>
            {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                <div>{`Level ${level} ${item.ancestry} Hireling`}</div>
                <div>{`${health} hit points`}</div>
            </ReactTooltip>}
        </div>
    );
}

export const DWARF_STYLES = [DwarfImage1, DwarfImage2];

function Dwarf({ item, onClick, onMouseOver, editing }) {
    let { id, level, health, infoBox, market, digDir } = item;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let classname = classNames(item.market ? "market-trap" : "block");
    let image = DWARF_STYLES[item.style];
    let wo = { x: 2, y: 4 };
    let arrowClasses = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let showArrow = !market && editing;
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onMouseEnter={() => onMouseOver(x, y, item)}
                onClick={() => onClick(item)}>
                {showArrow && <img src={DirArrowImage} className={classNames("block", arrowClasses[digDir])} style={{ left: `${x}px`, top: `${y}px` }} alt={`arrow`} />}
                <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`dwarf`} />
                {!market && <img src={WEAPON_STYLES['pickaxe']} className={classname} style={{ left: `${x + wo.x}px`, top: `${y + wo.y}px` }} alt={`weapon`} />}
            </div>
            {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                <div>{`Level ${level} Dwarf`}</div>
                <div>{`Digging ${DIR_STR[digDir]}`}</div>
                <div>{`${health} hit points`}</div>
            </ReactTooltip>}
        </div>
    );
}

function Troll({ item, onClick, onMouseOver }) {
    let { id, level, health, infoBox, market, weapon } = item;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let classname = classNames(item.market ? "market-trap" : "block");
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onMouseEnter={() => onMouseOver(x, y, item)}
                onClick={() => onClick(item)}>
                <img src={TrollImage} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`dwarf`} />
                {weapon && <img src={WEAPON_STYLES['club']} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`weapon`} />}
            </div>
            {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                <div>{`Level ${level} Troll`}</div>
                <div>{`${health} hit points`}</div>
            </ReactTooltip>}
        </div>
    );
}

/*****************************************************************************************************/

export function moveMinion(level, minion) {
    minion.spturn = (minion.spturn + 1) % minion.speed;
    if (minion.spturn === 0 && minion.active) {
        switch (minion.mode) {
            default:
            case 'smarter-random':
                moveMinionSmarterRandom(level, minion);
                break;
            case 'random':
                moveMinionRandom(level, minion);
                break;
            case 'dig':
                moveMinionDig(level, minion);
                break;
            case 'special':
                minion.moveMinion && minion.moveMinion(level, minion);
                break;
        }
        if (!minion.pacifist) {
            attackHeroes(level, minion);
        }
        minion.specialAction && minion.specialAction(level, minion);
    }
}

function moveMinionSmarterRandom(level, minion) {
    let dir = Math.floor(Math.random() * 4);
    let dirs = DIR_DELTA;
    let iterations = 0;
    let checkNum = randomNumber(3);

    let hero = map.heroes.find(h => h.x === minion.x && h.y === minion.y);
    if (hero && checkNum < 2) {
        return;
    }

    while (iterations < 4 && checkNum < 2) {
        let x = minion.x + dirs[dir].x;
        let y = minion.y + dirs[dir].y;
        let hero = map.heroes.find(h => h.x === x && h.y === y);
        if (hero && map.rows[y][x] === ' ') {
            minion.x = x;
            minion.y = y;
            return;
        }
        dir = (dir + 1) % 4;
        iterations++;
    }

    moveMinionRandom(level, minion);
}

function moveMinionRandom(level, minion) {
    let { x, y } = minion;
    let { rows } = map;
    let dir = Math.floor(Math.random() * 4);
    x += DIR_DELTA[dir].x;
    y += DIR_DELTA[dir].y;

    if (randomNumber(100) < minion.chanceOfStay) {
        return;
    }

    let iterations = 0;
    let check = (x, y) => {
        let ret = (level.outOfBounds(x, y) || rows[y][x] !== ' ');
        return ret;
    }

    while (check(x, y) && iterations < 4) {
        dir = (dir + 1) % 4;
        x = minion.x + DIR_DELTA[dir].x;
        y = minion.y + DIR_DELTA[dir].y;
        iterations++;
    }

    if (iterations < 4) {
        minion.x = x;
        minion.y = y;
    }
}

export function attackHeroes(level, minion) {
    let hero = map.heroes.find(h => h.x === minion.x && h.y === minion.y);
    if (hero) {
        let damage = minion.strength;
        damage += weaponDamage(minion.weapon);
        minion.levelUp = minion.levelUp || level.heroTakesDamage(hero, damage, minion.type);
        if (minion.venemous) {
            level.heroIsPoisoned(hero, Math.floor(minion.level / 8) + 1, minion.type);
        }
    }
}

export function loadMinions() {
    map.minions.forEach(min => {
        min.move = (level, minion) => moveMinion(level, minion);
        switch (min.type) {
            default:
                break;
            case 'goblin':
                min.specialAction = (level, goblin) => possiblyProcreate(level, goblin);
                min.specialReset = (goblin) => resetGoblin(goblin);
                min.cleanupMinion = (level, goblin) => cleanupGoblin(level, goblin);
                min.initMinion = (goblin) => initGoblin(goblin);
                break;
            case 'hireling':
                min.cleanupMinion = (level, hireling) => cleanupHireling(level, hireling);
                min.initMinion = (hireling) => initHireling(hireling);
                break;
            case 'dwarf':
                min.cleanupMinion = (level, minion) => cleanupDwarf(level, minion);
                min.initMinion = (minion) => initDwarf(minion);
                break;
            case 'troll':
                min.cleanupMinion = (level, minion) => cleanupTroll(level, minion);
                min.initMinion = (minion) => initTroll(minion);
                min.specialAction = (level, troll) => extraTrollAttack(level, troll);
                break;
        }
    });
}

/*GOBLINS******************************************************************************/

export function possiblyProcreate(level, goblin) {
    if (goblin.procreated || goblin.level === 0) {
        return;
    }
    let partner = map.minions.find(min => min.x === goblin.x && min.y === goblin.y && min.id !== goblin.id && min.type === 'goblin' && min.level > 0 && !min.procreated);
    if (partner && randomNumber(6) === 0 && map.minions.length < map.wave * 3) {
        let newborn = level.addMinionToMap({
            type: 'goblin',
            level: Math.min(goblin.level, partner.level) - 1,
            style: randomNumber(GOBLIN_STYLES.length),
            specialAction: goblin.specialAction,
            specialReset: goblin.specialReset,
            initMinion: goblin.initMinion,
            cleanupMinion: goblin.cleanupMinion
        }, goblin.x, goblin.y);
        newborn.procreated = true;
        goblin.procreated = partner.procreated = true;
        level.displayMessage(`A level ${newborn.level} goblin has been born!!`);
    }
}

export function resetGoblin(goblin) {
    goblin.procreated = false;
}

export function initGoblin(goblin) {
    goblin.weapon = goblin.level > 0 && randomNumber(5) <= 2 ? 'club' : null;
    goblin.health = goblin.level * 4 + 2 + randomNumber(Math.max(goblin.level, 6));
    goblin.health = Math.max(goblin.health, 3);
    goblin.maxHealth = goblin.health;
    goblin.strength = goblin.level + 2;
    goblin.chanceOfStay = 0;
    goblin.style = randomNumber(GOBLIN_STYLES.length);
    goblin.speed = randomNumber(6) === 0 ? FAST_SPEED : NORMAL_SPEED;
}

export function cleanupGoblin(level, minion) {
    level.spendGold(Math.floor(minion.level / 5));
    if (minion.levelUp || minion.level < map.wave - 10 || minion.level === 0) {
        minion.health = minion.maxHealth + 5 + randomNumber(Math.max(minion.level, 4));
        minion.level++;
        minion.strength++;
        minion.maxHealth = minion.health;
    } else {
        minion.health = minion.maxHealth;
    }
    if (!minion.weapon) {
        minion.weapon = randomNumber(5) === 0 ? 'club' : null;
    }
}

/*HIRELINGS******************************************************************************/

export function initHireling(hireling) {
    hireling.weapon = randomNumber(3) <= 1 ? HIRELING_STARTING_WEAPONS[randomNumber(HIRELING_STARTING_WEAPONS.length)] : null;
    hireling.health = hireling.level * 10 + randomNumber(10);
    hireling.strength = hireling.level + Math.floor(hireling.level / 2);
    hireling.chanceOfStay = 0;
    hireling.maxHealth = hireling.health;
    hireling.speed = NORMAL_SPEED;
    hireling.mode = 'smarter-random';
    hireling.style = randomNumber(HIRELING_STYLES.length);
    setHirelingAncestry(hireling);
}

function setHirelingAncestry(hireling) {
    hireling.ancestry = randomNumber(4) === 0 ? 'orc' : 'human';
    if (hireling.ancestry === 'orc') {
        hireling.health += Math.floor(hireling.level * 3 / 2);
    } else {
        hireling.strength += Math.floor((hireling.level + 1) / 2);
    }
}

export function cleanupHireling(level, minion) {
    level.spendGold(Math.floor((Math.floor(minion.level / 3))));
    if (minion.levelUp) {
        minion.level++;
        minion.health = minion.level * 10 + randomNumber(10) - 3;
        if (minion.ancestry === 'orc') {
            minion.health += Math.floor(minion.level * 3 / 2);
        }
        minion.strength += (minion.ancestry === 'human') ? 2 : 1;
        minion.maxHealth = minion.health;
    } else {
        minion.health = minion.maxHealth;
    }
    if (minion.weapon && minion.weapon !== 'sword') {
        minion.weapon = randomNumber(4) === 0 ? 'sword' : null;
    }
    if (!minion.weapon) {
        minion.weapon = randomNumber(4) === 0 ? HIRELING_STARTING_WEAPONS[randomNumber(HIRELING_STARTING_WEAPONS.length)] : null;
    }
}


/*DWARVES******************************************************************************/

export function initDwarf(dwarf) {
    dwarf.weapon = 'pickaxe';
    dwarf.health = dwarf.level * 8 + randomNumber(20);
    dwarf.maxHealth = dwarf.health;
    dwarf.speed = NORMAL_SPEED;
    dwarf.mode = 'dig';
    dwarf.digDir = 0;
    dwarf.pacifist = true;
    dwarf.style = randomNumber(DWARF_STYLES.length);
    dwarf.onClick = (level, minion) => onClickDwarf(level, minion);
}

export function cleanupDwarf(level, minion) {
    map.minions = map.minions.filter(min => min.id !== minion.id);
}

export function onClickDwarf(level, dwarf) {
    if (level.state.editing) {
        dwarf.digDir = (dwarf.digDir + 1) % DIR_STR.length;
        level.forceUpdate();
    }
}

export function moveMinionDig(level, minion) {
    let x = minion.x + DIR_DELTA[minion.digDir].x;
    let y = minion.y + DIR_DELTA[minion.digDir].y;
    if (!level.outOfBounds(x, y) && map.rows[y][x] !== 'x' && map.rows[y][x] !== '+') {
        minion.x = x;
        minion.y = y;
        return;
    }

    if (randomNumber(40 - (minion.level * 2)) <= 2) {
        if (randomNumber(10 + minion.level) <= 2) {
            let dir = randomNumber(2) === 0 ? (minion.digDir + 1) % DIR_DELTA.length : (minion.digDir + 3) % DIR_DELTA.length;
            x = minion.x + DIR_DELTA[dir].x;
            y = minion.y + DIR_DELTA[dir].y;
        }

        if (!level.outOfBounds(x, y) && map.rows[y][x] === 'x') {
            minion.x = x;
            minion.y = y;
            map.rows[y][x] = ' ';
            let gem = level.findGemstoneOnMap(x, y);
            let vowels = 'aeiou';
            if (gem && !gem.found) {
                let msg = `Your dwarf found ${vowels.includes(gem.type[0]) ? 'an' : 'a'} ${gem.type} worth ${gem.value} gold!`;
                level.gemMessages.push(msg);
                level.displayMessage(msg);
                gem.found = true;
            }
        }
    }
}

/*TROLLS******************************************************************************/

export function initTroll(troll) {
    troll.weapon = randomNumber(3) <= 1 ? 'club' : null;
    troll.health = troll.level * 15 + randomNumber(10);
    troll.strength = troll.level * 4 + randomNumber(3);
    troll.maxHealth = troll.health;
    troll.chanceOfStay = 60;
    troll.speed = SLOW_SPEED;
    troll.mode = 'random';
}

export function cleanupTroll(level, minion) {
    level.spendGold(Math.floor(minion.level / 3));
    if (minion.levelUp) {
        minion.health = minion.maxHealth + 10 + randomNumber(10);
        minion.level++;
        minion.strength += randomNumber(3) + 1;
        minion.maxHealth = minion.health;
    } else {
        minion.health = minion.maxHealth;
    }
    if (!minion.weapon) {
        minion.weapon = 'club';
    } else {
        minion.weapon = 'mace';
    }
}

export function extraTrollAttack(level, minion) {
    let attacks = Math.min(randomNumber(minion.level) + 1, Math.floor(map.wave / 4) + 1);

    while (attacks > 0) {
        attacks--;
        let dir = Math.floor(Math.random() * 4);
        let dirs = DIR_DELTA;
        let hero = map.heroes.find(h => h.x === minion.x + dirs[dir].x && h.y === minion.y + dirs[dir].y);
        if (hero) {
            let damage = minion.strength;
            damage += weaponDamage(minion.weapon);
            minion.levelUp = minion.levelUp || level.heroTakesDamage(hero, damage, minion.type);
        }

        let target = map.minions.find(m => m.x === minion.x + dirs[dir].x && m.y === minion.y + dirs[dir].y && m.type !== 'troll');
        if (target && randomNumber(10) === 0) {
            let damage = minion.strength;
            damage += weaponDamage(minion.weapon);
            level.minionTakesDamage(target, damage, minion.type);
        }
    }
}
