import React from 'react';

type Props = {
    message: string,
    action: () => any,
    cancel: () => any,
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
            'zIndex': '10',
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
            yes: false,
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
                let { yes } = this.state;
                if (yes === true) { this.props.action() }
                else { this.props.cancel() }
            }, 250);
        }
    }

    template(): JSX.Element {
        const { message } = this.props;
        const { propsM } = this.state;
        return(<div key='admin_pm_dbox' className='admin-pm-box' style={propsM}>
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
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}