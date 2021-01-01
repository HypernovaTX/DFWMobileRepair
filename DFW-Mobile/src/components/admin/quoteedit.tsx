import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    vehicleID: string;
    vehicleYear: string;
    vehicleMake: string;
    vehicleModel: string;
    newQuote: boolean;
};
type State = {
    show: number,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},

    YEAR: string,
    MAKE: string,
    MODEL: string,
    DATA: {[index: string]: any},
};

export default class QuoteEdit extends React.Component<Props, State> {
    private props_bg_off: {};
    private props_bg_on: {};
    private props_bg_down: {};
    constructor(p: Props) {
        super(p);

        this.props_bg_off = {
            'background': 'rgba(0, 0, 0, 0)',
            'zIndex': '-10',
            'opacity': '0',
            'backdropFilter': 'blur(0px)',
        };
        this.props_bg_down = {
            'background': 'rgba(0, 0, 0, 0)',
            'zIndex': '20',
            'opacity': '1',
            'backdropFilter': 'blur(0px)',
        };
        this.props_bg_on = {
            'background': 'rgba(0, 0, 0, 0.5)',
            'zIndex': '10',
            'opacity': '1',
            'backdropFilter': 'blur(8px)',
        };
        

        this.state = {
            show: 0,
            propsBG: this.props_bg_off,
            propsM: { 'top': '-64px', 'opacity': '0' },

            YEAR: this.props.vehicleYear,
            MAKE: this.props.vehicleMake,
            MODEL: this.props.vehicleModel,
            DATA: {},
        }
    }
    /** EVENTS */

    handleKeypress = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') {
          this.getData();
        }
    }

    /** API */
    getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=data`, postData)
        .then((response) => {
            this.setState({ DATA: response.data });
            for (const property in response.data) {
                console.log(`${property}: ${response.data[property]}`);
            }
        });
    };

    saveData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);
        postData.append('year', this.state.YEAR);
        postData.append('make', this.state.MAKE);
        postData.append('model', this.state.MODEL);
        postData.append('data', this.state.DATA.stringify());

        let param = 'update';
        if (this.props.newQuote === true) { param = 'create'; }
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=${param}`, postData)
        .then(() => {
            this.close();
        });
    }

    /** WINDOW */
    open(): void {
        this.setState({
            show: 1,
            propsBG: this.props_bg_on,
            propsM: { 'top': '0px', 'opacity': '1' },
        });
        setTimeout(() => {
            this.setState({ show: 2 });
        }, 300);
    }

    close(): void {
        let { show } = this.state;
        if (show === 2) {
            this.setState({
                show: 3,
                propsBG: this.props_bg_down,
                propsM: { 'top': '64px', 'opacity': '0' },
            });
            setTimeout(() => {
                this.setState({
                    show: 0,
                    propsBG: this.props_bg_off,
                    propsM: { 'top': '-64px', 'opacity': '0' },
                });
            }, 250);
        }
    }

    /** TEMPLATE */
    template_formatData(): JSX.Element {
        const { DATA } = this.state;
        //Object.entries
        return (<></>);
    }
    template(): JSX.Element {
        const { propsM } = this.state;
        const vehicleName = `${this.props.vehicleYear} ${this.props.vehicleMake} ${this.props.vehicleModel}`;
        return(<div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_qe_title' className='admin-qe-title'>{vehicleName}</div>
            <div key='admin_qe_content' className='admin-qe-content'>
                {}
            </div>
            <div key='admin_qe_bc'  className='admin-qe-buttonbox'>
                <button
                    key='admin_qe_confirm'
                    onClick={() => { this.close(); }}
                    className='admin-qe-btn main'
                >Update</button>
                <button
                    key='admin_qe_cancel'
                    onClick={() => { this.close(); }}
                    className='admin-qe-btn'
                >Cancel</button>
            </div>
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}