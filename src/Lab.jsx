import React from 'react';
import ReactTooltip from "react-tooltip";
import './Block.css';
import LabImage1 from './images/lab.png';
import LabImage2 from './images/lab2.png';
import LabImage3 from './images/lab3.png';
import WorkshopImage1 from './images/workshop.png';
import WorkshopImage2 from './images/workshop2.png';
import ArrowWorkshopImage from './images/arrowworkshop.png';
import GasWorkshopImage from './images/gasworkshop.png';
import { BLOCK_WIDTH, BLOCK_HEIGHT } from './constants';

function LabList({ map, onMouseOver }) {
  let items = [];
  onMouseOver = onMouseOver || (() => { });
  map.labs && map.labs.forEach((item) => {
    let { id, type } = item;
    switch (type) {
      case 'lab':
        items.push(<Lab key={id} item={item} onMouseOver={onMouseOver} />);
        break;
      case 'workshop':
        items.push(<Workshop key={id} item={item} onMouseOver={onMouseOver} />);
        break;
      case 'arrow-workshop':
        items.push(<ArrowWorkshop key={id} item={item} onMouseOver={onMouseOver} />);
        break;
      case 'gas-workshop':
        items.push(<GasWorkshop key={id} item={item} onMouseOver={onMouseOver} />);
        break;
      default:
        break;
    }
  });
  return items;
}

export const LAB_STYLES = [LabImage1, LabImage2, LabImage3];

function Lab({ item, onMouseOver }) {
  let { id, x, y, style } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  return (
    <div>
      <div
        className="block"
        style={{ left: `${x}px`, top: `${y}px` }}
        onMouseEnter={() => onMouseOver(x, y, item)}
        data-tip data-for={`tooltip-${id}`}>
        <img src={LAB_STYLES[style]} alt={`research lab`} />
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        {`Research Laboratory`}
      </ReactTooltip>
    </div>
  );
}

export const WORKSHOP_STYLES = [WorkshopImage1, WorkshopImage2];

function Workshop({ item, onMouseOver }) {
  let { id, x, y, style } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  return (
    <div>
      <div
        className="block"
        style={{ left: `${x}px`, top: `${y}px` }}
        onMouseEnter={() => onMouseOver(x, y, item)}
        data-tip data-for={`tooltip-${id}`}>
        <img src={WORKSHOP_STYLES[style]} alt={`trap workshop`} />
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        {`Trap Workshop`}
      </ReactTooltip>
    </div>
  );
}

function ArrowWorkshop({ item, onMouseOver }) {
  let { id, x, y } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  return (
    <div>
      <div
        className="block"
        style={{ left: `${x}px`, top: `${y}px` }}
        onMouseEnter={() => onMouseOver(x, y, item)}
        data-tip data-for={`tooltip-${id}`}>
        <img src={ArrowWorkshopImage} alt={`arrow workshop`} />
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        {`Arrow Workshop`}
      </ReactTooltip>
    </div>
  );
}

function GasWorkshop({ item, onMouseOver }) {
  let { id, x, y } = item;
  x = x * BLOCK_WIDTH;
  y = y * BLOCK_HEIGHT;
  return (
    <div>
      <div
        className="block"
        style={{ left: `${x}px`, top: `${y}px` }}
        onMouseEnter={() => onMouseOver(x, y, item)}
        data-tip data-for={`tooltip-${id}`}>
        <img src={GasWorkshopImage} alt={`gas workshop`} />
      </div>
      <ReactTooltip id={`tooltip-${id}`}>
        {`Gas Workshop`}
      </ReactTooltip>
    </div>
  );
}

export default LabList;
