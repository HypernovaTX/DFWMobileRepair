import React from 'react';
//import * as CONFIG from '../../config.json';

type Props = {
    message: string,
    action: () => {},
};
type State = {
    show: number,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},
    yes: boolean,
};

export default class AdminPrompt extends React.Component<Props, State> {
    private props_bg_off: {};
    private props_bg_on: {};
    constructor(p: Props) {
        super(p);

        this.props_bg_off = {
            'background': 'rgba(0, 0, 0, 0)',
            'zIndex': '-10',
            'opacity': '0',
            'display': 'none',
        };
        this.props_bg_on = {
            'background': 'rgba(0, 0, 0, 0.5)',
            'zIndex': '10',
            'opacity': '1',
            'display': 'initial',
        };
        

        this.state = {
            show: 0,
            propsBG: this.props_bg_off,
            propsM: {},
            yes: false,
        }
    }

    open(): void {
        this.setState({ show: 1, propsBG: this.props_bg_on });
        setTimeout(() => {
            this.setState({ show: 2 });
        }, 500);
    }

    close(): void {
        let { show } = this.state;
        if (show === 2) {
            this.setState({ show: 3, propsBG: this.props_bg_off });
            setTimeout(() => {
                this.setState({ show: 0 });
            }, 500);
        }
    }

    template(): JSX.Element {
        const { message, action } = this.props;
        const { propsBG } = this.state;
        return(<div key='admin_pm_dbox' className='admin-pm-box' style={propsBG}>
            <div key='admin_pm_msg' className='admin-pm-msg'>{message}</div>
            <div key='admin_pm_bc'  className='admin-pm-buttonbox'>
                <button
                    key='admin_pm_confirm'
                    onClick={() => { this.setState({ yes: true }); this.close(); }}
                    className='admin-pm-btn main'
                >Yes</button>
                <button
                    key='admin_pm_cancel'
                    onClick={() => { this.setState({ yes: false }); this.close(); }}
                    className='admin-pm-btn'
                >No</button>
            </div>
        </div>
        );
    }

    render() {
        return(<div key='admin_pm_body' className='admin-pm-body'></div>);
    }
}