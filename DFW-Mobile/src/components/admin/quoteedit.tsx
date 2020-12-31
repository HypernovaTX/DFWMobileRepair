import React from 'react';

type Props = {
    vehicleID: string;
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

    template(): JSX.Element {
        const { propsM } = this.state;
        return(<div key='admin_pm_dbox' className='admin-pm-box' style={propsM}>
            <div key='admin_pm_msg' className='admin-pm-msg'>{}</div>
            <div key='admin_pm_bc'  className='admin-pm-buttonbox'>
                <button
                    key='admin_pm_confirm'
                    onClick={() => { this.close(); }}
                    className='admin-pm-btn main'
                >Yes</button>
                <button
                    key='admin_pm_cancel'
                    onClick={() => { this.close(); }}
                    className='admin-pm-btn'
                >No</button>
            </div>
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}