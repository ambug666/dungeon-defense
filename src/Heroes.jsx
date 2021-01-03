import React from 'react';
import ReactTooltip from "react-tooltip";
import './Block.css';
import './Effects.css';
import OrcFighterImage from './images/heroes/orcfighter.png';
import FighterImage1 from './images/heroes/fighter1.png';
import FighterImage2 from './images/heroes/fighter2.png';
import FighterImage3 from './images/heroes/fighter3.png';
import OrcRogueImage from './images/heroes/orcrogue.png';
import RogueImage1 from './images/heroes/rogue1.png';
import RogueImage2 from './images/heroes/rogue2.png';
import RogueImage3 from './images/heroes/rogue3.png';
import OrcArcherImage from './images/heroes/orcarcher.png';
import ArcherImage1 from './images/heroes/archer1.png';
import ArcherImage2 from './images/heroes/archer2.png';
import ArcherImage3 from './images/heroes/archer3.png';
import ShieldImage1 from './images/heroes/shield1.png';
import ShieldImage2 from './images/heroes/shield2.png';
import ShieldImage3 from './images/heroes/shield3.png';
import ShieldImage4 from './images/heroes/shield4.png';
import ShieldImage5 from './images/heroes/shield5.png';
import ShieldImage6 from './images/heroes/shield6.png';
import ChampionArmorImage from './images/heroes/champion-armor.png';
import { BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber } from './constants';
import './InfoBox.css';
import { WEAPON_STYLES } from './Weapons';
import { moveArrow } from './Effects';

export default function HeroesList({ map }) {
  if (!map) {
    return [];
  }
  let items = [];
  map.heroes && map.heroes.forEach((item) => {
    let { id, type } = item;
    switch (type) {
      default:
      case 'fighter':
        items.push(<Fighter key={id} item={item} />);
        break;
      case 'rogue':
        items.push(<Rogue key={id} item={item} />);
        break;
      case 'archer':
        items.push(<Archer key={id} item={item} />);
        break;
    }
  });
  return items;
}

export const FIGHTER_STYLES = [FighterImage1, FighterImage2, FighterImage3];
export const SHIELD_STYLES = [0, ShieldImage1, ShieldImage2, ShieldImage3, ShieldImage4, ShieldImage5, ShieldImage6];
export const HERO_WEAPONS = ['sword', 'great sword'];

function Fighter({ item }) {
  let { id, level, type, health, gold, escaping, infoBox, mode, webbed } = item;
  let x = item.x * BLOCK_WIDTH;
  let y = item.y * BLOCK_HEIGHT;
  let classname = "block";
  let image = item.ancestry === 'orc' ? OrcFighterImage : FIGHTER_STYLES[item.style];
  if (webbed > 0) {
    x += randomNumber(6) - 3;
    y += randomNumber(6) - 3;
  }
  return (
    <div>
      <div className="infobox-hero" data-tip data-for={infoBox ? "" : `tooltip-${id}`}>
        <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`fighter`} />
        {item.weapon && <img src={WEAPON_STYLES[item.weapon]} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`sword`} />}
        {item.champion && <img src={ChampionArmorImage} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`armor`} />}
        {item.shield > 0 && <img src={SHIELD_STYLES[item.shield]} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`shield`} />}
      </div>
      {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
        <div>{`Level ${level} ${type} (${mode})`}</div>
        <div>{`${health} hit points`}</div>
        <div>{`${gold} gold pieces`}</div>
        {escaping && <div>Heading to exit</div>}
      </ReactTooltip>}
    </div>
  );
}

export const ROGUE_STYLES = [RogueImage1, RogueImage2, RogueImage3];

function Rogue({ item }) {
  let { id, level, type, health, gold, escaping, infoBox, mode, webbed } = item;
  let x = item.x * BLOCK_WIDTH;
  let y = item.y * BLOCK_HEIGHT;
  let classname = "block";
  let image = item.ancestry === 'orc' ? OrcRogueImage : ROGUE_STYLES[item.style];
  if (webbed > 0) {
    x += randomNumber(6) - 3;
    y += randomNumber(6) - 3;
  }
  return (
    <div>
      <div className="infobox-hero" data-tip data-for={infoBox ? "" : `tooltip-${id}`}>
        <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`fighter`} />
      </div>
      {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
        <div>{`Level ${level} ${type} (${mode})`}</div>
        <div>{`${health} hit points`}</div>
        <div>{`${gold} gold pieces`}</div>
        {escaping && <div>Heading to exit</div>}
      </ReactTooltip>}
    </div>
  );
}

export const ARCHER_STYLES = [ArcherImage1, ArcherImage2, ArcherImage3];

function Archer({ item }) {
  let { id, level, type, health, gold, escaping, infoBox, mode, webbed } = item;
  let x = item.x * BLOCK_WIDTH;
  let y = item.y * BLOCK_HEIGHT;
  let classname = "block";
  let image = item.ancestry === 'orc' ? OrcArcherImage : ARCHER_STYLES[item.style];
  if (webbed > 0) {
    x += randomNumber(6) - 3;
    y += randomNumber(6) - 3;
  }
  return (
    <div>
      <div className="infobox-hero" data-tip data-for={infoBox ? "" : `tooltip-${id}`}>
        <img src={image} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`archer`} />
        {item.weapon && <img src={WEAPON_STYLES[item.weapon]} className={classname} style={{ left: `${x}px`, top: `${y}px` }} alt={`sword`} />}
      </div>
      {!infoBox && <ReactTooltip id={`tooltip-${id}`} place={item.y < 2 ? "bottom" : "top"}>
        <div>{`Level ${level} ${type} (${mode})`}</div>
        <div>{`${health} hit points`}</div>
        <div>{`${gold} gold pieces`}</div>
        {escaping && <div>Heading to exit</div>}
      </ReactTooltip>}
    </div>
  );
}

/*************************************************************************************/

export function archerAttack(level, hero) {
  //choose a random dir
  let num = randomNumber(4);
  let i = 0;
  //going clockwise, see if any minions in line
  for (i = 0; i < 4; i++) {
    let dir = (num + i) % 4;
    let min = level.minionInLine(hero.x, hero.y, dir);
    if (min) {
      //if so, shoot an arrow
      let offset = randomNumber(15) - 8;
      level.addEffectToMap({
        type: 'arrow',
        level: hero.strength,
        handle: (level, arrow) => moveArrow(level, arrow),
        data: {
          targetClass: 'minions',
          dir,
          delay: 0,
          offset: { x: (dir === 2 || dir === 0) ? offset : 0, y: (dir === 1 || dir === 3) ? offset : 0 }
        }
      }, hero.x, hero.y);
      return min;
    }
  }
}