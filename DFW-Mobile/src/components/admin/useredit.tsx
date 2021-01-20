import React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    user: string, //must be user ID
    kind: string, //'e' - user edit, 'p' - password, 'n' - new user
    endEditAction: (parameter: any) => void,
    promptOpen: (msg: string, action: () => any, cancel: () => any, confirmOnly: boolean) => void, 
    me: string, //Current user ID
    role: string, //current user role
    logout: (value: string) => void, //Always calls after an API calls, if the user is not logged in, the system automatically logs out
};
type State = {
    show: number,
    inBackground: boolean,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},

    DATA: {[index: string]: any},
    editing: {[index: string]: any},

    refresh: boolean,
    loading: boolean,
    wait: boolean,
};

export default class UserEdit extends React.Component<Props, State> {
    private props_bg_off: {};
    private props_bg_on: {};
    private props_bg_down: {};
    private _ismounted: boolean = false;
    constructor(p: Props) {
        super(p);

        this.props_bg_off = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '-10', 'opacity': '0', 'backdropFilter': 'blur(0px)' };
        this.props_bg_down = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(0px)' };
        this.props_bg_on = { 'background': 'rgba(0, 0, 0, 0.5)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(8px)' };
        
        this.state = {
            show: 0, inBackground: false, propsBG: this.props_bg_off, propsM: { 'top': '-64px', 'opacity': '0' },
            DATA: {
                username: '', name: '', email: '', phone: '', address: '', role: '', root: false, oldPassword: '', newPassword: '', newPasswordConfirm: '',
            },
            editing: {}, refresh: false, loading: false, wait: false, 
        }
    }

    componentDidMount() { this._ismounted = true; }
    componentWillUnmount() { this._ismounted = false; }
    /************************************************** UE - API **************************************************/
    getData(): void {
        //Make sure this is NOT a new user
        if (this.props.kind === 'n') {
            const ckError = new FormData(); ckError.append('error', '');
            axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=checkLogin`, ckError)
            .then((response: AxiosResponse<string>) => {
                this.props.logout(response.data);
                this.setState({ wait: false });
            });
            return;
        }
        const postData = new FormData();
        postData.append('uid', this.props.user);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_userinfo`, postData)
        .then((response: AxiosResponse<any>) => {
            this.props.logout(JSON.stringify(response.data));

            if (this._ismounted && typeof response.data !== 'string') {
                this.setState({ DATA: response.data });
                const { DATA } = this.state;
                DATA.phone = this.formatPhoneText(this.state.DATA?.phone);
                DATA.root = (DATA.role === '0') ? true : false;
                this.setState({ DATA, wait: false });
            }
        });
    };

    stopLoading = (): void => { this.setState({ loading: false, wait: false }); }

    //Main event call for saving data
    saveData(): void {
        const { loading } = this.state; 
        if (loading) { return; } //don't call more than once
        this.setState({ loading: true, wait: true });
        switch (this.props.kind) {
            case ('n'): this.saveData_info(true); break;
            case ('p'): this.saveData_password(false); break;
            case ('e'): this.saveData_info(false); break;
            default: this.close(); break;
        }
    }
    //Saves user details (editing a user), also saves details and password for new users
    saveData_info(newUser: boolean): void {
        const { DATA } = this.state;
        const errorMsg = (message: string): void => { this.props.promptOpen(message, this.stopLoading, () => {}, true); };
        
        if (DATA.username === '' || DATA.name === '' || DATA.email === '') { errorMsg(`Username, email, and name cannot be empty!`); return; }
        if (this.props.role !== '0' && this.props.me !== this.props.user) { errorMsg(`Only root admins can modify other users!`); return; }
        
        let api_param = 'acp_updateuser';
        if (newUser) {
            api_param = 'acp_newuser';
            if (this.props.role !== '0') { errorMsg(`Only root admins can create new users!`); return; }
            if (DATA.newPassword === '' || DATA.newPasswordConfirm === '') { errorMsg(`Passwords cannot be empty!`); return; }
            if (DATA.newPassword !== DATA.newPasswordConfirm) { errorMsg(`Passwords are not matching!`); return; }
            if (DATA.newPassword.length < 6) { errorMsg(`New password is too short!`); return; }
        }

        //1 -------------- Check for existing username
        const postUser = new FormData();
        postUser.append('username', DATA.username);
        postUser.append('uid', this.props.user);

        //Run the user check request
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=ck_uname`, postUser)
        .then((responseUserCheck: AxiosResponse<any>) => {
            //Username exists
            if (responseUserCheck.data === 'EXISTS') { errorMsg(`Username is taken by another user!`); return; }
            
            //2 -------------- Check for existing email 
            else {
                const postEmail = new FormData();
                postEmail.append('email', DATA.email);
                postEmail.append('uid', this.props.user);

                //Run the email check request
                axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=ck_email`, postEmail)
                .then((responseEmailCheck: AxiosResponse<any>) => {
                    //Email exists
                    if (responseEmailCheck.data === 'EXISTS') { errorMsg(`Email is used by another user!`); return; }

                    //3 ------------ Proceed to save the updated user data
                    else {
                        const postData = new FormData();
                        postData.append('uid', this.props.user);
                        postData.append('username', DATA.username);
                        postData.append('name', DATA.name);
                        postData.append('email', DATA.email);
                        postData.append('phone', DATA.phone.replace(/-/g, ''));
                        postData.append('address', DATA.address);
                        postData.append('role', DATA.role);
                        if (newUser) {
                            postData.append('password', DATA.newPassword);
                        }
                        this.setState({ refresh: true });
                        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=${api_param}`, postData)
                        .then((response) => {
                            this.props.logout(response.data);

                            if (this._ismounted) {
                                setTimeout(() => {
                                    this.close();
                                    setTimeout(() => { this.setState({ loading: false }); }, 200);
                                },1000);
                            }
                        });
                    }
                });
            }
        });
    }
    //Only saves user password
    saveData_password(newUser: boolean): void {
        const { DATA } = this.state;
        const errorMsg = (message: string): void => { this.props.promptOpen(message, this.stopLoading, () => {}, true); };

        //Errors
        if (this.props.role !== '0' && this.props.me !== this.props.user) { errorMsg(`Only root admins can modify other user's passwords!`); return; }
        if (DATA.newPassword === '' || DATA.newPasswordConfirm === '' || DATA.oldPassword === '') { errorMsg(`All of the fields cannot be empty!`); return; }
        if (DATA.newPassword !== DATA.newPasswordConfirm) { errorMsg(`New passwords are not matching!`); return; }
        if (DATA.newPassword === DATA.oldPassword) { errorMsg(`New password cannot be the same as before!`); return; }
        if (DATA.newPassword.length < 6) { errorMsg(`New password is too short!`); return; }
        
        //1 ------ Send the old password with the UID to verify if it matches
        const postOldPW = new FormData();
        postOldPW.append('uid', this.props.user);
        postOldPW.append('password', DATA.oldPassword);
        
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_verifypw`, postOldPW)
        .then((responsePWCheck: AxiosResponse<any>) => {
            //Password fail (but make sure this is NOT a newUser)
            if (responsePWCheck.data === 'FAIL' && !newUser) { errorMsg(`The old password does NOT match for the user "${DATA.username}"!`); return; }

            //2 ------ Send the updated password
            const postNewPW = new FormData();
            postNewPW.append('uid', this.props.user);
            postNewPW.append('password', DATA.oldPassword);
            postNewPW.append('newpassword', DATA.newPassword);

            axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_updatepw`, postNewPW)
            .then((response) => {
                this.props.logout(response.data);

                if (this._ismounted) {
                    setTimeout(() => {
                        this.close();
                        setTimeout(() => { this.setState({ loading: false }); }, 200);
                    },1000);
                }
            });
        }); 
    }

    /************************************************** UE - WINDOW **************************************************/
    open(): void {
        const resetDATA = { username: '', name: '', email: '', phone: '', address: '', role: '', root: false, oldPassword: '', newPassword: '', newPasswordConfirm: '', }
        this.setState({
            show: 1,
            propsBG: this.props_bg_on,
            propsM: { 'top': '0px', 'opacity': '1' },
            refresh: false,
            DATA: resetDATA, 
            wait: true, 
        });
        setTimeout(() => {
            if (this.state.show === 1) { this.getData(); }
            setTimeout(() => {
                this.setState({ show: 2 });

                //No need to load and wait for new user and password
                if (this.props.kind === 'n' || this.props.kind === 'p') {
                    this.setState({ wait: false });
                }
            }, 300);
        }, 5);
    }

    close(): void {
        const { show, refresh } = this.state;
        const resetDATA = { username: '', name: '', email: '', phone: '', address: '', role: '', root: false, oldPassword: '', newPassword: '', newPasswordConfirm: '', }
        this.setState({ DATA: resetDATA });
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
            template: this.template_edit(true), //By default, it is set to New User creation
        };
        if (kind !== 'n') { content = {
            title: (kind === 'e')
                ? 'Update user'
                : 'Change password', 
            ok: 'Update',
            template: (kind === 'e')
                ? this.template_edit(false) //Update user info
                : this.template_password(false), //Update password
        };}

        return(<div key='admin_ue_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_ue_title' className='admin-ue-title'>{content.title}</div>
            {content.template}
            {this.template_buttons(content.ok)}
        </div>);
    }

    template_edit(newUser: boolean): JSX.Element {
        const { DATA, wait } = this.state;
        let password = (newUser === false) 
            ? <React.Fragment key='ue_password_none'></React.Fragment>
            : this.template_password(true);
        return(<div key='admin_ue_edit'  className='admin-ue-content'>
            {this.template_loadTopBar()}
            <div key='aues_username' className='admin_ue_section'>
                <div key='admin_uet_username' className='admin-qe-ttext'>{this.form_important('auesI_uname_title')}Username:</div>
                <input key='admin_uei_username' placeholder={(wait) ? '...' : 'Username'} size={4} 
                    className={`admin-ue-txt`} value={DATA.username} disabled={wait} 
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.username = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_name' className='admin_ue_section'>
                <div key='admin_uet_name' className='admin-qe-ttext'>{this.form_important('auesI_name_title')}Full Name:</div>
                <input key='admin_uei_name' placeholder={(wait) ? '...' : 'Full Name'} size={4} 
                    className={`admin-ue-txt`} value={DATA.name} disabled={wait} 
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.name = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_email' className='admin_ue_section'>
                <div key='admin_uet_email' className='admin-qe-ttext'>{this.form_important('auesI_email_title')}Email Address:</div>
                <input key='admin_uei_email' placeholder={(wait) ? '...' : 'Email'} size={4} 
                    className={`admin-ue-txt`} value={DATA.email} disabled={wait} 
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.email = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_phone' className='admin_ue_section'>
                <div key='admin_uet_phone' className='admin-qe-ttext'>Phone Number:</div>
                <input key='admin_uei_phone' placeholder={(wait) ? '...' : 'Phone'} size={4} 
                    className={`admin-ue-txt`} value={DATA.phone} disabled={wait} 
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.phone = this.formatPhoneText(e.currentTarget.value);
                        this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_address' className='admin_ue_section wide'>
                <div key='admin_uet_address' className='admin-qe-ttext'>Address:</div>
                <input key='admin_uei_address' placeholder={(wait) ? '...' : 'Address'} disabled={wait} 
                    className={`admin-ue-txt`} value={DATA.address} size={8} 
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.address = e.currentTarget.value;
                        this.setState({ DATA });
                    }}></input>
            </div>
            {this.template_rootaccess()}
            {password}
        </div>);
    }

    template_loadTopBar(): JSX.Element {
        const { wait, loading } = this.state;
        if (!loading) {
            const styleSpinner = { animationDuration: '2.0s' };
            return (
                <div key='useredit_toploadbar' className={`ue-toploadbar ${(wait) ? 'show' : ''}`}>
                    <div key={`useredit_load_spinner`} className='ld ld-spin' style={styleSpinner}>
                        <img
                            src={require('./../../resources/images/nut.png')}
                            alt='loading'
                            key={`useredit_load_img`} 
                        ></img>
                    </div> Loading user data...
                </div>
            )
        }
        else {
            return (<React.Fragment key='useredit_toploadbar'></React.Fragment>)
        }
    }

    template_rootaccess(): JSX.Element {
        const { DATA, wait } = this.state;
        if (this.props.user === this.props.me || this.props.role !== '0') { return <React.Fragment key='no_rootedit'></React.Fragment>; }

        return(<React.Fragment key='temp_rootaccess_edit_container'>
            <div key='aues_rootaccess' className='admin_ue_section'>
            <div key='admin_uet_rootaccess' className='admin-qe-ttext'>Root access (ability to edit other users):</div>
            <div key='admin_uei_address' placeholder='Address' 
                className={`admin-ue-check ${(DATA.root) ? 'check' : ''} ${(wait) ? 'disabled' : ''}`} 
                onClick={() => {
                    DATA.root = !DATA.root;
                    DATA.role = (DATA.root) ? '0' : '1'; // 0 - root access, 1 - regular user
                    this.setState({ DATA });
                }}></div>
            </div>
        </React.Fragment>);
    }

    template_password(newUser: boolean): JSX.Element {
        const { DATA, wait } = this.state;
        const form_oldpassword = (newUser)
            ? (<React.Fragment key='temp_oldpassword_section'></React.Fragment>)
            : (<React.Fragment key='temp_oldpassword_section'>
                <div key='aues_oldPW' className='admin_ue_section wide'>
                    <div key='aues_oldPW_title' className='admin-qe-ttext'>{this.form_important('auesI_oldPW_title')}Old password:</div>
                    <input key='aues_oldPW_input' placeholder='Old Password' size={12} type = 'password' disabled={wait} 
                        className={`admin-ue-txt`} value={DATA.oldPassword}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            DATA.oldPassword = e.currentTarget.value; this.setState({ DATA });
                        }}></input>
                </div>
            </React.Fragment>);
        const content = (<React.Fragment key='passwordTemplateVariableContain'>
            {form_oldpassword}
            <div key='aues_newPW' className='admin_ue_section wide'>
                <div key='aues_newPW_title' className='admin-qe-ttext'>{this.form_important('auesI_newPW_title')}New password (min: 6 characters):</div>
                <input key='aues_newPW_input' placeholder='New Password' size={12} type = 'password' disabled={wait} 
                    className={`admin-ue-txt`} value={DATA.newPassword}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.newPassword = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
            <div key='aues_newPW2' className='admin_ue_section wide'>
                <div key='aues_newPW2_title' className='admin-qe-ttext'>{this.form_important('auesI_newPW2_title')}Confirm:</div>
                <input key='aues_newPW2_input' placeholder='Confirm' size={12} type = 'password' disabled={wait} 
                    className={`admin-ue-txt`} value={DATA.newPasswordConfirm}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        DATA.newPasswordConfirm = e.currentTarget.value; this.setState({ DATA });
                    }}></input>
            </div>
        </React.Fragment>);
        const output = (newUser) ? content : <div key='admin_ue_edit'  className='admin-ue-content'>{content}</div>;
        return(output);
    }

    form_important(key: string) {
        return(<span key={key} className='acpform-important'>*</span>)
    }

    template_loadingCover(): JSX.Element {
        const { loading } = this.state;
        let loadCSS: {[index: string]: any} = {};
        const styleSpinner = { animationDuration: '2s' };
        if (loading) { loadCSS = { opacity: 1, zIndex: 10 }; }
        return(
            <div key='useredit_loading_cover' className='loading-cover' style={loadCSS}>
                <div key='useredit_loading_cover_center' className='loading-cover-center'>
                    <div key='useredit_loading_icon' className='ld ld-clock' style={styleSpinner}><img
                            src={require('./../../resources/images/nut.png')}
                            alt='loading'
                            key='useredit_loading_img' 
                    ></img></div>
                    <div key='useredit_loading_txt' className='loading-cover-text'>Saving data...</div>
                </div>
            </div>
        );
    }

    template_buttons(saveButtonName: string): JSX.Element {
        const { wait } = this.state;
        return(<div key='admin_ue_bc'  className='admin-qe-buttonbox'>
            <button
                key='admin_ue_confirm'
                onClick={() => { this.saveData(); }}
                className='admin-qe-btn main'
                disabled={wait} 
            >{saveButtonName}</button>
            <button
                key='admin_ue_cancel'
                onClick={() => { this.close(); }}
                className='admin-qe-btn'
                disabled={wait} 
            >Cancel</button>
        </div>);
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}{this.template_loadingCover()}</div>);
    }
}