import React, { useRef } from 'react';

type Props = {
    head_bgy: number,
    head_bgo: number
};
type State = {};

export default class Template extends React.Component<Props, State> {
    ref_s1: React.RefObject<any>;
    ref_s2: React.RefObject<any>;
    //ref_s3: React.RefObject<any>;
    constructor(p: Props) {
        super(p);
        this.state = {};

        this.ref_s1 = React.createRef();
        this.ref_s2 = React.createRef();

    }

    scrollToMyRef = (ref: React.RefObject<any>) => window.scrollTo(0, ref.current.offsetTop)

    head(): JSX.Element {
        const { head_bgo, head_bgy } = this.props;
        const LOGO_IMG = require('./../resources/images/logo-placeholder1.png');
        const style = {
            backgroundPositionY: head_bgy + head_bgo
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
                            <span
                                key='hl_btn_2'
                                className='land-item'
                                onClick={() => { this.scrollToMyRef(this.ref_s1) }}
                            >ABOUT US</span>
                            <span key='hl_btn_3' className='land-item'>SERVICES</span>
                            <span key='hl_btn_1' className='land-btn'>CONTACT US</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    content(): JSX.Element {
        return (
            <div key='content' className='content' ref={(r) => { this.setState({ ref_s1: r })}}>
                <div
                    key='section1'
                    className='ct-section section1'
                    ref={this.ref_s1}
                >
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

                <div
                    key='section2'
                    className='ct-section section2'
                    ref={this.ref_s2}
                >

                </div>
            </div>
        );
    }
    
    render() {
        return (
            <>
                {this.head()}
            </>
        );
    }
}