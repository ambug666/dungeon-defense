import React from 'react';
import HeroesList from './Heroes';
import './InfoBox.css';
import './Market.css';
import { formatGold } from './Market';
import { map } from './Level';
import { BLOCK_HEIGHT } from './constants';

export default function InfoBox({ x, wave, gold, heroes, log, research }) {
    let height = (map.rows.length * BLOCK_HEIGHT) - 8;
    return (
        <div className="info-box" style={{ left: `${x}px`, top: `0px`, height: `${height}px` }}>
            <div className="market-header">
                <div>Wave {wave}</div>
                <div>{formatGold(gold)} Gold</div>
            </div>
            {research && <div className="infobox-subheader">
                <div>Researching: <ResearchText research={research} /></div>
            </div>}

            <div className="info-heroes">
                {heroes.map(hero => <div key={hero.id} className="infobox-items-row">
                    <div className="market-icon-col"><HeroesList map={{
                        heroes: [{
                            id: hero.id, style: hero.style, ancestry: hero.ancestry, type: hero.type, champion: hero.champion,
                            shield: hero.shield, weapon: hero.weapon, infoBox: true
                        }]
                    }} /></div>
                    <div className="market-col-2">
                        <div>{`Level ${hero.level} ${hero.attribute || ''} ${hero.ancestry} ${hero.champion ? "champion" : hero.type}`}</div>
                        <div>{`${formatGold(hero.health)} hit points`}</div>
                        <div>{`${formatGold(hero.gold)} gold pieces`}</div>
                        {(hero.mode === 'random' || hero.mode === 'explorer-random' || hero.mode === 'explorer') && <div>Lost {hero.moves}</div>}
                        {hero.webbed > 0 && <div>Breaking out of Web</div>}
                        {hero.escaping && <div>Heading to exit</div>}
                    </div>
                </div>
                )}
            </div>
            <InfoLog log={log} />
        </div >
    );
}

function ResearchText({ research }) {
    return research.map(r => <div key={r.text}>{r.text}</div>);
}

function InfoLog({ log }) {
    return (
        <div className="info-log">
            <div className="market-header">Log</div>
            {log.map((row, idx) => <div className="log-text" key={idx}>{row}</div>)}
        </div>
    );
}

export function FormattedText({ text, disableReplace }) {
    let search = ["<", ">", "[b]", "[/b]", "[i]", "[/i]"];
    let replace = ["\\<", "\\>", "<b>", "</b>", "<i>", "</i>"];
    let newtext = text;
    if (!disableReplace) {
        search.forEach((s, idx) => newtext = newtext.replaceAll(s, replace[idx]));
    }
    return (
        <span dangerouslySetInnerHTML={{ __html: newtext }} />
    );
}

