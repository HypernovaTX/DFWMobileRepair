import React from 'react';

export default class Template {
    static head(background_y: number): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-placeholder1.png');
        const style = {
            backgroundY: background_y
        }
        return (
            <div key='h_'className='lander' style={style}>
                <div key='h_container' className='lander-contain'>
                    <div key='h_logo' className='logo'>
                        <img
                            key='h_logo_image'
                            src={LOGO_IMG}
                            alt='DFW Mobile Repair Logo'
                        ></img>
                    </div>
                </div>
            </div>
        );
    }

    static content(): JSX.Element {
        return (
            <div className='content'>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
            </div>
        );
    }
    
}