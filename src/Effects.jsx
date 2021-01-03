import React from 'react';
import moment from 'moment';
import { map } from './Level';
import { DIR_DELTA, BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber } from './constants';
import BoulderImage from './images/effects/boulder.png';
import ArrowImage from './images/effects/arrow.png';
import FireballImage from './images/effects/fireball.png';
import SmallGasImage from './images/effects/smallgascloud.png';
import LargeGasImage from './images/effects/largegascloud.png';
import SmallExplosionImage from './images/effects/small explosion.png';
import MediumExplosionImage from './images/effects/medium explosion.png';
import LargeExplosionImage from './images/effects/large explosion.png';
import { ROCK_BLOCK } from './Block';
let classNames = require('classnames');

/*****************************************************************************/

export function EffectsList({ map }) {
    let items = [];
    map.effects && map.effects.forEach((item) => {
        let { type, id } = item;
        switch (type) {
            case 'gas':
                items.push(<GasEffect key={id} item={item} />);
                break;
            case 'damage-number':
                items.push(<DamageNumber key={id} item={item} />);
                break;
            case 'arrow':
                if (item.data.delay <= 0) {
                    items.push(<Arrow key={id} item={item} />);
                }
                break;
            case 'fireball':
                if (item.data.delay <= 0) {
                    items.push(<Fireball key={id} item={item} />);
                }
                break;
            case 'explosion':
                items.push(<ExplosionEffect key={id} item={item} />);
                break;
            case 'boulder':
                items.push(<Boulder key={id} item={item} />);
                break;
            default:
                break;
        }
    });
    return items;
}

export function Arrow({ item }) {
    let { dir, offset } = item.data;
    let x = item.x * BLOCK_WIDTH + offset.x;
    let y = item.y * BLOCK_HEIGHT + offset.y;
    let arrowDirs = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let classname = classNames("block", arrowDirs[dir]);
    return (
        <div className={classname} style={{ left: `${x}px`, top: `${y}px` }}>
            <img src={ArrowImage} alt={`arrow`} />
        </div>
    );
}

export function GasEffect({ item }) {
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    let { id } = item;
    let classname = "block";
    let large = randomNumber(2);
    let small = 1 + randomNumber(4);
    let blobs = [];
    while (large > 0) {
        let bx = x + randomNumber(10);
        let by = y + randomNumber(10);
        blobs.push(<div className={classname} key={`${id}-large-${large}`} style={{ left: `${bx}px`, top: `${by}px` }}>
            <img src={LargeGasImage} alt={`gas trap`} />
        </div>);
        large--;
    }
    while (small > 0) {
        let bx = x - 5 + randomNumber(30);
        let by = y - 5 + randomNumber(30);
        blobs.push(<div className={classname} key={`${id}-small-${small}`} style={{ left: `${bx}px`, top: `${by}px` }}>
            <img src={SmallGasImage} alt={`gas trap`} />
        </div>);
        small--;
    }
    return (
        <div>
            {blobs}
            <div className={classname} style={{ left: `${x - 4 + (randomNumber(3) - 1)}px`, top: `${y - 4 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeGasImage} alt={`gas trap`} />
            </div>
            <div className={classname} style={{ left: `${x + 14 + (randomNumber(3) - 1)}px`, top: `${y - 4 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeGasImage} alt={`gas trap`} />
            </div>
            <div className={classname} style={{ left: `${x + 14 + (randomNumber(3) - 1)}px`, top: `${y + 14 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeGasImage} alt={`gas trap`} />
            </div>
            <div className={classname} style={{ left: `${x - 4 + (randomNumber(3) - 1)}px`, top: `${y + 14 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeGasImage} alt={`gas trap`} />
            </div>
            <div className={classname} style={{ left: `${x + 5 + (randomNumber(3) - 1)}px`, top: `${y + 5 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeGasImage} alt={`gas trap`} />
            </div>
        </div>
    );
}

export function ExplosionEffect({ item }) {
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    let { id } = item;
    let classname = "block";
    let large = randomNumber(2);
    let small = 1 + randomNumber(4);
    let medium = 1 + randomNumber(4);
    let blobs = [];
    while (large > 0) {
        let bx = x + randomNumber(10);
        let by = y + randomNumber(10);
        blobs.push(<div className={classname} key={`${id}-large-${large}`} style={{ left: `${bx}px`, top: `${by}px` }}>
            <img src={LargeExplosionImage} alt={`boom`} />
        </div>);
        large--;
    }
    while (medium > 0) {
        let bx = x - 10 + randomNumber(20);
        let by = y - 10 + randomNumber(20);
        blobs.push(<div className={classname} key={`${id}-medium-${medium}`} style={{ left: `${bx}px`, top: `${by}px` }}>
            <img src={MediumExplosionImage} alt={`boom`} />
        </div>);
        medium--;
    }
    while (small > 0) {
        let bx = x - 5 + randomNumber(30);
        let by = y - 5 + randomNumber(30);
        blobs.push(<div className={classname} key={`${id}-small-${small}`} style={{ left: `${bx}px`, top: `${by}px` }}>
            <img src={SmallExplosionImage} alt={`boom`} />
        </div>);
        small--;
    }
    return (
        <div>
            {blobs}
            <div className={classname} style={{ left: `${x - 4 + (randomNumber(3) - 1)}px`, top: `${y - 4 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeExplosionImage} alt={`boom`} />
            </div>
            <div className={classname} style={{ left: `${x + 14 + (randomNumber(3) - 1)}px`, top: `${y - 4 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeExplosionImage} alt={`boom`} />
            </div>
            <div className={classname} style={{ left: `${x + 14 + (randomNumber(3) - 1)}px`, top: `${y + 14 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeExplosionImage} alt={`boom`} />
            </div>
            <div className={classname} style={{ left: `${x - 4 + (randomNumber(3) - 1)}px`, top: `${y + 14 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeExplosionImage} alt={`boom`} />
            </div>
            <div className={classname} style={{ left: `${x + 5 + (randomNumber(3) - 1)}px`, top: `${y + 5 + (randomNumber(3) - 1)}px` }}>
                <img src={LargeExplosionImage} alt={`boom`} />
            </div>
        </div>
    );
}

export function Boulder({ item }) {
    let { rotate } = item.data;
    let x = item.x * BLOCK_WIDTH;
    let y = item.y * BLOCK_HEIGHT;
    let arrowDirs = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let classname = classNames("block", arrowDirs[rotate]);
    return (
        <div className={classname} style={{ left: `${x}px`, top: `${y}px` }}>
            <img src={BoulderImage} alt={`boulder`} />
        </div>
    );
}

function DamageNumber({ item }) {
    let { data, level } = item;
    let { target, xdiff, ydiff, opacity, type } = data;
    let x = target.x * BLOCK_WIDTH + xdiff;
    let y = target.y * BLOCK_HEIGHT + ydiff;
    let classname = classNames("block", "damage-number");
    let colorTypes = { hero: 'red', minion: 'green', poison: 'blue' };
    let color = colorTypes[type] || 'red';
    return (
        <div className={classname} style={{ left: `${x}px`, top: `${y}px`, opacity, color }}>
            {level}
        </div>
    );
}

export function Fireball({ item }) {
    let { dir, offset } = item.data;
    let x = item.x * BLOCK_WIDTH + offset.x;
    let y = item.y * BLOCK_HEIGHT + offset.y;
    let arrowDirs = ["arrow-trap-up", "arrow-trap-right", "arrow-trap-down", "arrow-trap-left"];
    let classname = classNames("block", arrowDirs[dir]);
    return (
        <div className={classname} style={{ left: `${x}px`, top: `${y}px` }}>
            <img src={FireballImage} alt={`fireball`} />
        </div>
    );
}

/*****************************************************************************/

export function handleDamageNumber(level, dn) {
    let { data } = dn;
    data.ydiff -= 2;
    data.opacity -= 0.05;
    if (moment().isAfter(dn.data.end)) {
        level.removeEffectFromMap(dn);
    }
}

/*****************************************************************************/

export function moveArrow(level, arrow) {
    let { data } = arrow;
    if (data.delay > 0) {
        data.delay--;
        return;
    }
    arrow.x += DIR_DELTA[data.dir].x;
    arrow.y += DIR_DELTA[data.dir].y;
    if (level.outOfBounds(arrow.x, arrow.y) || map.rows[arrow.y][arrow.x] === ROCK_BLOCK) {
        level.removeEffectFromMap(arrow);
    }
    let target = map[data.targetClass].find(h => h.x === arrow.x && h.y === arrow.y);
    if (target) {
        arrowHit(level, arrow, target);
    }
}

export function arrowHit(level, arrow, target) {
    if (target.class === 'heroes') {
        level.heroTakesDamage(target, arrow.level, arrow.type);
    }
    if (target.class === 'minions') {
        level.minionTakesDamage(target, arrow.level, arrow.type);
    }
    level.removeEffectFromMap(arrow);
    if (arrow.data.explode) {
        level.addEffectToMap({
            type: 'explosion',
            level: arrow.level,
            handle: (level, cloud) => handleGasCloud(level, cloud),
            activate: (level, cloud, hero) => activateGasCloud(level, cloud, hero),
            data: {
                turns: Math.min(arrow.level + randomNumber(5), 20)
            }
        }, arrow.x, arrow.y);
    }
}

/*****************************************************************************/

export function handleGasCloud(level, cloud) {
    cloud.data.turns -= 1;
    if (cloud.data.turns <= 0) {
        level.removeEffectFromMap(cloud);
    }
}


export function activateGasCloud(level, cloud, hero) {
    level.heroTakesDamage(hero, cloud.level, cloud.type);
}

/*****************************************************************************/

export function moveBoulder(level, boulder) {
    let { data } = boulder;
    data.delay = !data.delay;
    if (data.delay) {
        return;
    }
    boulder.x += DIR_DELTA[data.dir].x;
    boulder.y += DIR_DELTA[data.dir].y;
    if (DIR_DELTA[data.dir].x < 0 || DIR_DELTA[data.dir].y < 0) {
        data.rotate = (data.rotate + 3) % DIR_DELTA.length;
    } else {
        data.rotate = (data.rotate + 1) % DIR_DELTA.length;
    }
    if (level.outOfBounds(boulder.x, boulder.y) || map.rows[boulder.y][boulder.x] === 'x') {
        level.removeEffectFromMap(boulder);
    }
    map[data.targetClass].forEach(target => {
        if (target.x === boulder.x && target.y === boulder.y) {
            let damage = (10 * boulder.level) + randomNumber(boulder.level);
            level.heroTakesDamage(target, damage, 'rolling boulder');
        }
    });
}