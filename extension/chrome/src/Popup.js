import React from 'react'
import './Popup.scss'
import { runPlaylistScript } from './content'

const Popup = () => {
    return (
        <div className="Popup">
            <div className="Header" />
            <div />
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </div>
    )
}

export default Popup
