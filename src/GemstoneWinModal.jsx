import React from 'react';
import Popup from "reactjs-popup";

import './GemstoneWinModal.css';
import { GEMSTONE_TYPES, GemImage } from './Treasure';

export function GemstoneWinModal({ open }) {

    return <div className="gem-win-wrapper">
        <Popup
            open={open}
            modal
            closeOnDocumentClick={false}
        >
            <div className="gem-win-box">
                <div className="gem-win-title"> YOU WIN! </div>
                <div className="gem-win-gems"> {
                    GEMSTONE_TYPES.map(gem => <GemImage type={gem} key={gem} />)
                }
                </div>
                <div className="gem-win-text"> You found all the gems and win the game!</div>
                <div className="gem-win-text"> But can you win in one of the other ways?</div>
                <div className="gem-win-text"> Reload the page and play again</div>
            </div>

        </Popup>
    </div>;
}