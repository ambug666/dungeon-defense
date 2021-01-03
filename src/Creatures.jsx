import React from 'react';
import ReactTooltip from "react-tooltip";
import { BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber, DIR_DELTA } from './constants';
import SpiderImage1 from './images/creatures/spider1.png';
import SpiderImage2 from './images/creatures/spider2.png';
import SpiderImage3 from './images/creatures/spider3.png';
import DragonImage1 from './images/creatures/green dragon.png';
import DragonImage2 from './images/creatures/red dragon.png';
import { SLOW_SPEED, map, NORMAL_SPEED } from './Level';
import { activateWeb, addWebToMap, cleanupWeb } from './Traps';
import { moveMinion } from './Minions';
import './Block.css';
import './Traps.css';
import './Effects.css';
import './InfoBox.css';
import './Creatures.css';
import { moveArrow } from './Effects';
let classNames = require('classnames');

export const SPIDER_STYLES = [SpiderImage1, SpiderImage2, SpiderImage3];

export function Spider({ item, onClick, onMouseOver }) {
    let { id, level, health, infoBox, market, data } = item;
    let angle = data ? data.angle : 0;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let classname = classNames(item.market ? "market-trap" : "block");
    let image = SPIDER_STYLES[item.style];
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onMouseEnter={() => onMouseOver(x, y, item)}
                onClick={() => onClick(item)}>
                <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px`, transform: `rotate(${angle}deg)` }} alt={`spider`} />
            </div>
            {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                <div>{`Level ${level} Giant Spider`}</div>
                <div>{`${health} hit points`}</div>
            </ReactTooltip>}
        </div>
    );
}

export const DRAGON_STYLES = [DragonImage1, DragonImage2];

export function Dragon({ item, onClick, onMouseOver }) {
    let { id, level, health, infoBox, market } = item;
    let x = market ? 0 : item.x * BLOCK_WIDTH;
    let y = market ? 0 : item.y * BLOCK_HEIGHT;
    let dir = item.data ? item.data.dir : 1;
    let classname = classNames(item.market ? "market-trap" : "dragon", dir === 3 ? "dragon-flip" : "");
    let image = DRAGON_STYLES[item.style];
    return (
        <div>
            <div
                className="infobox-hero"
                data-tip data-for={market ? "" : `tooltip-${id}`}
                onMouseEnter={(e) => { onMouseOver(e.pageX, e.pageY, item) }}
                onClick={() => onClick(item)}>
                <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`dragon`} />
            </div>
            {
                !infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
                    <div>{`Level ${level} Dragon`}</div>
                    <div>{`${health} hit points`}</div>
                </ReactTooltip>
            }
        </div >
    );
}

/***********************************************************************************************/

export function loadCreatures() {
    map.minions.forEach(min => {
        min.move = (level, minion) => moveMinion(level, minion);
        switch (min.type) {
            default:
                break;
            case 'spider':
                min.initMinion = (creature) => initSpider(creature);
                min.moveMinion = (level, spider) => moveSpider(level, spider);
                min.cleanupMinion = (level, spider) => cleanupSpider(level, spider);
                break;
            case 'dragon':
                min.initMinion = (creature) => initDragon(creature);
                min.moveMinion = (level, dragon) => moveDragon(level, dragon);
                min.cleanupMinion = (level, dragon) => cleanupDragon(level, dragon);
                min.specialAction = (level, dragon) => dragonBreatheFire(level, dragon);
                break;
        }
    });
}

/***********************************************************************************************/

export function initSpider(spider) {
    spider.health = spider.level * 11 + randomNumber(Math.max(spider.level, 10));
    spider.maxHealth = spider.health;
    spider.strength = spider.level + 7;
    spider.chanceOfStay = 60;
    spider.chanceOfWeb = Math.min(spider.level, 20);
    spider.speed = SLOW_SPEED;
    spider.mode = 'special';
    spider.venemous = true;
    spider.style = randomNumber(SPIDER_STYLES.length);
    spider.data = {
        angle: randomNumber(360)
    }
}

export function moveSpider(level, spider) {
    let { x, y } = spider;
    let { rows } = map;
    let dir = Math.floor(Math.random() * 4);

    spider.data.angle += randomNumber(30) - 15;

    if (randomNumber(300) < spider.chanceOfWeb && !level.findTrapOnMap(x, y)) {
        level.addTrapToMap({
            name: "Web Trap",
            type: "web",
            class: 'trap',
            cost: (trap) => 0,
            level: spider.level,
            data: {
                dir: 1
            },
            active: true,
            activate: (level, trap, hero) => activateWeb(level, trap, hero),
            addToMap: (level, trap) => addWebToMap(level, trap),
            cleanup: (level, trap) => cleanupWeb(level, trap)
        }, x, y);
    }

    if (randomNumber(100) < spider.chanceOfStay) {
        return;
    }

    x += DIR_DELTA[dir].x;
    y += DIR_DELTA[dir].y;

    let iterations = 0;
    let check = (x, y) => {
        let ret = (level.outOfBounds(x, y) || rows[y][x] !== ' ' || spiderInSpace(x, y));
        return ret;
    }

    while (check(x, y) && iterations < 4) {
        dir = (dir + 1) % 4;
        x = spider.x + DIR_DELTA[dir].x;
        y = spider.y + DIR_DELTA[dir].y;
        iterations++;
    }

    if (iterations < 4) {
        spider.x = x;
        spider.y = y;
    }
}

function spiderInSpace(x, y) {
    return map.minions.find(min => min.x === x && min.y === y && min.type === 'spider');
}

export function cleanupSpider(level, minion) {
    if (minion.levelUp) {
        minion.health = minion.maxHealth + 8 + randomNumber(Math.max(minion.level, 7));
        minion.level++;
        minion.strength++;
        minion.maxHealth = minion.health;
    } else {
        minion.health = minion.maxHealth;
    }
}


/***********************************************************************************************/

export function testAddDragon(level, dragon, data) {
    let min = map.minions.find(min => min.type === 'dragon' && min.y === data.y);
    return !min;
}

export function initDragon(dragon) {
    dragon.health = dragon.level * 2500 + randomNumber(dragon.level * 550);
    dragon.maxHealth = dragon.health;
    dragon.strength = dragon.level * 25;
    dragon.speed = NORMAL_SPEED;
    dragon.mode = 'special';
    dragon.venemous = false;
    dragon.pacifist = true;
    dragon.style = randomNumber(DRAGON_STYLES.length);
    dragon.data = {
        dir: randomNumber(2) === 0 ? 1 : 3
    }
}

export function moveDragon() {
}

export function dragonBreatheFire(level, dragon) {
    //choose a random dir
    let dir = dragon.data.dir;
    for (let i = 0; i < 2; i++) {
        dir = (dir + (i * 2)) % 4;
        let x = (dir === 1) ? dragon.x + 2 : dragon.x;
        let y = dragon.y;
        //see if any heroes in line
        let hero = level.heroInLine(x, y, dir);
        if (hero) {
            //if so, shoot a firebolt
            dragon.data.dir = dir;
            level.addEffectToMap({
                type: 'fireball',
                level: dragon.strength,
                handle: (level, arrow) => moveArrow(level, arrow),
                data: {
                    targetClass: 'heroes',
                    dir,
                    delay: 0,
                    offset: { x: 0, y: 0 },
                    explode: true
                }
            }, x, y);
            return hero;
        }
    }
}

export function cleanupDragon(level, minion) {
    if (randomNumber(25) === 0) {
        minion.health = minion.maxHealth + randomNumber(Math.max(minion.level, 25));
        minion.level++;
        minion.strength = minion.level * 2;
        minion.maxHealth = minion.health;
    } else {
        minion.health = minion.maxHealth;
    }
}