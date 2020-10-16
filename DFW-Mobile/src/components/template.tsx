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
                            <span key='hl_btn_2' className='land-item'>ABOUT US</span>
                            <span key='hl_btn_3' className='land-item'>SERVICES</span>
                            <span key='hl_btn_1' className='land-btn'>CONTACT US</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    static content(): JSX.Element {
        return (
            <div key='content' className='content'>
                <div key='section1' className='ct-section section1'>
                    <div key='about_us' className='section1-box'>
                        <h3>About US</h3>
                        <p>
                            DFW Mobile Repair - Lorem ipsum dolor sit amet, 
                            consectetur adipiscing elit, sed do eiusmod tempor 
                            incididunt ut labore et dolore magna aliqua. Ut enim 
                            ad minim veniam, quis nostrud exercitation ullamco 
                            laboris nisi ut aliquip ex ea commodo consequat. Duis 
                            aute irure dolor in reprehenderit in voluptate velit 
                            esse cillum dolore eu fugiat nulla pariatur. Excepteur 
                            sint occaecat cupidatat non proident, sunt in culpa 
                            qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                </div>

                <div key='section2' className='ct-section section2'>

                </div>
            </div>
        );
    }
    
}