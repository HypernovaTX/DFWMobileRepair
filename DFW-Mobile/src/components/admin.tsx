import React from 'react';
import axios from 'axios';
import './../resources/admin.css'
import * as CONFIG from '../config.json';

type Props = {
};
type State = {
    loading: boolean,
    loadingLast: boolean,
    loadCanEnd: boolean,
    endLoad: boolean,
    transition: number,
    session: {
        currentUser: string,
        admin: boolean,
    },
    login: {
        username: string,
        password: string,
    },
};

export default class Admin extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            loading: false,
            loadingLast: false,
            loadCanEnd: false,
            endLoad: false,
            transition: 0,
            session: {
                currentUser: '',
                admin: false,
            },
            login: {
                username: '',
                password: '',
            },
        }
    }
    componentDidMount() {
        this.getCurrentUser();
    }

    getCurrentUser(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=check`)
            .then((response) => {
                const responseString = (response.data + '' === 'GUEST')
                    ? ''
                    : response.data + '';
                this.setState({
                    session: {
                        currentUser: responseString,
                        admin: this.state.session.admin
                    },
                });
            });
    };

    clearLoginData(): void {
        let { login } = this.state;
        login = {
            username: '',
            password: '',
        };
        this.setState({ login });
    }

    


    login(): void {
        let postData = new FormData();
        postData.append('username', this.state.login.username);
        postData.append('password', this.state.login.password);
        this.setState({ loading: true });

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=login`, postData)
        .then((response) => {
            if (response.data === 'LOGIN SUCCESS!') {
                //this.popupHide();
                this.getCurrentUser();
                this.setState({ endLoad: true });
                this.clearLoginData();
            }
            else if (response.data === 'FAIL') { console.log('Wrong login information!'); }
            else {
                console.log('UNKNOWN ERROR???')
                console.log('response data: ' + response.data);
            }
        });
    }

    /* TEMPLATES */
    template_login(): JSX.Element {
        return(
            <div key='login_screen' className='login-screen'>
                <div key='login_window' className='login-window'>
                    <span key='login_title_user' className='input-title'>Username</span>
                    <input
                        key = 'login_form_user'
                        type = 'text'
                        value = {this.state.login.username}
                        autoFocus = {true}
                        onChange = {(c: any) => {
                            this.setState({
                                login: {
                                    username: c.target.value,
                                    password: this.state.login.password,
                                }
                            })
                        }}
                        disabled = {false}
                        className = 'form-input-text'
                    ></input>
                    <span key='login_title_pw' className='input-title'>Password</span>
                    <input
                        key = 'login_form_pw'
                        type = 'password'
                        value = {this.state.login.password}
                        onChange = {(c: any) => {
                            this.setState({
                                login: {
                                    username: this.state.login.username,
                                    password: c.target.value,
                                }
                            })
                        }}
                        disabled = {false}
                        className = 'form-input-text'
                    ></input>
                    <button
                        key='uform_login_butt_in'
                        className={`login-button`}
                        onClick={() => {this.login()}}
                    >Log in</button>
                </div>
            </div>
        );
    }

    transition(): JSX.Element {
        let { transition } = this.state;
        const style = { 'opacity': transition / 10 };
        return (
            <div key='transition_cover' className = 'transition-cover' style={style}></div>
        );
    }

    loading(): JSX.Element {
        const { loading, loadingLast, loadCanEnd, endLoad } = this.state;
        const styleOff = { 'opacity': 0, 'zIndex': -1 };
        const styleOn = { 'opacity': 1, 'zIndex': 10 };
        let style = (loading) ? styleOn : styleOff;

        if (loading !== loadingLast) {
            if (loadingLast === false) {
                style = styleOn;
                setTimeout(
                    () => {this.setState({ loadCanEnd: true })},
                    1000
                );
            }
            this.setState({ loadingLast: loading });
        }

        if (loadCanEnd === true && endLoad === true) {
            this.setState({
                loadCanEnd: false,
                endLoad: false,
                loading: false,
            });
        }

        return(
            <div key='load_bg' className='loading-bg' style={style}>
                <div key='load_content' className='loading-content'>
                    <div key='load_throbber' className='loading-throbber'></div>
                    <div key='load_text' className='loading-text'>Loading</div>
                </div>
            </div>
        )
    }

    render() {
        let rendering = this.template_login();
        let loading = this.loading();
        return(
            <>
                {rendering}
                {loading}
            </>
        );
    }
}
