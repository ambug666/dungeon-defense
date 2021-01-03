import React from 'react';
import Popup from "reactjs-popup";

import './WelcomeModal.css';

export function WelcomeModal({ open }) {
    return <div className="welcome-wrapper">
        <Popup
            open={open}
            modal
            closeOnDocumentClick
        >
            <div className="welcome-box">
                <div className="welcome-title"> Dungeon Defense </div>
                <div className="welcome-byline"> By Mike Young mike@intink.com </div>
                <div className="welcome-text"> You have amassed a small amount of gold and need to protect it from maurading bands of so-called "heroes" who keep invading.</div>
                <div className="welcome-text"> Hire minions and creatures, and build traps to protect your treasure. Research new things, expand your lair, and eventually earn enough gold to retire!</div>
                <div className="welcome-text"> Use the help tab in the Market to learn more!</div>
                <div className="welcome-note"> Note: Dungeon Defense saves level data on your computer, but does not track you in any way, nor do we gain information about you.</div>
            </div>

        </Popup>
    </div>;
}