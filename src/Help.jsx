import React, { useState, useEffect } from 'react';
import './Help.css';
import TreasureIcon from './images/treasure/50gold.png';
import GemIcon from './images/gemstones/ruby.png';
import FighterIcon from './images/fighter-icon.png';
import ArcherIcon from './images/archer-icon.png';
import RogueIcon from './images/rogue-icon.png';
import ChampionIcon from './images/champion-icon.png';
import ArrowTrapIcon from './images/traps/arrowtrap.png';
import GasTrapIcon from './images/traps/gastrap.png';
import CaltropsTrapIcon from './images/traps/caltrops.png';
import BoulderTrapIcon from './images/traps/bouldertrap.png';
import GoblinIcon from './images/goblin-icon.png';
import TrollIcon from './images/troll-icon.png';
import HirelingIcon from './images/hireling-icon.png';
import DwarfIcon from './images/dwarf-icon.png';
import SpiderIcon from './images/creatures/spider1.png';
import DragonIcon from './images/creatures/red dragon.png';
import LabIcon from './images/lab.png';
import WorkshopIcon from './images/workshop2.png';
import ArrowWorkshopIcon from './images/arrowworkshop.png';
import GasWorkshopIcon from './images/gasworkshop.png';
let classNames = require('classnames');

const helpIcons = {
    gold: TreasureIcon,
    fighter: FighterIcon,
    archer: ArcherIcon,
    rogue: RogueIcon,
    champion: ChampionIcon,
    gem: GemIcon,
    arrow: ArrowTrapIcon,
    gas: GasTrapIcon,
    caltrops: CaltropsTrapIcon,
    boulder: BoulderTrapIcon,
    goblin: GoblinIcon,
    troll: TrollIcon,
    dwarf: DwarfIcon,
    hireling: HirelingIcon,
    spider: SpiderIcon,
    dragon: DragonIcon,
    lab: LabIcon,
    trap_workshop: WorkshopIcon,
    arrow_trap_workshop: ArrowWorkshopIcon,
    gas_trap_workshop: GasWorkshopIcon,

}

export default function HelpTab(props) {
    const [helpData, setHelpData] = useState(null);

    useEffect(() => {
        if (!helpData) {
            fetch("./help.json")
                .then(response => response.json())
                .then(json => {
                    setHelpData(json);
                });
        }
    });

    return (
        <HelpGroup data={helpData} indent={0} />
    );
}

function HelpGroup(props) {
    const { data, indent } = props;
    return (
        <div>
            {data && data.map(section => {
                return <HelpSection section={section} key={section.title} indent={indent} />
            })}
        </div >
    );
}

function HelpSection(props) {
    const { section, indent } = props;
    const [open, setOpen] = useState(!!section.open);
    return (
        <div key={section.title} style={{ marginLeft: `${indent * 6}px` }}>
            <div onClick={() => setOpen(!open)} ><span className="help-open-icon">{open ? '▼' : '▶'}</span><span className="help-title">{section.title}</span></div>
            {section.text && <HelpText text={section.text} indent={indent} open={open} icon={section.icon} />}
            {open && section.sections && <HelpGroup data={section.sections} indent={indent + 1} />}
        </div>
    );
}

function HelpText(props) {
    const { text, indent, open, icon } = props;
    return (
        <div className={classNames("help-text-group", open ? "" : "help-hidden")} >
            {icon && <img src={helpIcons[icon]} alt={icon} className="help-icon" />}
            {text && text.map((paragraph, idx) => {
                return <div key={`${idx}-text`} style={{ marginLeft: `${indent * 6}px` }}>
                    <div className="help-text">{paragraph}</div>
                </div>
            })}
        </div >
    );
}
