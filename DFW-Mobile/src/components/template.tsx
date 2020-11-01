import React from 'react';
import * as ServiceList from "./services.json"; 
import '.././resources/services.css';

type Props = {
    head_bgy: number,
    head_bgo: number,
    p2_bgy: number
};
type State = {
    sel_service: string,
    service_list_cname: string[],
    service_list_trans: string,
    timeout: NodeJS.Timeout[]
};

export default class Template extends React.Component<Props, State> {
    ref_s1: React.RefObject<any>;
    ref_s2: React.RefObject<any>;
    ref_s3: React.RefObject<any>;
    scroll_behavior: { behavior: string; block: string; };
    //ref_s3: React.RefObject<any>;
    constructor(p: Props) {
        super(p);
        this.state = {
            sel_service: 'Diagnostic',
            service_list_cname: ['done','done','done','done','done','done','done','done','done','done'],
            service_list_trans: 'none',
            timeout: []
        };

        this.ref_s1 = React.createRef();
        this.ref_s2 = React.createRef();
        this.ref_s3 = React.createRef();
        this.scroll_behavior = { behavior: 'smooth', block: 'start' };
    }

    componentDidMount() {
        this.setState({ service_list_trans: '200ms linear all' });
    }

    head(): JSX.Element {
        const { head_bgo, head_bgy } = this.props;
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = { backgroundPositionY: head_bgy + head_bgo };
        const preventDrag = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
        return (
            <div key='M_header'className='lander' style={style}>
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
                                onClick={() => {
                                    this.ref_s1.current.scrollIntoView(this.scroll_behavior);
                                }}
                            >ABOUT US</span>
                            <span
                                key='hl_btn_3'
                                className='land-item'
                                onClick={() => {
                                    this.ref_s2.current.scrollIntoView(this.scroll_behavior);
                                }}
                            >SERVICES</span>
                            <span key='hl_btn_1' className='land-btn'>CONTACT US</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    content(): JSX.Element {
        const { p2_bgy } = this.props;
        const AboutText = "DFW Mobile Repair established in 2014 offering an Auto mobile repair service. We are dedicated to offering you a unique service that adds much needed convenience to your life at affordable rates. We provide you with quality grade parts and quality service. You can rest assured that when a repair is done it is fixed right the first time.";
        const p2Style = { backgroundPositionY: p2_bgy };
        return (
            <div key='M_content' className='content'>
                { this.head() }
                <div
                    key='M_section1'
                    className='ct-section section1'
                    ref={this.ref_s1}
                >
                    <div key='M_section1_box' className='section1-box'>
                        <div key='about_us' className='section1-spanbox'>
                            <h2 key='about_us_h2'>About US</h2>
                            <div key='about_us_p' className='about-p'>{AboutText}</div>
                        </div>
                    </div>
                </div>
                
                <div
                    key='M_section2'
                    className='ct-section section2'
                    ref={this.ref_s2}
                    style={p2Style}
                >
                    <div key='M_section_inner' className='section2-bg'>
                        <div key='services_outer_body' className='section2-box'>
                            <h2 key='services_outer_h2'>Services</h2>
                            <div key='service_box' className='serviceBox'>
                                {this.services()}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    key='M_section3'
                    className='ct-section section1'
                    ref={this.ref_s3}
                >
                    <div key='M_section3_box' className='section1-box'>
                        {this.hours()}
                    </div>
                </div>
            </div>
        );
    }

    hours(): JSX.Element {
        return (
            <div key='hours' className='section1-spanbox'>
                <h2 key='hours_h2'>Hours</h2>
                <div key='hours_container' className='hours-container'>
                    <div key='Hours_l5' className='hours-list'>
                        <span key='HL_5' className='hours-list-l'>Monday - Friday</span>
                        <span key='HR_5' className='hours-list-r'>9:00 AM - 5:00 PM</span>
                    </div>
                    <div key='Hours_l6' className='hours-list'>
                        <span key='HL_6' className='hours-list-l'>Saturday</span>
                        <span key='HR_6' className='hours-list-r'>11:00 AM - 3:00 PM</span>
                    </div>
                    <div key='Hours_l7' className='hours-list'>
                        <span key='HL_7' className='hours-list-l'>Sunday</span>
                        <span key='HR_7' className='hours-list-r'>Closed</span>
                    </div>
                </div>
            </div>
        );
    }

    services(): JSX.Element {
        const serOBJ = JSON.parse(JSON.stringify(ServiceList)).default;
        const serviceOption = Object.keys(serOBJ);
        let { sel_service } = this.state;
        let topBar = [<div key='TopBarUndefined'></div>];
        let specificServiceList: string[] = [];

        const tabClicked = (selection: string, slistArray: string[]) => {
            let { timeout } = this.state;
            console.log('arraySize: '+slistArray.length);

            //clear all other timeouts to prevent display bug
            timeout.forEach((timeoutID) => {
                window.clearTimeout(timeoutID);
            });
            timeout = [];
            
            //Time out for the animation to begin
            timeout.push(
                setTimeout(() => { this.setState({ service_list_trans: '200ms linear all' }); }, 90)
            );

            //Each of the list item has a delayed timing
            slistArray.forEach((val, num) => {
                slistArray[num] = '';
                timeout.push(setTimeout(() => {
                    let getSLCN = this.state.service_list_cname;
                    getSLCN[num] = 'done'
                    this.setState({ service_list_cname: getSLCN });
                }, 100 + (100 * num)));
            });

            //update
            this.setState({
                sel_service: selection,
                service_list_cname: slistArray,
                service_list_trans: 'none',
                timeout
            });
        };

        //Prepare each of the tabs
        serviceOption.forEach((serviceName) => {
            let selected = '';
            if (sel_service === serviceName) {
                specificServiceList = serOBJ[serviceName];
                selected = 'serviceBlockSelected';
            }
            // eslint-disable-next-line
            const keyServiceName = serviceName.replace(/[\s\/+]/g, '_');
            topBar.push(
                <div key={`service_selector_inner_${keyServiceName}`} className='service-selector-inner'>
                    <div
                        key={`service_${keyServiceName}`}
                        className={`serviceBlock ${selected} ${keyServiceName}`}
                        onClick={() => { tabClicked(serviceName, serOBJ[serviceName]) }}
                    >
                        {serviceName.replace(/(_+)/g, ' ')}
                    </div>
                </div>
            );
            
        })
        return(
            <>
                <div key='service_selector' className='service-selector'>
                    <div key={`service_selector_mid`} className='service-selector-mid'>
                        {topBar}
                    </div>
                </div>
                <div key='service_list_box' className='service-list'>
                    {
                        specificServiceList.map((item, num) => {
                            const SLCN = this.state.service_list_cname;
                            return (
                                <li
                                    key={`ser_list_${num}`}
                                    // eslint-disable-next-line
                                    className={`serv-li ${SLCN[num]} ${item.replace(/[\s\/+]/g, '-')}`}
                                    style={{ transition: this.state.service_list_trans }}
                                >
                                    <span style={{display: 'block', fontSize: '2em'}}></span>
                                    {item}
                                </li>
                            );
                        })
                    }
                </div>
            </>
        );
    }
    
    render() {
        return (
            <div key='templateBody'>
                {this.content()}
            </div>
        );
    }
}