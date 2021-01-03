import React from 'react';
import Popup from "reactjs-popup";
import { formatGold } from './Market';

import './BuyLandConfirm.css';

export function BuyLandConfirm({ cost, onCancel, onOK }) {
    return <div className="buy-land-wrapper"> <Popup
        open={true}
        modal
        closeOnDocumentClick={false}
    >
        <div className="buy-land-box">
            <div className="buy-land-title"> Buy Land </div>
            <div className="buy-land-text"> Are you sure you want to spend {formatGold(cost)} gold to buy land? </div>
            <div className="buy-land-footer">
                <button className="buy-land-button buy-land-cancel" onClick={onCancel}>Cancel</button>
                <button className="buy-land-button buy-land-ok" onClick={onOK}>OK</button>
            </div>
        </div>

    </Popup></div>;
}