import React from 'react';

type Props = {
};
type State = {
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

    login(): void {
        
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
}