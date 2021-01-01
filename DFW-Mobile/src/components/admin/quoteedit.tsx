import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    vehicleID: string,
    vehicleYear: string,
    vehicleMake: string,
    vehicleModel: string,
    newQuote: boolean,
    endEditAction: () => void,
};
type State = {
    show: number,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},

    YEAR: string,
    MAKE: string,
    MODEL: string,
    DATA: {[index: string]: any},
    OLD_DATA: {[index: string]: any},
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

            YEAR: '',
            MAKE: '',
            MODEL: '',
            DATA: {},
            OLD_DATA: {},
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
            this.setState({ DATA: response.data, OLD_DATA: response.data });
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
            YEAR: this.props.vehicleYear,
            MAKE: this.props.vehicleMake,
            MODEL: this.props.vehicleModel,
        });
        setTimeout(() => {
            this.getData();
            setTimeout(() => {
                this.setState({ show: 2 });
            }, 300);
        }, 5);
    }

    close(): void {
        const { show } = this.state;
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
                this.props.endEditAction();
            }, 250);
        }
    }

    reset(): void {
        const { OLD_DATA } = this.state;
        this.setState({ DATA: OLD_DATA });
    }

    /** TEMPLATE */
    template_formatData(): JSX.Element {
        const { DATA } = this.state;
        let output = [<div key='qe_placeholder_cat'></div>];
        //For each of the category (this is the worst codes I have made)
        for (const category in DATA) {
            //"addon" is the list of quotes for each category
            let addon = [<React.Fragment key={`qe_placeholder_entry${category}`}></React.Fragment>];
            if (DATA[category] !== {}) {
                for (const item in DATA[category]) { //EWWW! Nested "for" loops!
                    const forKey = `${category}${item}`;
                    addon.push(
                        <div key={`qe_item_${forKey}`} className='qe-cat'>
                            <input
                                key={`qe_item_input_${forKey}`}
                                value={item}
                                onChange={
                                    (e: React.FormEvent<HTMLInputElement>) => {
                                        DATA[category][e.currentTarget.value] = DATA[category][item];
                                        delete DATA[category][item];
                                        this.setState({ DATA });
                                    }
                                }
                            ></input>
                        </div>
                    );
                }
                addon.push(<div key={`qe_addmore_i_${category}`} className='qe-item add'>Add Quote</div>);
                addon.shift();
            }
            output.push(
                <div key={`qe_cat_${category}`} className='qe-cat'>
                    <input
                        key={`qe_cat_input_${category}`}
                        value={category}
                        onChange={
                            (e: React.FormEvent<HTMLInputElement>) => {
                                DATA[e.currentTarget.value] = DATA[category];
                                delete DATA[category];
                                this.setState({ DATA });
                            }
                        }
                    ></input>
                    {addon}
                </div>
            );
        }
        output.push(<div key='qe_addmore' className='qe-cat add'>Add Category</div>);
        output.shift();
        return (<React.Fragment key='qe_list'>output</React.Fragment>);
    }
    template(): JSX.Element {
        const { propsM, YEAR, MAKE, MODEL } = this.state;
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
                <button
                    key='admin_qe_reset'
                    onClick={() => { this.reset(); }}
                    className='admin-qe-btn'
                >Reset</button>
            </div>
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}