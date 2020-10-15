import React from 'react';

export default class Template {
    static head(background_y: number, offset: number): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-placeholder1.png');
        const style = {
            backgroundPositionY: background_y + offset
        }
        const preventDrag = (e: any) => { e.preventDefault(); };
        return (
            <div key='h_'className='lander' style={style}>
                <div key='h_container' className='lander-contain' draggable="false" onDragStart={preventDrag}>
                    <div key='h_logo' className='logo'>
                        <img
                            key='h_logo_image'
                            src={LOGO_IMG}
                            alt='DFW Mobile Repair Logo'
                            draggable="false"
                            onDragStart={preventDrag}
                        ></img>
                        <div key='h_logo_button_section' className='land-btn-section'>
                            <span key='hl_btn_1' className='land-btn'>CONTACT US</span>
                            <span key='hl_btn_2' className='land-item'>ABOUT US</span>
                            <span key='hl_btn_3' className='land-item'>SERVICES</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    static content(): JSX.Element {
        return (
            <div className='content'>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br>
            </div>
        );
    }
    
}