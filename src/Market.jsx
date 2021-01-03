import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './Market.css';
import TrapsList, {
    activateArrowTrap, activateGasTrap, refreshArrowTrap, activateCaltrops, researchTrap, upgradeTrap, upgradeCaltrops, upgradeGasTrapSize,
    upgradeGasTrapDuration, upgradeArrowTrapQuantity, activateRollingBoulderTrap, replaceCaltrops, allowReplaceableCaltrops
} from './Traps';
import MinionsList, {
    possiblyProcreate, resetGoblin, initGoblin, initHireling, cleanupGoblin, cleanupHireling,
    cleanupDwarf, initDwarf, initTroll, cleanupTroll, extraTrollAttack
} from './Minions';
import { MAP_INCREASE, MAX_EXPANSIONS, BLOCK_HEIGHT } from './constants';
import ResearchLabImage from './images/lab.png';
import WorkshopImage from './images/workshop.png';
import ArrowWorkshopImage from './images/arrowworkshop.png';
import GasWorkshopImage from './images/gasworkshop.png';
import VolcanoImage from './images/volcano.png';
import { map } from './Level';
import { LAIR_BLOCK, HALLWAY_BLOCK } from './Block';
import { LAB_STYLES, WORKSHOP_STYLES } from './Lab';
import { initSpider, moveSpider, cleanupSpider, initDragon, moveDragon, cleanupDragon, dragonBreatheFire, testAddDragon } from './Creatures';
import HelpTab from './Help';
import { FormattedText } from './InfoBox';
let classNames = require('classnames');
let cloneDeep = require('lodash/fp/cloneDeep');

export let market = {
    traps: [
        {
            id: 'caltrops',
            name: "Caltrops",
            type: "caltrops",
            class: 'trap',
            description: () => "When a hero walks over these, they'll usually take some damage.",
            cost: (trap) => trap.baseCost + (trap.level * trap.levelCost) + (Math.floor(trap.level / 10) * trap.levelTenCost),
            baseCost: 1,
            levelCost: 1,
            levelTenCost: 1,
            level: 1,
            market: true,
            active: true,
            activate: (level, trap, hero) => activateCaltrops(level, trap, hero),
            onClick: (level, trap) => replaceCaltrops(level, trap)
        },
        {
            id: 'arrow',
            name: "Arrow Trap",
            type: "arrow",
            class: 'trap',
            description: (trap) => `Fires ${trap.data.trapstring[trap.data.quantity]} from the wall behind the arrow in the direction the arrow points. Needs to be reloaded after it has been used up. Arrows only hit heroes.`,
            cost: (trap) => trap.baseCost + (trap.level * trap.levelCost) + (Math.floor(trap.level / 10) * trap.levelTenCost) + ((trap.data.quantity - 1) * 20),
            baseCost: 0,
            levelCost: 5,
            levelTenCost: 10,
            level: 1,
            data: {
                trapstring: { 1: 'an arrow', 2: '2 arrows', 3: '3 arrows', 4: '4 hours', 5: '5 hours' },
                dir: 1,
                uses: 5,
                quantity: 1
            },
            market: true,
            active: true,
            activate: (level, trap, hero) => activateArrowTrap(level, trap, hero),
            refresh: (level, trap) => refreshArrowTrap(level, trap)
        },
        {
            id: 'gas',
            name: "Gas Trap",
            type: "gas",
            class: 'trap',
            description: (trap) => `Releases a cloud of poison gas that envelopes a ${trap.data.trapstring[trap.data.size]} including this space. Gas does damage to each hero in it. Needs to be reloaded after use.`,
            cost: (trap) => trap.baseCost + (trap.level * trap.levelCost) + (Math.floor(trap.level / 10) * trap.levelTenCost),
            baseCost: 5,
            levelCost: 10,
            levelTenCost: 20,
            data: {
                trapstring: { 4: '2x2 block', 5: '5 space cross of tiles', 6: '3x2 block', 7: 'H shaped block of tiles', 8: '3x3 block missing a corner', 9: '3x3 block' },
                size: 4,
                duration: 4
            },
            level: 1,
            market: true,
            active: true,
            activate: (level, trap, hero) => activateGasTrap(level, trap, hero)
        },
        {
            id: 'boulder',
            name: "Rolling Boulder Trap",
            type: "boulder",
            class: 'trap',
            description: (trap) => `Starts a boulder rolling from one wall to another, hurting all the heroes in its path.`,
            cost: (trap) => trap.baseCost + (trap.level * trap.levelCost) + (Math.floor(trap.level / 10) * trap.levelTenCost),
            baseCost: 35,
            levelCost: 20,
            levelTenCost: 40,
            level: 1,
            data: {
                dir: 1
            },
            market: true,
            active: false,
            activate: (level, trap, hero) => activateRollingBoulderTrap(level, trap, hero)
        }
    ],
    minions: [
        {
            id: 'goblin',
            name: "Goblin",
            type: "goblin",
            class: 'minions',
            description: "Goblins don't do a lot of damage, but they are cheap and sometimes they even make more goblins.",
            baseCost: 3,
            levelCost: 2,
            levelTenCost: 5,
            cost: (minion) => minion.baseCost + ((minion.level - 1) * minion.levelCost) + (Math.floor(minion.level / 10) * minion.levelTenCost),
            level: 1,
            style: 0,
            market: true,
            active: true,
            specialAction: (level, goblin) => possiblyProcreate(level, goblin),
            specialReset: (goblin) => resetGoblin(goblin),
            cleanupMinion: (level, goblin) => cleanupGoblin(level, goblin),
            initMinion: (goblin) => initGoblin(goblin)
        },
        {
            id: 'hireling',
            name: "Hireling",
            type: "hireling",
            class: 'minions',
            description: "Hirelings are about the same strength as an average hero, but you have to pay them a little bit more at the end of each wave.",
            baseCost: 7,
            levelCost: 5,
            levelTenCost: 7,
            cost: (minion) => minion.baseCost + ((minion.level - 1) * minion.levelCost) + (Math.floor(minion.level / 10) * minion.levelTenCost),
            level: 1,
            style: 0,
            market: true,
            active: true,
            cleanupMinion: (level, hireling) => cleanupHireling(level, hireling),
            initMinion: (hireling) => initHireling(hireling)
        },
        {
            id: 'dwarf',
            name: "Dwarf",
            type: "dwarf",
            class: 'minions',
            description: "Dwarves won't fight for you, but they will dig out your dungeon in the direction you choose. The higher the level, the farther they'll dig. Dwarves don't stay after a wave. They may be placed in a hallway but will walk through your lair to continue digging on the other side.",
            baseCost: 15,
            levelCost: 10,
            levelTenCost: 10,
            cost: (minion) => minion.baseCost + ((minion.level - 1) * minion.levelCost) + (Math.floor(minion.level / 10) * minion.levelTenCost),
            level: 1,
            style: 0,
            mapCells: [HALLWAY_BLOCK],
            market: true,
            active: false,
            cleanupMinion: (level, minion) => cleanupDwarf(level, minion),
            initMinion: (minion) => initDwarf(minion)
        },
        {
            id: 'troll',
            name: "Troll",
            type: "troll",
            class: 'minions',
            description: "Trolls move slowly, but they are very very hard hitting. It's a shame that they will sometimes attack your other minions.",
            baseCost: 25,
            levelCost: 10,
            levelTenCost: 10,
            cost: (minion) => minion.baseCost + ((minion.level - 1) * minion.levelCost) + (Math.floor(minion.level / 10) * minion.levelTenCost),
            level: 1,
            market: true,
            active: false,
            cleanupMinion: (level, minion) => cleanupTroll(level, minion),
            initMinion: (minion) => initTroll(minion),
            specialAction: (level, troll) => extraTrollAttack(level, troll),
        }
    ],
    creatures: [
        {
            id: 'spider',
            name: "Giant Spider",
            type: "spider",
            class: 'creatures',
            description: "Gaint Spiders have a poisonous bite and will also spin webs which trap heroes for a while.",
            baseCost: 25,
            levelCost: 10,
            levelTenCost: 15,
            cost: (spider) => spider.baseCost + ((spider.level - 1) * spider.levelCost) + (Math.floor(spider.level / 10) * spider.levelTenCost),
            level: 1,
            style: 0,
            market: true,
            active: true,
            initMinion: (creature) => initSpider(creature),
            moveMinion: (level, spider) => moveSpider(level, spider),
            cleanupMinion: (level, spider) => cleanupSpider(level, spider),
        },
        {
            id: 'dragon',
            name: "Dragon",
            type: "dragon",
            class: 'creatures',
            description: "Hire a fire breathing dragon to guard your lair. You cannot put two dragons in the same row because dragons do not to look each other in the eye.",
            baseCost: 1500,
            levelCost: 600,
            levelTenCost: 500,
            cost: (dragon) => dragon.baseCost + ((dragon.level - 1) * dragon.levelCost) + (Math.floor(dragon.level / 10) * dragon.levelTenCost),
            level: 1,
            style: 0,
            size: {
                width: 3,
                height: 2
            },
            mapCells: [LAIR_BLOCK],
            market: true,
            active: true,
            pacifist: true,
            initMinion: (creature) => initDragon(creature),
            moveMinion: (level, dragon) => moveDragon(level, dragon),
            cleanupMinion: (level, dragon) => cleanupDragon(level, dragon),
            specialAction: (level, dragon) => dragonBreatheFire(level, dragon),
            itemAddTest: (level, dragon, data) => testAddDragon(level, dragon, data)
        },
    ],
    misc: [
        {
            id: 'lair',
            name: "Additional Lair",
            type: "lair",
            class: 'misc',
            description: () => "Sets a 3x2 area as your lair. Click on the upper left corner of the new lair to set it.",
            cost: () => 10,
            costText: 'gold per tile',
            level: 1,
            market: true,
            mapCells: [HALLWAY_BLOCK, LAIR_BLOCK],
            active: () => true
        },
        {
            id: 'clear',
            name: "Clear Area",
            type: "clear",
            class: 'misc',
            description: () => "Clear everything in a 2x2 area. This will destroy everything in that area, including gems and gold.",
            cost: () => 150 * map.data.expansions,
            costText: 'gold per tile',
            level: 1,
            market: true,
            mapCells: [HALLWAY_BLOCK, LAIR_BLOCK],
            active: () => map.data.expansions > 0
        },
        {
            id: 'land-grab',
            name: "More Land",
            type: "land-grab",
            class: 'misc',
            description: () =>
                <div>Purchase more land adjacent to your current holdings</div>,
            cost: () => {
                let c = map.data.expansions % 2 === 0 ? map.rows.length * MAP_INCREASE : map.rows[0].length * MAP_INCREASE;
                c = c * 20 * (map.data.expansions + 1);
                return c;
            },
            costText: 'gold',
            market: true,
            active: () => map.data.expansions < MAX_EXPANSIONS,
            onClickMarket: (level, item) => level.tryExpandMap(item.cost(item))
        },
        {
            id: 'lab',
            name: "Research Lab",
            icon: <img src={ResearchLabImage} alt={`lab`} width="30" height="30" />,
            type: "lab",
            class: 'lab',
            styles: LAB_STYLES.length,
            mapCells: [LAIR_BLOCK],
            description: () =>
                <div><b>Research Lab</b> Add a research lab to your lair. Each research lab lets you research one more thing every wave. Also, it unlocks the Trap Workshop which will let you upgrade your traps in many different ways.</div>,
            cost: (lab) => lab.baseCost + (labsOnMap() * lab.levelCost),
            baseCost: 100,
            levelCost: 150,
            costText: 'gold',
            level: 1,
            style: 1,
            market: true,
            active: () => true
        },
        {
            id: 'workshop',
            name: "Trap Workshop",
            icon: <img src={WorkshopImage} alt={`workshop`} width="30" height="30" />,
            type: "workshop",
            class: 'lab',
            styles: WORKSHOP_STYLES.length,
            mapCells: [LAIR_BLOCK],
            description: () =>
                <div><b>Trap Workshop</b> Add a trap workshop to your lair to give you a lot of way to research improving your traps.</div>,
            cost: () => 100,
            costText: 'gold',
            level: 1,
            style: 1,
            market: true,
            active: () => labsOnMap() > 0 && labsOnMap('workshop') === 0
        },
        {
            id: 'arrow-workshop',
            name: "Arrow Trap Workshop",
            icon: <img src={ArrowWorkshopImage} alt={`arrow workshop`} width="30" height="30" />,
            type: "arrow-workshop",
            class: 'lab',
            mapCells: [LAIR_BLOCK],
            description: () =>
                <div><b>Arrow Trap Workshop</b> For each arrow trap workshop in your lair, your research improves them an additional level (up to the next wave).</div>,
            cost: (item) => item.baseCost + labsOnMap('arrow-workshop') * item.levelCost,
            baseCost: 50,
            levelCost: 950,
            costText: 'gold',
            level: 1,
            style: 1,
            market: true,
            active: () => labsOnMap('workshop') > 0
        },
        {
            id: 'gas-workshop',
            name: "Gas Trap Workshop",
            icon: <img src={GasWorkshopImage} alt={`gas workshop`} width="30" height="30" />,
            type: "gas-workshop",
            class: 'lab',
            mapCells: [LAIR_BLOCK],
            description: () =>
                <div><b>Gas Trap Workshop</b> For each gas trap workshop in your lair, your research improves them an additional level (up to the next wave).</div>,
            cost: (item) => item.baseCost + labsOnMap('gas-workshop') * item.levelCost,
            baseCost: 50,
            levelCost: 950,
            costText: 'gold',
            level: 1,
            style: 1,
            market: true,
            active: () => labsOnMap('workshop') > 0
        },
        {
            id: 'volcano-lair',
            name: "Volcano Lair",
            icon: <img src={VolcanoImage} alt={`volcanic lair`} width="30" height="30" />,
            type: "volcano-lair",
            class: 'lair',
            description: () =>
                <div><b>Volcanic Lair</b> Move to a much better and more solitary location. Buying this will win the game!</div>,
            cost: (item) => 150000,
            costText: 'gold',
            level: 1,
            style: 1,
            market: true,
            active: () => map.data.expansions > 0,
            onClickMarket: (level, item) => level.buyVolcanoLair(item.cost(item))
        }
    ],
    research: [
        {
            id: 'traps-header',
            header: 'Traps',
            active: () => true,
        },
        {
            id: 'caltrop-upgrade',
            name: "Upgrade Caltrops",
            type: "caltrop-upgrade",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return `You will now be able to purchase level ${item.level + 1} caltrops, but this will [i][b]not[/b][/i] upgrade the ones you have already placed.`;
            },
            baseCost: 2,
            levelCost: 2,
            level10Cost: 2,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return research.baseCost + (item.level * research.levelCost) + (Math.floor(item.level / 10) * research.level10Cost);
            },
            market: true,
            active: () => true,
            trapId: 'caltrops',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeCaltrops(level, research)
        },
        {
            id: 'replace-caltrops',
            name: "Replaceable Caltrops",
            type: "replace-caltrops",
            class: 'research',
            description: (research) => {
                return `You may build over caltrops with higher level caltrops.`;
            },
            cost: () => 7,
            market: true,
            active: () => labsOnMap('workshop') > 0 && !map.data.replaceableCaltrops,
            text: 'Allowing replaceable caltrops',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => allowReplaceableCaltrops(level, research)
        },
        {
            id: 'arrow-trap-upgrade',
            name: "Upgrade Arrow Traps",
            type: "arrow-trap-upgrade",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let level = item.level + 1 + labsOnMap('arrow-workshop');
                level = Math.min(level, map.wave + 2);
                return `Upgrade your arrow traps to level ${level}.`;
            },
            baseCost: 0,
            levelCost: 10,
            level10Cost: 12,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let cost = research.baseCost + (item.level * research.levelCost) + (Math.floor(item.level / 10) * research.level10Cost);
                let mult = 1 + labsOnMap('arrow-workshop');
                let nextWave = map.wave + 2;
                if (item.level + mult > nextWave) {
                    mult += (item.level - nextWave);
                }
                return cost * mult;
            },
            market: true,
            active: () => true,
            trapId: 'arrow',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeTrap(level, research, 'arrow-workshop')
        },
        {
            id: 'arrow-trap-more-arrows',
            name: "Additional Arrows",
            type: "arrow-trap-more-arrows",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return `Your arrow traps will fire ${item.data.quantity + 1} arrows.`;
            },
            text: 'Upgrading Arrow Quantity',
            baseCost: 15,
            levelCost: 15,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return research.baseCost + ((item.data.quantity) * research.levelCost);
            },
            market: true,
            active: () => labsOnMap('workshop') > 0 && arrowTrapQuantity() < 5,
            trapId: 'arrow',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeArrowTrapQuantity(level, research)
        },
        {
            id: 'gas-trap-upgrade',
            name: "Upgrade Gas Traps",
            type: "gas-trap-upgrade",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let level = item.level + 1 + labsOnMap('gas-workshop');
                level = Math.min(level, map.wave + 2);
                return `Upgrade your gas traps to level ${level}.`;
            },
            baseCost: 5,
            levelCost: 10,
            level10Cost: 15,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let cost = research.baseCost + (item.level * research.levelCost) + (Math.floor(item.level / 10) * research.level10Cost);
                let mult = 1 + labsOnMap('gas-workshop');
                let nextWave = map.wave + 2;
                if (item.level + mult > nextWave) {
                    mult += (item.level - nextWave);
                }
                return cost * mult;
            },
            market: true,
            active: () => true,
            trapId: 'gas',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeTrap(level, research, 'gas-workshop')
        },
        {
            id: 'gas-trap-size-upgrade',
            name: "Gas Trap Size",
            type: "gas-trap-size-upgrade",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return `Your gas traps will cover ${item.data.size + 1} tiles.`;
            },
            text: 'Upgrading Amount of Gas',
            baseCost: 40,
            levelCost: 25,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                return research.baseCost + ((item.data.size - 4) * research.levelCost);
            },
            market: true,
            active: () => labsOnMap('workshop') > 0 && gasTrapSize() < 9,
            trapId: 'gas',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeGasTrapSize(level, research)
        },
        {
            id: 'gas-trap-duration-upgrade',
            name: "Gas Trap Duration",
            type: "gas-trap-duration-upgrade",
            class: 'research',
            description: () => `Your gas traps will last twice as long.`,
            cost: () => 70,
            text: 'Upgrading Duration of Gas',
            market: true,
            active: () => labsOnMap('workshop') > 0 && !map.data.upgradedGasTrapDuration,
            trapId: 'gas',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeGasTrapDuration(level, research)
        },
        {
            id: 'create-boulder',
            name: "Invent Rolling Boulder Traps",
            type: "create-boulder",
            class: 'research',
            description: () => `Invent Rolling Boulder Traps so you can build them.`,
            cost: () => 35,
            market: true,
            active: () => labsOnMap('workshop') > 0 && !isMarketActive("traps", "boulder"),
            targetItems: [{ id: 'boulder', class: 'traps', activate: true }],
            researchData: [{ name: "rollingBoulder", set: true }],
            researchText: `Inventing Rolling Boulder Traps`,
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => level.activateMarketItems(research),
        },
        {
            id: 'boulder-trap-upgrade',
            name: "Upgrade Rolling Boulder Traps",
            type: "boulder-trap-upgrade",
            class: 'research',
            description: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let level = item.level + 1;
                return `Upgrade your rolling boulder traps to level ${level}.`;
            },
            baseCost: 45,
            levelCost: 25,
            level10Cost: 20,
            cost: (research) => {
                let item = market.traps.find(trap => trap.id === research.trapId);
                let cost = research.baseCost + (item.level * research.levelCost) + (Math.floor(item.level / 10) * research.level10Cost);
                return cost;
            },
            market: true,
            active: () => map.data.rollingBoulder,
            trapId: 'boulder',
            purchase: (level, item) => researchTrap(level, item),
            activate: (level, research) => upgradeTrap(level, research)
        },
        {
            id: 'minions-header',
            header: 'Minions',
            active: () => true,
        },
        {
            id: 'dwarf-contact',
            name: "Contact Dwarves",
            type: "dwarf-contact",
            class: 'research',
            description: () => `Learn how to hire dwarves to expand your dunegeon.`,
            baseCost: 5,
            levelCost: 10,
            cost: () => 25,
            market: true,
            active: () => !isMarketActive("minions", "dwarf"),
            targetItems: [{ id: 'dwarf', class: 'minions', activate: true }],
            researchText: `Contacting Dwarves`,
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => level.activateMarketItems(research)
        },
        {
            id: 'dwarf-upgrade',
            name: "Dwaves in Lair",
            type: "dwarf-upgrade",
            class: 'research',
            description: () => `You can place dwarves in your lair!`,
            baseCost: 5,
            levelCost: 10,
            cost: () => 40,
            market: true,
            active: () => map.data.dwarves,
            researchText: `Teaching Dwarves About Lairs`,
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => upgradeDwarves(research)
        },
        {
            id: 'troll-contact',
            name: "Contact Trolls",
            type: "troll-contact",
            class: 'research',
            description: () => `Learn how to hire trolls to protect your dunegeon.`,
            baseCost: 5,
            levelCost: 10,
            cost: () => 30,
            market: true,
            active: () => !isMarketActive("minions", "troll"),
            targetItems: [{ id: 'troll', class: 'minions', activate: true }],
            researchText: `Contacting Trolls`,
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => level.activateMarketItems(research)
        },
        {
            id: 'misc-header',
            header: 'Misc.',
            active: () => true,
        },
        {
            id: 'lair-upgrade',
            name: "Lair Upgrade",
            type: "lair-upgrade",
            class: 'research',
            description: () => `Upgrade your lair to hold more gold.`,
            level: 1,
            baseCost: 50,
            levelCost: 25,
            cost: (research) => research.baseCost + (research.level * research.levelCost) + (map.data.expansions * 500),
            market: true,
            active: () => isLairUpgradeActive(),
            researchText: `Upgrading Your Lair`,
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => level.upgradeLair(research)
        },
        {
            id: 'gossip',
            name: "Gossip Monger",
            type: "gossip",
            class: 'research',
            description: () => `Discover the truth about your lair's reputation. This will give you clues about what to expect in the upcoming wave.`,
            level: 1,
            cost: () => 95,
            market: true,
            active: () => !map.data.gossip && map.wave > 0,
            researchText: `Learning Gossip`,
            researchData: [{ name: "gossip", set: true }],
            purchase: (level, item) => level.purchaseMarketResearchItem(item),
            activate: (level, research) => level.activateMarketItems(research)
        }
    ]
}

export function loadMarket() {
    let loadmarket = JSON.parse(window.localStorage.getItem('market'));
    let groups = ['traps', 'minions', 'creatures', 'misc', 'research'];

    function findInMarket(mark, group, id) {
        return mark[group].find(item => item.id === id);
    }

    groups.forEach(group => {
        market[group].forEach(item => {
            let loaditem = findInMarket(loadmarket, group, item.id);
            if (loaditem) {
                item.level = loaditem.level;
                item.mapCells = loaditem.mapCells;
                if (!(group === 'misc' || group === 'research')) {
                    item.active = loaditem.active;
                }
                item.data = cloneDeep(loaditem.data);
            }
        });
    });
}

export default function Market(props) {
    const { x, selected, gold, gems, onClick, onResearch, wave, research, reputation, showReputation } = props;
    let height = (map.rows.length * BLOCK_HEIGHT) - 8;
    return (
        <div className="market" style={{
            left: `${x}px`, top: `0px`, height: `${height}px`
        }}>
            <div className="market-header">
                <div>Expand and Populate the Dungeon</div>
                <div className="market-right">
                    <div>{formatGold(gold)} Gold</div>
                    {gems > 0 && <div className="infobox-subheader">{formatGold(gold + gems)} With Gems</div>}
                    {map.wave > 0 && <MarketReputation reputation={reputation} showReputation={showReputation} />}
                </div>
            </div>
            <Tabs onSelect={(index, lastIndex, event) => {
                onClick(null);
                return true;
            }} >
                <TabList>
                    <Tab>Traps</Tab>
                    <Tab>Minions</Tab>
                    <Tab>Creatures</Tab>
                    <Tab>Misc.</Tab>
                    <Tab>Research</Tab>
                    <Tab>Help</Tab>
                </TabList>

                <TabPanel>
                    <TrapsTab selected={selected} onClick={onClick} />
                </TabPanel>
                <TabPanel>
                    <MinionsTab selected={selected} wave={wave} onClick={onClick} />
                </TabPanel>
                <TabPanel>
                    <CreaturesTab selected={selected} wave={wave} onClick={onClick} />
                </TabPanel>
                <TabPanel>
                    <MiscTab selected={selected} wave={wave} onClick={onClick} />
                </TabPanel>
                <TabPanel>
                    <ResearchTab research={research} onClick={onResearch} />
                </TabPanel>
                <TabPanel>
                    <HelpTab />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export function reputationString(reputation, showReputation) {
    if (!showReputation) {
        return "Unknown";
    }
    if (reputation) {
        if (reputation.trapfilled) {
            return "Trap Filled";
        }
        if (reputation.monsterous) {
            return "Monsterous";
        }
        if (reputation.easy) {
            return "Easy";
        }
        if (reputation.rich) {
            return "Rich";
        }
        if (reputation.deadly) {
            return `Deadly ${reputation.deadly}`;
        }
    }
    return "None";
}

export function reputationExpectationString(reputation) {
    if (!reputation) {
        return "";
    }
    if (reputation) {
        if (reputation.trapfilled) {
            return "Expect Rogues";
        }
        if (reputation.monsterous) {
            return "Expectr Archers";
        }
        if (reputation.easy) {
            return "Expect Cowardly Heroes";
        }
        if (reputation.rich) {
            return "Expect Greedy Heroes";
        }
        if (reputation.deadly === 0) {
            return "";
        }
        if (reputation.deadly < 5) {
            return `Expect Some Elite Heroes`;
        }
        if (reputation.deadly < 10) {
            return `Expect Mostly Elite Heroes`;
        }
        if (reputation.deadly) {
            return `Expect Many Elite Heroes`;
        }
    }
    return "";
}

export function MarketReputation({ reputation, showReputation }) {
    return <span><div className="market-reputation">Reputation: {reputationString(reputation, showReputation)} </div>
        <div className="market-reputation">{reputationExpectationString(reputation)} </div></span>;
}

export function formatGold(gold) {
    return gold.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function TrapsTab({ selected, onClick }) {
    return (
        <div>
            <div>Click on the trap to select it.  Then click on the map to build it.</div>
            <div className="market-items-header">
                <div className="market-icon-col">Trap</div>
                <div className="market-col-2">Description</div>
                <div className="market-col">Cost</div>
            </div>
            {market.traps.map(trap => {
                if (!trap.active) {
                    return null;
                }
                return <div className={classNames("market-items-row", selectedClass(selected, trap))} key={trap.type}>
                    <div className="market-icon-col"><TrapsList map={{ traps: [trap] }} onClick={onClick} /></div>
                    <div className="market-col-2"><b>{trap.name}</b>: (Level: {trap.level}) {trap.description(trap)}</div>
                    <div className="market-col">{`${formatGold(trap.cost(trap))} Gold`}</div>
                </div>
            })}
        </div>
    );
}

function MinionsTab({ selected, wave, onClick }) {
    const [changed, setChanged] = useState(0);
    return (
        <div>
            <div className="market-text">Click on the minion to select them. Then click on the map to hire them.</div>
            <div className="market-text">Minions need to be paid at the end of each wave. They heal at the end of each wave. Minions that kill a Hero will level up at the end of each wave.</div>
            <div className="market-items-header">
                <div className="market-icon-col">Minion</div>
                <div className="market-col-2">Description</div>
                <div className="market-col">Level</div>
                <div className="market-col">Cost</div>
            </div>
            {market.minions.map(minion => {
                if (!minion.active) {
                    return null;
                }
                return (
                    <div className={classNames("market-items-row", selectedClass(selected, minion))} key={minion.type}>
                        <div className="market-icon-col"><MinionsList map={{ minions: [minion] }} onClick={onClick} /></div>
                        <div className="market-col-2"><b>{minion.name}</b>: {minion.description}</div>
                        {wave === 0 && <div className="market-col">1</div>}
                        {wave > 0 && <div className="market-col"><LevelSelect level={minion.level} maxLevel={wave + 1} setLevel={(e) => { minion.level = parseInt(e.target.value, 10); setChanged(1 - changed); }} /></div>}
                        <div className="market-col">{`${formatGold(minion.cost(minion))} Gold`}</div>
                    </div>
                );
            })}
        </div>
    );
}

function LevelSelect({ level, maxLevel, setLevel }) {
    const [internalLevel, setInternalLevel] = useState(level);
    let num;
    let options = [];
    for (num = 1; num <= maxLevel; num++) {
        options.push(<option value={num} key={num}>Level {num}</option>);
    }
    return (
        <select value={internalLevel} onChange={(e) => { setLevel(e); setInternalLevel(parseInt(e.target.value, 10)) }}>
            {options}
        </select>
    );
}

function selectedClass(selected, item) {
    return (selected && selected.item.id === item.id) ? "market-row-selected" : "";
}


function CreaturesTab({ selected, wave, onClick }) {
    const [changed, setChanged] = useState(0);
    return (
        <div>
            <div className="market-text">Click on the creature to select them. Then click on the map to import them.</div>
            <div className="market-text">Creatures heal at the end of each wave. Creatures that kill a Hero will level up at the end of each wave.</div>
            <div className="market-items-header">
                <div className="market-icon-col">Creature</div>
                <div className="market-col-2">Description</div>
                <div className="market-col">Level</div>
                <div className="market-col">Cost</div>
            </div>
            {market.creatures.map(creature => {
                if (!creature.active) {
                    return null;
                }
                return (
                    <div className={classNames("market-items-row", selectedClass(selected, creature))} key={creature.type}>
                        <div className="market-icon-col"><MinionsList map={{ minions: [creature] }} onClick={onClick} /></div>
                        <div className="market-col-2"><b>{creature.name}</b>: {creature.description}</div>
                        {wave === 0 && <div className="market-col">1</div>}
                        {wave > 0 && <div className="market-col"><LevelSelect level={creature.level} maxLevel={wave + 1} setLevel={(e) => { creature.level = parseInt(e.target.value, 10); setChanged(1 - changed); }} /></div>}
                        <div className="market-col">{`${formatGold(creature.cost(creature))} Gold`}</div>
                    </div>
                );
            })}
        </div>
    );
}

function ResearchTab({ research, onClick }) {
    return (
        <div>
            <div className="market-text">Click on the button to research something. It will be available after the next wave. You can only research one thing at a time, unless you get a research lab.</div>
            <div className="market-items-header">
                <div className="market-col"></div>
                <div className="market-col-2">Description</div>
                <div className="market-col">Cost</div>
            </div>
            {market.research.map(item => {
                if (!item.active()) {
                    return null;
                }
                return (<div key={item.id}>
                    {item.header ?
                        <div className="market-items-header market-items-subheader">{item.header}</div> :
                        <div className={classNames("market-items-row")}>
                            <div className="market-col"><ResearchButton research={research} onClick={onClick} item={item} /></div>
                            <div className="market-col-2"><b>{item.name}</b>: <FormattedText text={item.description(item)} /></div>
                            <div className="market-col">{formatGold(item.cost(item))}</div>
                        </div>
                    }
                </div>
                );
            })}
        </div>
    );
}

function ResearchButton({ research, item, onClick }) {
    let maxResearch = 1 + labsOnMap();
    if (research.find(r => r.research.id === item.id)) {
        return <div>{'✔️'}</div>
    }
    if (research.length >= maxResearch) {
        return <div></div>
    }
    return (<button onClick={() => onClick(item)}>Research</button>);
}

function MiscTab({ selected, onClick }) {
    return (
        <div>
            <div>Click on the item to select it. Then click on the map to build it.</div>
            <div className="market-items-header">
                <div className="market-col">Item</div>
                <div className="market-col-2">Description</div>
                <div className="market-col">Cost</div>
            </div>
            {market.misc.map(item => {
                if (!item.active()) {
                    return null;
                }
                return (
                    <div className={classNames("market-items-row", selectedClass(selected, item))} key={item.type}>
                        {item.icon ? <div className="market-icon-col" onClick={() => onClick(item)}>{item.icon}</div> :
                            <div className="market-icon-col" onClick={() => onClick(item)}><b>{item.name}</b></div>}
                        <div className="market-col-2">{item.description(item)}</div>
                        <div className="market-col">{formatGold(item.cost(item))} {item.costText}</div>
                    </div>);
            })}
        </div>
    );
}

export function getMarketItemCost(type, id) {
    let item = market[type].find(mkt => mkt.id === id);
    return item ? item.cost(item) : 0;
}

export function getMarketItemLevel(type, id) {
    let item = market[type].find(mkt => mkt.id === id);
    return item ? item.level : 0;
}

function gasTrapSize() {
    let item = market["traps"].find(mkt => mkt.id === "gas");
    return item ? item.data.size : 0
}

function arrowTrapQuantity() {
    let item = market["traps"].find(mkt => mkt.id === "arrow");
    return item ? item.data.quantity : 0
}

export function isMarketActive(itemClass, id) {
    let item = market[itemClass].find(mkt => mkt.id === id);
    return item ? item.active : false;
}

export function activateMarket(itemClass, id, activate = true) {
    let item = market[itemClass].find(mkt => mkt.id === id);
    if (item) {
        item.active = activate;
    }
}

export function upgradeDwarves() {
    let item = market.minions.find(mkt => mkt.id === 'dwarf');
    if (item) {
        item.mapCells = [HALLWAY_BLOCK, LAIR_BLOCK];
    }
}

export function labsOnMap(type = 'lab') {
    return map.labs.filter(l => l.type === type).length;
}

export function isLairUpgradeActive() {
    if (!map.data.lairExpanded) {
        return false;
    }

    if (map.data.expansions === 0) {
        return map.data.lairMax < 50;
    }
    if (map.data.expansions === 1) {
        return map.data.lairMax < 75;
    }
    if (map.data.expansions === 2) {
        return map.data.lairMax < 100;
    }
    if (map.data.expansions === 3) {
        return map.data.lairMax < 200;
    }
    return map.data.lairMax < 200;
}