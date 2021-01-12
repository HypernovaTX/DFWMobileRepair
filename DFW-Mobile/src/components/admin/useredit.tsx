import React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../../config.json';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faCheck, faTimes, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

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
            DATA: {
                username: '', name: '', email: '', phone: '', address: '', role: '',
            },
            editing: {}, refresh: false
        }
    }
    /************************************************** UE - API **************************************************/
    getData(): void {
        const postData = new FormData();
        postData.append('uid', this.props.user);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_userinfo`, postData)
        .then((response: AxiosResponse<any>) => {
            this.setState({ DATA: response.data });
            const { DATA } = this.state;
            DATA.phone = this.formatPhoneText(this.state.DATA?.phone);
            this.setState({ DATA });
        });
    };

    saveData(): void {
        //const { DATA } = this.state;

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

    formatPhoneText(value: string): string {
        value = value.replace(/[^0-9\b]/g, '').substring(0, 10);
        
        if (value.length > 3 && value.length <= 6) {
            value = value.slice(0,3) + "-" + value.slice(3);
        } else if (value.length > 6) {
            value = value.slice(0,3) + "-" + value.slice(3,6) + "-" + value.slice(6);
        }
        return value;
    }

    //Main template
    template(): JSX.Element {
        const { propsM } = this.state;
        const { kind } = this.props;

        let content = {
            title: 'New user',
            ok: 'Create',
            template: this.template_edit(true),
        };
        if (kind !== 'n') { content = {
            title: (kind === 'e')
                ? 'Update user'
                : 'Change password', 
            ok: 'Update',
            template: (kind === 'e')
                ? this.template_edit(false)
                : <React.Fragment key='ue_Password'></React.Fragment>,
        };}

        return(<div key='admin_ue_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_ue_title' className='admin-ue-title'>{content.title}</div>
            {content.template}
            {this.template_buttons(content.ok)}
        </div>);
    }

    template_edit(newUser: boolean): JSX.Element {
        const { DATA } = this.state;
        let password = (newUser === false) 
            ? <React.Fragment key='ue_password_none'></React.Fragment>
            : <React.Fragment key='ue_password_placeholder'></React.Fragment>;
        return(<div key='admin_ue_edit'  className='admin-ue-content'>
            <div key='aues_username' className='admin_ue_section'>
                <div key='admin_uet_username' className='admin-qe-ttext'>Username:</div>
                <input
                    key='admin_uei_username' placeholder='username' 
                    className={`admin-ue-txt`} value={DATA.username}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.username = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_name' className='admin_ue_section'>
                <div key='admin_uet_name' className='admin-qe-ttext'>Full Name:</div>
                <input
                    key='admin_uei_name' placeholder='name' 
                    className={`admin-ue-txt`} value={DATA.name}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.name = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_email' className='admin_ue_section'>
                <div key='admin_uet_email' className='admin-qe-ttext'>Email Address:</div>
                <input
                    key='admin_uei_email' placeholder='email' 
                    className={`admin-ue-txt`} value={DATA.email}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.email = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_phone' className='admin_ue_section'>
                <div key='admin_uet_phone' className='admin-qe-ttext'>Phone Number:</div>
                <input
                    key='admin_uei_phone' placeholder='phone'
                    className={`admin-ue-txt`} value={DATA.phone}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.phone = this.formatPhoneText(e.currentTarget.value);
                        this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_address' className='admin_ue_section wide'>
                <div key='admin_uet_address' className='admin-qe-ttext'>Address:</div>
                <input
                    key='admin_uei_address' placeholder='address'
                    className={`admin-ue-txt`} value={DATA.address}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.address = this.formatPhoneText(e.currentTarget.value);
                        this.setState({ DATA });
                    }}></input>
            </div>
            {password}
        </div>);
    }

    template_buttons(saveButtonName: string):JSX.Element {
        return(<div key='admin_ue_bc'  className='admin-qe-buttonbox'>
            <button
                key='admin_ue_confirm'
                onClick={() => { /*this.saveData();*/ }}
                className='admin-qe-btn main'
            >{saveButtonName}</button>
            <button
                key='admin_ue_cancel'
                onClick={() => { this.close(); }}
                className='admin-qe-btn'
            >Cancel</button>
        </div>);
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}