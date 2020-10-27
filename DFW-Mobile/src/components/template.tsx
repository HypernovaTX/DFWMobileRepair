import React from 'react';
import * as ServiceList from "./services.json"; 

type Props = {
    head_bgy: number,
    head_bgo: number
};
type State = {
    sel_service: number
};

export default class Template extends React.Component<Props, State> {
    ref_s1: React.RefObject<any>;
    ref_s2: React.RefObject<any>;
    scroll_behavior: { behavior: string; block: string; };
    //ref_s3: React.RefObject<any>;
    constructor(p: Props) {
        super(p);
        this.state = {
            sel_service: 0
        };

        this.ref_s1 = React.createRef();
        this.ref_s2 = React.createRef();
        this.scroll_behavior = { behavior: 'smooth', block: 'start' };
    }

    head(): JSX.Element {
        const { head_bgo, head_bgy } = this.props;
        const LOGO_IMG = require('./../resources/images/logo-placeholder2.png');
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
        let topBar = [<></>];
        const serviceOption = Object.keys(
            JSON.parse(JSON.stringify(ServiceList)).default
        );
        serviceOption.forEach((serviceName) => {
            topBar.push(
                <div key={`service_${serviceName}`} className={`serviceBlock ${serviceName}`}>
                    {serviceName.replace(/(_+)/g, ' ')}
                </div>
            );
        })
        return(
            <>
                <div key='service_selector' className='service-selector'>
                    <div key='service_selector_inner' className='service-selector-inner'>
                        {topBar}
                    </div>
                </div>
            </>
        );
        /** SELECTION OF SERVICES
         * - Brakes
         *      Brake fluid
         *      Brake pads
         *      Brake caliper
         *      Brake rotor/drum
         *      Brake cylinder
         *      Brake lines
         * 
         * - Engine
         *      Oil/oil filter
         *      Spark plugs
         *      Spark plug wires
         *      Ignition coil
         *      Distributor
         *      Starter
         *      Tune-ups
         *      Gaskets
         *      Valve cover
         *      Hoses
         * 
         * - Fuel
         *      Fuel pump
         *      Fuel filter
         *      Fuel injector
         *      Air filter
         *      Intake
         *      Sensors
         *      Throttle
         * 
         * - Cooling
         *      Coolant
         *      Radiator
         *      Thermostat
         *      Water pump
         *      Radiator fan
         *      
         * - Drivetrain
         *      Transmission fluid
         *      Transfer case fluid
         *      Differential fluid
         *      Driveshaft
         *      CV Boot/joint
         *      Differential
         *      U-joints
         * 
         * - Electrical
         *      Battery
         *      Battery terminal/cable
         *      Alternator
         *      Relays
         *      Lights
         * 
         * - Suspension/steering
         *      Shock/strut
         *      Tie rod
         *      Control arm
         *      Ball joint
         *      Sway bar
         *      Bushing
         *      Power steering
         *      Rack and pinion
         *      Wheel hub/bearing
         * 
         * - Climate control
         *      A/C recharge
         *      A/C Compressor
         *      A/C drier
         *      A/C Condenser
         *      A/C lines
         *      A/C relay
         *      Heater core
         *      
         * - Diagnostic
         *      No start
         *      Check/service engine light
         *      Warning lights
         *      Running rouch
         *      Emissions
         *      Leaking
         *      Handling
         *      Unusual noises
         *      User car inspection
         *      Tires
         *     
         * 
         * If your issues are not listed on our list of service, please reach out to us and we will determine whether it is serviceable.
         *      
         */
    }
    
    render() {
        return (
            <>
                {this.content()}
            </>
        );
    }
}