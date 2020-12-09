import React from 'react';
import axios from 'axios';
import './../resources/admin.css'
import * as CONFIG from '../config.json';

type Props = {
};
type State = {
    loading: boolean,
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

    loading(): JSX.Element {
        return(
            <div key='load_bg' className='loading-bg'>
                <div key='load_content' className='loading-content'>
                    <div key='load_throbber' className='loading-throbber'></div>
                    <div key='load_text' className='loading-text'>Loading...</div>
                </div>
            </div>
        )
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
                //this.setState({ menuOn: false });
                this.clearLoginData();
            }
            else if (response.data === 'FAIL') { console.log('Wrong login information!'); }
            else {
                console.log('UNKNOWN ERROR???')
                console.log('response data: ' + response.data);
            }
        });
    }

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
                <div
                    key='uform_login_butt_in'
                    className={`popup-button`}
                    onClick={() => {this.login()}}
                >Log in</div>
                </div>
            </div>
        );
    }

    render() {
        let rendering = this.template_login();
        let loading = <div key='load_null'></div>
        if (this.state.loading === true) {
            loading = this.loading();
        }
        return(
            <>
                {rendering}
                {loading}
            </>
        );
    }
}
