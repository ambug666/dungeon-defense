import React from 'react';
import Popup from "reactjs-popup";

import './SellGemConfirm.css';

export function SellGemConfirm({ onCancel, onOK }) {
    return <div className="sell-gem-wrapper"> <Popup
        open={true}
        modal
        closeOnDocumentClick={false}
    >
        <div className="sell-gem-box">
            <div className="sell-gem-title"> Insufficient Funds </div>
            <div className="sell-gem-text"> Do you want to sell one of your gems for more gold? </div>
            <div className="sell-gem-footer">
                <button className="sell-gem-button sell-gem-cancel" onClick={onCancel}>Cancel</button>
                <button className="sell-gem-button sell-gem-ok" onClick={onOK}>OK</button>
            </div>
        </div>

    </Popup></div>;
}