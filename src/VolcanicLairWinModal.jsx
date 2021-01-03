import React from 'react';
import Popup from "reactjs-popup";

import './VolcanicLairWinModal.css';

export function VolcanicLairWinModal({ open }) {

    return <div className="volcano-lair-win-wrapper">
        <Popup
            open={open}
            modal
            closeOnDocumentClick={false}
        >
            <div className="volcano-lair-win-box">
                <div className="volcano-lair-win-title"> YOU WIN </div>
                <div className="volcano-lair-win-text"> You bought the expensive Volcano Lair!</div>
                <div className="volcano-lair-win-text"> You won this game!</div>
                <div className="volcano-lair-win-text"> But can you win in one of the other ways?</div>
                <div className="volcano-lair-win-text"> Reload the page and play again</div>
            </div>

        </Popup>
    </div>;
}
