import React from 'react';
import './Block.css';
import { BLOCK_WIDTH, BLOCK_HEIGHT } from './constants';
import ArrowTrapImage from './images/traps/arrowtrap.png';
import GasTrapImage from './images/traps/gastrap.png';
import CaltropsTrapImage from './images/traps/caltrops.png';
import BoulderTrapImage from './images/traps/bouldertrap.png';
import OverlayImage from './images/cursor.png';
import LairOverlayImage from './images/newlair.png';
import ClearOverlayImage from './images/clear-area.png';
import GoblinImage from './images/minions/goblin2.png';
import HirelingImage from './images/minions/hireling3.png';
import DwarfImage from './images/minions/dwarf1.png';
import TrollImage from './images/minions/troll.png';
import SpiderImage from './images/creatures/spider1.png';
import DragonImage from './images/creatures/green dragon.png';
import LabImage from './images/lab.png';
import WorkshopImage from './images/workshop2.png';
import ArrowWorkshopImage from './images/arrowworkshop.png';
import GasWorkshopImage from './images/gasworkshop.png';

export const HALLWAY_BLOCK = ' ';
export const LAIR_BLOCK = '$';
export const ENTRY_BLOCK = '+';
export const ROCK_BLOCK = 'x';

function Block({ x, y, type, onClick, onMouseOver }) {
  let colors = { [HALLWAY_BLOCK]: 'lightgray', [ROCK_BLOCK]: 'darkgray', [LAIR_BLOCK]: 'pink', [ENTRY_BLOCK]: 'lightyellow' };
  return (
    <div
      className="block"
      style={{ left: `${x * BLOCK_WIDTH}px`, top: `${y * BLOCK_HEIGHT}px`, backgroundColor: colors[type] }}
      onClick={() => onClick(x, y, type)}
      onMouseOver={() => onMouseOver(x, y, type)}
    />
  );
}

const OVERLAY_TYPES = {
  arrow: ArrowTrapImage,
  gas: GasTrapImage,
  caltrops: CaltropsTrapImage,
  boulder: BoulderTrapImage,
  goblin: GoblinImage,
  hireling: HirelingImage,
  dwarf: DwarfImage,
  troll: TrollImage,
  spider: SpiderImage,
  dragon: DragonImage,
  lab: LabImage,
  workshop: WorkshopImage,
  'arrow-workshop': ArrowWorkshopImage,
  'gas-workshop': GasWorkshopImage,
  lair: LairOverlayImage,
  clear: ClearOverlayImage
};

export function Overlay({ x, y, onClick, type }) {
  let image = OVERLAY_TYPES[type] || OverlayImage;
  return (
    <div className="block" style={{ left: `${x * BLOCK_WIDTH}px`, top: `${y * BLOCK_WIDTH}px` }} onClick={() => onClick(x, y, type)}>
      <img src={image} alt={`here`} style={{ opacity: 0.5 }} />
    </div>
  )
}

export default Block;
