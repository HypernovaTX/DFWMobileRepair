import React from 'react';
import * as CONFIG from '../config.json';
import './../resources/404.css';

export default class E404 extends React.Component {
    render() {
        return(
            <div key='p404_body' className='p404-body'>
                <div key='p404_contain' className='p404-contain'>
                    <div key='p404_image' className='p404-image'></div>
                    <div key='p404_text' className='p404-text'>
                        Bummer...Your car broke down in an unknown page. In hindsight it should be kept maintained. (404 - Page Not Found)
                    </div>
                    <div
                        key='p404_bth'
                        className='p404-btn'
                        onClick={() => { window.location.href = CONFIG.root; }}
                    >Return to home</div>
                </div>
            </div>
        );
    }
}