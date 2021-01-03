import React from 'react';
import Popup from "reactjs-popup";

import './Level100WinModal.css';
import HeroesList from './Heroes';

let HERO_LIST = [
    { type: 'fighter', weapon: 'great sword', style: 0, shield: 5, champion: true, ancestry: 'orc' },
    { type: 'archer', weapon: 'bow', style: 1 },
    { type: 'rogue', style: 2 },
    { type: 'fighter', weapon: 'sword', style: 0, shield: 1 },
    { type: 'fighter', weapon: 'mace', style: 1, shield: 2 },
    { type: 'fighter', weapon: 'club', style: 2, shield: 4 },
    { type: 'fighter', weapon: 'great sword', ancestry: 'orc', shield: 3 },
    { type: 'rogue', style: 0 },
    { type: 'archer', weapon: 'bow', ancestry: 'orc', shield: 3 },
    { type: 'fighter', weapon: 'great sword', style: 2, shield: 6, champion: true },
]

export function Level100WinModal({ open }) {

    return <div className="level-100-win-wrapper">
        <Popup
            open={open}
            modal
            closeOnDocumentClick={false}
        >
            <div className="level-100-win-box">
                <div className="level-100-win-title"> <YouWin /> </div>
                <div className="level-100-win-heroes"> {
                    HERO_LIST.map(hero => <HeroesList key={`${hero.type}-${hero.weapon}`} map={{
                        heroes: [{
                            id: `${hero.type}-${hero.weapon}`, style: hero.style, ancestry: hero.ancestry, type: hero.type, champion: hero.champion,
                            shield: hero.shield, weapon: hero.weapon, infoBox: true
                        }]
                    }} />)
                }
                </div>
                <div className="level-100-win-text"> You survived to level 100 and won the game!</div>
                <div className="level-100-win-text"> But can you win in one of the other ways?</div>
                <div className="level-100-win-text"> Reload the page and play again</div>
            </div>

        </Popup>
    </div>;
}

function YouWin() {
    return (<svg viewBox="0 0 74 14" className="you-win-svg">
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Artboard">
                <g id="Group-2" transform="translate(8.000000, 0 )">
                    <rect id="Rectangle" fill="#020202" x="0" y="0" width="60" height="14" rx="4"></rect>
                    <g id="Group" transform="translate(4.000000, 3.500000)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <polyline className="path" id="i" stroke="#FFA685" points="42 0.5 42 6.5"></polyline>
                        <polyline className="path" id="y" stroke="#FFD59E" points="6.5 0.5 3.5 3.5 0.5 0.5 3.5 3.5 3.5 6.5"></polyline>
                        <path className="path" transform="scale(1,-1) translate(0, -7)" d="M18,6.5 L18,2.5 C18,1.3954305 18.8954305,0.5 20,0.5 C21.1045695,0.5 22,1.3954305 22,2.5 L22,6.5" id="u" stroke="#FFA685"></path>
                        <polyline className="path" id="n" stroke="#85A6FF" points="46 6.5 46 0.5 50 6.5 50 0.5"></polyline>
                        <polyline className="path" id="w2" stroke="#D8A7CD" points="34 0.5 36 6.5 38 0.5"></polyline>
                        <path className="path" d="M12,0.5 C13.1045695,0.5 14,1.3954305 14,2.5 L14,4.5 C14,5.6045695 13.1045695,6.5 12,6.5 C10.8954305,6.5 10,5.6045695 10,4.5 L10,2.5 C10,1.3954305 10.8954305,0.5 12,0.5 Z" id="o" stroke="#9BDACA"></path>
                        <polyline className="path" id="w1" stroke="#D8A7CD" points="30 0.5 32 6.5 34 0.5"></polyline>
                    </g>
                </g>
            </g>
        </g>
    </svg>);
}