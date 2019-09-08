import React from 'react'
import './Popup.scss'
import { runPlaylistScript } from './content'

const Popup = () => (
    <div className="Popup">
        <label className="menu">
            <input type="checkbox" checked />
            <div>
                <span />
                <span />
            </div>
        </label>
    </div>
)

export default Popup
