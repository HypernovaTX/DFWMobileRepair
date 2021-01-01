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
        });
        setTimeout(() => {
            //Have to delay getData since it take a delay to have vehicle props to be sent over
            this.setState({
                YEAR: this.props.vehicleYear,
                MAKE: this.props.vehicleMake,
                MODEL: this.props.vehicleModel,
            })
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
        this.setState({
            DATA: OLD_DATA,
            YEAR: this.props.vehicleYear,
            MAKE: this.props.vehicleMake,
            MODEL: this.props.vehicleModel,
        });
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
        return (<React.Fragment key='qe_list'>{output}</React.Fragment>);
    }
    template(): JSX.Element {
        const { propsM, YEAR, MAKE, MODEL } = this.state;
        return(<div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_qe_title_sub' className='admin-qe-ttext'>Vehicle Make/Model:</div>
            <div key='admin_qe_title' className='admin-qe-title'>
                <input
                    key={`admin_qe_year`}
                    className='admin-qe-title-txt'
                    value={YEAR}
                    type='number'
                    placeholder='year'
                    size={1}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ YEAR: e.currentTarget.value.replace(/\D/, '') });
                    }}></input>
                <input
                    key={`admin_qe_make`}
                    className='admin-qe-title-txt'
                    value={MAKE}
                    placeholder='make'
                    size={10}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ MAKE: e.currentTarget.value });
                    }}></input>
                <input
                    key={`admin_qe_model`}
                    className='admin-qe-title-txt'
                    value={MODEL}
                    placeholder='model'
                    size={20}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ MODEL: e.currentTarget.value });
                    }}></input>
            </div>
            <div key='admin_qe_content_sub' className='admin-qe-ttext'>List of quotes:</div>
            <div key='admin_qe_content' className='admin-qe-content'>
                {this.template_formatData()}
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