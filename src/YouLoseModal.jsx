import React from 'react';
import Popup from "reactjs-popup";

import './YouLoseModal.css';

export function YouLoseModal({ open }) {
    return <div className="you-lose-wrapper">
        <Popup
            open={open}
            modal
            closeOnDocumentClick={false}
        >
            <div className="you-lose-box">
                <div className="you-lose-title"> You Lose </div>
                <div className="you-lose-text"> You have run out of gold and have lost.</div>
                <div className="you-lose-text"> Reload the page to try again.</div>
            </div>

        </Popup>
    </div>;
}