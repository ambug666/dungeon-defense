import React from 'react';
import ReactTooltip from "react-tooltip";
import './Block.css';
import './Traps.css';
import ArrowTrapImage from './images/traps/arrowtrap.png';
import GasTrapImage from './images/traps/gastrap.png';
import CaltropsTrapImage from './images/traps/caltrops.png';
import BoulderTrapImage from './images/traps/bouldertrap.png';
import DirArrowImage from './images/itemDir.png';
import WebImage from './images/traps/web.png';
import { BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber, DIR_DELTA } from './constants';
import { map } from './Level';
import { market, labsOnMap } from './Market';
import { ROCK_BLOCK } from './Block';
import { moveArrow, moveBoulder, handleGasCloud, activateGasCloud } from './Effects';
let classNames = require('classnames');

export default function TrapsList({ map, onClick, onMouseOver }) {
    let items = [];
    onMouseOver = onMouseOver || (() => { });
    map.traps && map.traps.forEach((item) => {
        let { id, type } = item;
        switch (type) {
            case 'arrow':
                items.push(<ArrowTrap key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'gas':
                items.push(<GasTrap key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'caltrops':
                items.push(<Caltrops key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'boulder':
                items.push(<BoulderTrap key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            case 'web':
                items.push(<WebTrap key={id} item={item} onClick={onClick} onMouseOver={onMouseOver} />);
                break;
            default:
                break;
        }
    });
    return items;
}

function ArrowTrap({ item, onClick, onMouseOver }) {
    let { id, level, active } = item;
    let { dir, uses } = item.data;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    onClick = onClick || (() => { });
    onMouseOver = onMouseOver || (() => { });
    let arrowDirs = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let classname = classNames(item.market ? "market-trap" : "block", item.active ? "" : "inactive-trap", arrowDirs[dir]);
    return (
        <div>
            <div
                className={classname} style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
                data-tip data-for={`tooltip-${id}`}
            >
                <img src={ArrowTrapImage} alt={`arrow trap`} />
            </div>
            {!item.market && <ReactTooltip id={`tooltip-${id}`}>
                <div>{`Level ${level} Arrow Trap`}</div>
                <div>{active ? 'Active' : 'Inactive - Click to Refresh'}</div>
                {active && <div>{uses} Uses Remaining</div>}
            </ReactTooltip>}
        </div>
    );
}

function GasTrap({ item, onClick, onMouseOver }) {
    let { id, level, active } = item;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    onClick = onClick || (() => { });
    let classname = classNames(item.market ? "market-trap" : "block", item.active ? "" : "inactive-trap");
    return (
        <div>
            <div
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
                data-tip data-for={`tooltip-${id}`}>
                <img src={GasTrapImage} alt={`gas trap`} className={classname} style={{ left: `${x}px`, top: `${y}px` }} />
            </div>
            {!item.market && <ReactTooltip id={`tooltip-${id}`}>
                <div>{`Level ${level} Gas Trap`}</div>
                <div>{active ? 'Active' : 'Inactive - Click to Refresh'}</div>
            </ReactTooltip>}
        </div>
    );
}

function BoulderTrap({ item, onClick, onMouseOver }) {
    let { id, level, active } = item;
    let { dir } = item.data;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    onClick = onClick || (() => { });
    let arrowClasses = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let showArrow = !item.market;
    let classname = classNames(item.market ? "market-trap" : "block", item.active ? "" : "inactive-trap");
    return (
        <div>
            <div
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
                data-tip data-for={`tooltip-${id}`}
            >
                <img className={classname} style={{ left: `${x}px`, top: `${y}px` }} src={BoulderTrapImage} alt={`rolling boulder trap`} />
                {showArrow && <img src={DirArrowImage} className={classNames("block", arrowClasses[dir])} style={{ left: `${x}px`, top: `${y}px` }} alt={`arrow`} />}
            </div>
            {!item.market && <ReactTooltip id={`tooltip-${id}`}>
                <div>{`Level ${level} Rolling Boulder Trap`}</div>
                <div>{active ? 'Active' : 'Inactive - Click to Refresh'}</div>
            </ReactTooltip>}
        </div>
    );
}

function Caltrops({ item, onClick, onMouseOver }) {
    let { id, level } = item;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    onClick = onClick || (() => { });
    let classname = classNames(item.market ? "market-trap" : "block");
    return (
        <div>
            <div
                className={classname}
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
                data-tip data-for={`tooltip-${id}`}
            >
                <img src={CaltropsTrapImage} alt={`caltrops`} />
            </div>
            {!item.market && <ReactTooltip id={`tooltip-${id}`}>
                <div>{`Level ${level} Caltrops`}</div>
            </ReactTooltip>}
        </div>
    );
}

function WebTrap({ item, onClick, onMouseOver }) {
    let { id, level } = item;
    let { dir } = item.data;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    onClick = onClick || (() => { });
    let arrowDirs = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let classname = classNames(item.market ? "market-trap" : "block", item.active ? "" : "inactive-trap", arrowDirs[dir]);
    return (
        <div>
            <div
                className={classname}
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => onClick(item)}
                onMouseEnter={() => onMouseOver(x, y, item)}
                data-tip data-for={`tooltip-${id}`}
            >
                <img src={WebImage} alt={`webs`} />
            </div>
            {!item.market && <ReactTooltip id={`tooltip-${id}`}>
                <div>{`Level ${level} Web`}</div>
            </ReactTooltip>}
        </div>
    );
}

export function loadTraps() {
    map.traps.forEach(tr => {
        switch (tr.type) {
            default:
            case 'caltrops':
                tr.activate = (level, trap, hero) => activateCaltrops(level, trap, hero);
                tr.onClick = (level, trap) => replaceCaltrops(level, trap);
                break;
            case 'arrow':
                tr.activate = (level, trap, hero) => activateArrowTrap(level, trap, hero);
                tr.refresh = (level, trap) => refreshArrowTrap(level, trap);
                break;
            case 'gas':
                tr.activate = (level, trap, hero) => activateGasTrap(level, trap, hero);
                break;
            case 'boulder':
                tr.activate = (level, trap, hero) => activateRollingBoulderTrap(level, trap, hero);
                break;
            case 'web':
                tr.activate = (level, trap, hero) => activateWeb(level, trap, hero);
                tr.addToMap = (level, trap) => addWebToMap(level, trap);
                tr.cleanup = (level, trap) => cleanupWeb(level, trap);
                break;
        }
    });
}

/*****************************************************************************/

export function activateArrowTrap(level, trap, hero) {
    if (trap.active) {
        let x = trap.x;
        let y = trap.y;
        let dir = trap.data.dir;
        trap.data.uses -= 1;
        let backdir = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }];
        while (!level.outOfBounds(x, y) && map.rows[y][x] !== 'x') {
            x += backdir[dir].x;
            y += backdir[dir].y;
        }
        if (level.outOfBounds(x, y)) {
            y = Math.max(y, 0);
            y = Math.min(y, map.rows.length - 1);
            x = Math.max(x, 0);
            x = Math.min(x, map.rows[y].length - 1);
        }
        let i;
        for (i = 0; i < trap.data.quantity; i++) {
            let offset = randomNumber(15) - 8;
            let damage = trap.level;
            damage += randomNumber(3) === 0 ? Math.floor(trap.level / 2) : 0;
            level.addEffectToMap({
                type: 'arrow',
                level: damage,
                handle: (level, arrow) => moveArrow(level, arrow),
                data: {
                    targetClass: 'heroes',
                    dir,
                    delay: i,
                    offset: { x: (dir === 2 || dir === 0) ? offset : 0, y: (dir === 1 || dir === 3) ? offset : 0 }
                }
            }, x, y);
        }
    }
    trap.active = (trap.data.uses > 0);
}

export function activateGasTrap(level, trap, hero) {
    let { x, y } = trap;
    let i, j;
    if (trap.active) {
        let spread = getGasSpread(trap.data.size);
        x = x - 1;
        y = y - 1;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                if (!level.outOfBounds(x + i, y + j) && map.rows[y + j][x + i] !== ROCK_BLOCK && spread[j][i] === 1) {
                    level.addEffectToMap({
                        type: 'gas',
                        level: trap.level,
                        handle: (level, cloud) => handleGasCloud(level, cloud),
                        activate: (level, cloud, hero) => activateGasCloud(level, cloud, hero),
                        data: {
                            turns: trap.data.duration + randomNumber(5)
                        }
                    }, x + i, y + j);
                }
            }
        }
    }
    trap.active = false;
}

function getGasSpread(size) {
    let spread = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    if (size === 4) {
        let x = randomNumber(2);
        let y = randomNumber(2);
        spread[y][x] = 1;
        spread[y][x + 1] = 1;
        spread[y + 1][x] = 1;
        spread[y + 1][x + 1] = 1;
    }
    if (size === 5) {
        return [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
    }
    if (size === 6) {
        let type = randomNumber(4);
        switch (type) {
            default:
            case 0:
                return ([[1, 1, 1], [1, 1, 1], [0, 0, 0]]);
            case 1:
                return ([[0, 0, 0], [1, 1, 1], [1, 1, 1]]);
            case 2:
                return ([[1, 1, 0], [1, 1, 0], [1, 1, 0]]);
            case 3:
                return ([[0, 1, 1], [0, 1, 1], [0, 1, 1]]);
        }
    }
    if (size === 7) {
        spread = (randomNumber(2) === 0) ?
            [[1, 1, 1], [0, 1, 0], [1, 1, 1]] :
            [[1, 0, 1], [1, 1, 1], [1, 0, 1]];
    }
    if (size === 8) {
        spread = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        let x = randomNumber(2) ? 0 : 2;
        let y = randomNumber(2) ? 2 : 0;
        spread[y][x] = 0;
    }
    if (size === 9) {
        return [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
    }
    return spread;
}

export function refreshArrowTrap(level, trap) {
    trap.data.uses = 3 + randomNumber(Math.floor(trap.level / 3) + 1);
}

export function activateCaltrops(level, trap, hero) {
    if (randomNumber(8 + hero.level - trap.level) < hero.health) {
        level.heroTakesDamage(hero, trap.level, 'pile of caltrops');
    }
}

export function activateRollingBoulderTrap(level, trap, hero) {
    if (trap.active) {
        let x = trap.x;
        let y = trap.y;
        let dir = trap.data.dir;
        trap.data.uses -= 1;
        while (!level.outOfBounds(x, y) && map.rows[y][x] !== 'x') {
            x -= DIR_DELTA[dir].x;
            y -= DIR_DELTA[dir].y;
        }
        if (level.outOfBounds(x, y)) {
            y = Math.max(y, 0);
            y = Math.min(y, map.rows.length - 1);
            x = Math.max(x, 0);
            x = Math.min(x, map.rows[y].length - 1);
        }
        level.addEffectToMap({
            type: 'boulder',
            level: trap.level,
            handle: (level, boulder) => moveBoulder(level, boulder),
            data: {
                delay: true,
                targetClass: 'heroes',
                dir,
                rotate: dir
            }
        }, x, y);
    }
    trap.active = (trap.data.uses > 0);
}

/*****************************************************************************/

export function addWebToMap(level, trap) {
    let { rows } = map;
    let { x, y } = trap;
    let dircheck = [
        [{ x: 1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: 0 },],
        [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 0 },],
        [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 0 }],
        [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: 0 }]];
    let dir = 0;
    for (dir = 0; dir < dircheck.length; dir++) {
        let good = dircheck[dir].reduce(((check, pos) => check && !level.outOfBounds(x + pos.x, y + pos.y) && rows[y + pos.y][x + pos.x] === 'x'), true);
        if (good) {
            trap.data.dir = dir;
            return;
        }
    }
    for (dir = 0; dir < dircheck.length; dir++) {
        let pos = dircheck[dir][0];
        if (!level.outOfBounds(x + pos.x, y + pos.y) && rows[y + pos.y][x + pos.x] === 'x') {
            trap.data.dir = dir;
            return;
        }
    }
    trap.data.dir = randomNumber(dircheck.length);
}

export function activateWeb(level, trap, hero) {
    if (!trap.data.hero) {
        hero.web = trap;
        hero.webbed += trap.level * 3;
        if (map.wave > 20) {
            hero.webbed = Math.min(hero.webbed, map.wave);
        }
        trap.data.hero = hero;
    }
}

export function cleanupWeb(level, trap) {
    trap.data.hero = null;
}

/*****************************************************************************/

export function researchTrap(level, research) {
    if (level.spendGold(research.cost(research))) {
        let item = market.traps.find(trap => trap.id === research.trapId);
        level.beginResearch({
            text: research.text || `Level ${item.level + 1} ${item.name}`,
            trap: item,
            research: research
        });
    }
}

export function upgradeTrap(level, researchItem, labType) {
    let { trap } = researchItem;
    let num = labType ? labsOnMap(labType) + 1 : 1;
    trap.level += num;
    trap.level = Math.min(trap.level, map.wave + 1);
    map.traps.forEach(tr => {
        if (tr.type === trap.type) {
            tr.level = trap.level;
        }
    });
}

export function upgradeCaltrops(level, researchItem) {
    let { trap } = researchItem;
    trap.level++;
}

export function allowReplaceableCaltrops(level, researchItem) {
    map.data.replaceableCaltrops = true;
}

export function replaceCaltrops(level, trap) {
    let item = level.state.selected && level.state.selected.item;
    if (map.data.replaceableCaltrops && item && item.id === 'caltrops' && item.level > trap.level) {
        if (level.spendGold(item.cost(item) - trap.level)) {
            trap.level = level.state.selected.item.level;
            level.forceUpdate();
        }
    }
}

export function upgradeGasTrapSize(level, researchItem) {
    let { trap } = researchItem;
    trap.data.size++;
    map.traps.forEach(tr => {
        if (tr.type === trap.type) {
            tr.data.size = trap.data.size;
        }
    });
}

export function upgradeGasTrapDuration(level, researchItem) {
    let { trap } = researchItem;
    trap.data.duration = 9;
    map.traps.forEach(tr => {
        if (tr.type === trap.type) {
            tr.data.duration = trap.data.duration;
        }
    });
    map.data.upgradedGasTrapDuration = true;
}

export function upgradeArrowTrapQuantity(level, researchItem) {
    let { trap } = researchItem;
    trap.data.quantity++;
    map.traps.forEach(tr => {
        if (tr.type === trap.type) {
            tr.data.quantity = trap.data.quantity;
        }
    });
}
