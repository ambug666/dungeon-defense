import React from 'react';
import ReactTooltip from "react-tooltip";
import './Block.css';
import Treasure5 from './images/treasure/5gold.png';
import Treasure10 from './images/treasure/10gold.png';
import Treasure20 from './images/treasure/20gold.png';
import Treasure50 from './images/treasure/50gold.png';
import Treasure100 from './images/treasure/100gold.png';
import Treasure500 from './images/treasure/500gold.png';
import Treasure1000 from './images/treasure/1000gold.png';
import AmberImage from './images/gemstones/amber.png';
import AmethystImage from './images/gemstones/amethyst.png';
import DiamondImage from './images/gemstones/diamond.png';
import EmeraldImage from './images/gemstones/emerald.png';
import OnyxImage from './images/gemstones/onyx.png';
import RubyImage from './images/gemstones/ruby.png';
import SapphireImage from './images/gemstones/sapphire.png';
import TopazImage from './images/gemstones/topaz.png';
import { BLOCK_WIDTH, BLOCK_HEIGHT, randomNumber, MAP_WIDTH, MAP_HEIGHT, MAP_INCREASE } from './constants';
import { map } from './Level';
import { ROCK_BLOCK } from './Block';

function TreasureList({ onMouseOver }) {
  let items = [];
  onMouseOver = onMouseOver || (() => { });
  map.treasure && map.treasure.forEach((item) => {
    let { id } = item;
    items.push(<Treasure key={id} item={item} onMouseOver={onMouseOver} />);
  });
  map.gems && map.gems.forEach((item) => {
    let { id, found } = item;
    if (found) {
      items.push(<Gemstone key={id} item={item} onMouseOver={onMouseOver} />);
    }
  });
  return items;
}

function Treasure({ item, onMouseOver }) {
  let { id, x, y, value } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  return (
    <div>
      <div className="block" style={{ left: `${x}px`, top: `${y}px` }} onMouseEnter={() => onMouseOver(x, y, item)} data-tip data-for={`tooltip-${id}`}>
        {value < 10 && <img src={Treasure5} alt={`${value} gold`} />}
        {(value >= 10 && value < 20) && <img src={Treasure10} alt={`${value} gold`} />}
        {(value >= 20 && value < 42) && <img src={Treasure20} alt={`${value} gold`} />}
        {(value >= 42 && value < 75) && <img src={Treasure50} alt={`${value} gold`} />}
        {(value >= 75 && value < 475) && <img src={Treasure100} alt={`${value} gold`} />}
        {(value >= 475 && value < 800) && <img src={Treasure500} alt={`${value} gold`} />}
        {(value >= 800) && <img src={Treasure1000} alt={`${value} gold`} />}
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        {`${value} Gold Pieces`}
      </ReactTooltip>
    </div>
  );
}

export const GEMSTONE_TYPES = ["ruby", "amber", "topaz", "emerald", "sapphire", "amethyst", "diamond", "onyx"];

function Gemstone({ item, onMouseOver }) {
  let { id, x, y, value, type } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  let name = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <div>
      <div className="block" style={{ left: `${x}px`, top: `${y}px` }} onMouseEnter={() => onMouseOver(x, y, item)} data-tip data-for={`tooltip-${id}`}>
        <GemImage type={type} />
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        <div>{`${name} Gemstone`}</div>
        <div>{`worth ${value} Gold Pieces`}</div>
      </ReactTooltip>
    </div>
  );
}

export function GemImage({ type }) {
  let images = { ruby: RubyImage, amber: AmberImage, topaz: TopazImage, emerald: EmeraldImage, sapphire: SapphireImage, amethyst: AmethystImage, diamond: DiamondImage, onyx: OnyxImage }
  return <img src={images[type]} alt={type} />;
}

export function initGemstones() {
  let done = [];
  done.length = GEMSTONE_TYPES.length;
  done.fill(false);
  let count = GEMSTONE_TYPES.length;

  //expansion 1
  let num = randomNumber(2) + 1;
  while (num > 0) {
    addGem(1, done);
    num--;
    count--;
  }

  //expansion 2
  num = randomNumber(2) + 1;
  while (num > 0) {
    addGem(2, done);
    num--;
    count--;
  }

  //expansion 3
  num = randomNumber(2) + 1;
  while (num > 0) {
    addGem(3, done);
    num--;
    count--;
  }

  //the rest
  while (count > 0) {
    addGem(0, done);
    count--;
  }
}

function allDone(done) {
  return done.length === done.filter(d => d === true).length;
}

function getGem(done) {
  let gem = randomNumber(GEMSTONE_TYPES.length);
  if (allDone(done)) {
    return gem;
  }
  while (done[gem]) {
    gem = (gem + 1) % GEMSTONE_TYPES.length;
  }
  done[gem] = true;
  return gem;
}

function gemstoneOnSpace(x, y) {
  return map.gems.find(gem => gem.x === x && gem.y === y);
}

function addGem(expansion, done) {
  let x = randomNumber(MAP_WIDTH);
  let y = randomNumber(MAP_HEIGHT);
  let value = 100;
  if (expansion === 1) {
    do {
      x = randomNumber(MAP_INCREASE) + MAP_WIDTH;
      y = randomNumber(MAP_HEIGHT);
      value = 500;
    } while (gemstoneOnSpace(x, y));
  } else if (expansion === 2) {
    do {
      x = randomNumber(MAP_INCREASE) + MAP_WIDTH + MAP_INCREASE;
      y = randomNumber(MAP_HEIGHT);
      value = 1200;
    } while (gemstoneOnSpace(x, y));
  } else if (expansion === 3) {
    do {
      x = randomNumber(MAP_INCREASE + MAP_WIDTH + MAP_INCREASE);
      y = randomNumber(MAP_INCREASE) + MAP_HEIGHT;
    } while (gemstoneOnSpace(x, y));
    value = 2500;
  } else {
    while (map.rows[y][x] !== ROCK_BLOCK || gemstoneOnSpace(x, y)) {
      x = randomNumber(MAP_WIDTH);
      y = randomNumber(MAP_HEIGHT);
    }
  }
  let gem = GEMSTONE_TYPES[getGem(done)];
  map.gems.push({
    id: `${gem}`,
    type: gem,
    x,
    y,
    found: false,
    value,
  });
}

export default TreasureList;
