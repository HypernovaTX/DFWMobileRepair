import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    vehicleID: string;
    vehicleName: string;
};
type State = {
    show: number,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},
    EDITING: {[index: string]: any},
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
            'backdrop-filter': 'blur(0px)',
        };
        this.props_bg_down = {
            'background': 'rgba(0, 0, 0, 0)',
            'zIndex': '20',
            'opacity': '1',
            'backdrop-filter': 'blur(0px)',
        };
        this.props_bg_on = {
            'background': 'rgba(0, 0, 0, 0.5)',
            'zIndex': '10',
            'opacity': '1',
            'backdrop-filter': 'blur(8px)',
        };
        

        this.state = {
            show: 0,
            propsBG: this.props_bg_off,
            propsM: { 'top': '-64px', 'opacity': '0' },
            EDITING: {},
        }
    }
    /** API */
    getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=quote`)
            .then((response) => {
                this.setState({ EDITING: response.data });
            });
    };

    saveData(): void {
        
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
    template(): JSX.Element {
        const { propsM } = this.state;
        return(<div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_qe_title' className='admin-qe-title'>{this.props.vehicleName}</div>
            {}
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