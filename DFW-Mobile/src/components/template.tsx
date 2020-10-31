import React from 'react';
import * as ServiceList from "./services.json"; 

type Props = {
    head_bgy: number,
    head_bgo: number
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
        this.scroll_behavior = { behavior: 'smooth', block: 'start' };
    }

    head(): JSX.Element {
        const { head_bgo, head_bgy } = this.props;
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = {
            backgroundPositionY: head_bgy + head_bgo
        }
        const preventDrag = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
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
        return (
            <div key='content' className='content'>
                { this.head() }
                <div
                    key='section1'
                    className='ct-section section1'
                    ref={this.ref_s1}
                >
                    <div key='about_us' className='section1-box'>
                        <h2>About US</h2>
                        <p>
                            DFW Mobile Repair is a business where we bring the shop to our customers instead having the customer to drive their vehicle all the way to us. We service most of the DFW area.
                        </p>
                    </div>
                </div>
                <div
                    key='section2'
                    className='ct-section section2'
                    ref={this.ref_s2}
                >
                    <div key='about_us' className='section1-box'>
                        <h2>Services</h2>
                        <div key='service_box' className='serviceBox'>
                            {this.services()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    services(): JSX.Element {
        const serOBJ = JSON.parse(JSON.stringify(ServiceList)).default;
        const serviceOption = Object.keys(serOBJ);
        let { sel_service } = this.state;
        let topBar = [<></>];
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
            topBar.push(
                <div key={`service_selector_inner_${serviceName}`} className='service-selector-inner'>
                    <div
                        key={`service_${serviceName}`}
                        className={`serviceBlock ${selected} ${serviceName}`}
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
                <div key='servuce_list_box' className='service-list'>
                    {
                        specificServiceList.map((item, num) => {
                            const SLCN = this.state.service_list_cname;
                            let isRight = '';
                            if (num % 2 === 1) { isRight = 'li-right' }
                            return (
                                <li
                                    key={`ser_list_${num}`}
                                    className={`serv-li ${isRight} ${SLCN[num]}`}
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
            <>
                {this.content()}
            </>
        );
    }
}