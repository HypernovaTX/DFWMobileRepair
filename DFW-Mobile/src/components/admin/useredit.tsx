import React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

type Props = {
    user: string, //must be user ID
    kind: string, //'e' - user edit, 'p' - password, 'n' - new user
    endEditAction: (parameter: any) => void,
    promptOpen: (msg: string, action: () => any, cancel: () => any, confirmOnly: boolean) => void,
};
type State = {
    show: number,
    inBackground: boolean,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},

    DATA: {[index: string]: any},
    editing: {[index: string]: any},

    refresh: boolean
};

export default class UserEdit extends React.Component<Props, State> {
    private props_bg_off: {};
    private props_bg_on: {};
    private props_bg_down: {};
    constructor(p: Props) {
        super(p);

        this.props_bg_off = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '-10', 'opacity': '0', 'backdropFilter': 'blur(0px)' };
        this.props_bg_down = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(0px)' };
        this.props_bg_on = { 'background': 'rgba(0, 0, 0, 0.5)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(8px)' };
        
        this.state = {
            show: 0, inBackground: false, propsBG: this.props_bg_off, propsM: { 'top': '-64px', 'opacity': '0' },
            DATA: {}, editing: {}, refresh: false
        }
    }
    /************************************************** UE - API **************************************************/
    getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.user);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_userinfo`, postData)
        .then((response: AxiosResponse<any>) => {
            this.setState({ DATA: response.data });
        });
    };

    saveData(): void {
        const { DATA } = this.state;

        /*if () {
            this.props.promptOpen(`Vehicle's "Year", "Make", and "Model" cannot be empty!`, () => {}, () => {}, true);
            return;
        }

        const postData = new FormData();
        postData.append('year', YEAR);
        postData.append('make', MAKE);
        postData.append('model', MODEL);
        postData.append('data', JSON.stringify(DATA));
        this.setState({ refresh: true });

        let param = 'update';
        if (this.props.newQuote === true) { param = 'create'; }
        else { postData.append('id', this.props.vehicleID); }
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=${param}`, postData)
        .then(() => {
            this.close();
        });*/
    }

    /************************************************** UE - WINDOW **************************************************/
    open(): void {
        this.setState({
            show: 1,
            propsBG: this.props_bg_on,
            propsM: { 'top': '0px', 'opacity': '1' },
            refresh: false,
        });
        setTimeout(() => {
            if (this.state.show === 1) { this.getData(); }
            setTimeout(() => {
                this.setState({ show: 2 });
            }, 300);
        }, 5);
    }

    close(): void {
        const { show, refresh } = this.state;
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
                this.props.endEditAction(refresh);
            }, 250);
        }
    }

    //Main template
    template(): JSX.Element {
        const { propsM, DATA } = this.state;
        const { kind } = this.props;
        let saveButtonName = 'Create';
        if (kind !== 'n') { saveButtonName = 'Update'; }
        return(<div key='admin_ue_dbox' className='admin-ue-box' style={propsM}>
            {}
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}