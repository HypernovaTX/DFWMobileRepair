import React from 'react';
import axios from 'axios';
import './../resources/admin.css'
import './../resources/user.css';
import * as CONFIG from '../config.json';
import ManageQuotes from './admin/managequotes'

type Props = {
};
type State = {
    loading: boolean,
    loadingLast: boolean,
    loadCanEnd: boolean,
    endLoad: boolean,

    transition: number,
    transitionStep: number,
    transitionCommand: () => void,

    loggedin: boolean,
    session: {
        currentUser: string,
        admin: boolean,
    },
    login: {
        username: string,
        password: string,
    },
    adminPanel: string,

    menuHover: string,
    menuOn: boolean,
};

export default class Admin extends React.Component<Props, State> {
    private userMenuItem: [string, number][];
    constructor(p: Props) {
        super(p);

        this.state = {
            loading: false,
            loadingLast: false,
            loadCanEnd: false,
            endLoad: false,

            transition: 0,
            transitionStep: 0,
            transitionCommand: () => {},

            loggedin: false,
            session: {
                currentUser: '',
                admin: false,
            },
            login: {
                username: '',
                password: '',
            },
            adminPanel: 'quote',
            menuHover: '',
            menuOn: false,
        }

        this.userMenuItem = [
            ['Profile', 0],
            ['Settings', 1],
            ['Log Out', 2],
        ];
    }
    componentDidMount() {
        axios.defaults.withCredentials = true;
        this.getCurrentUser();
    }

    getCurrentUser(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=check`)
            .then((response) => {
                let responseString = '';
                let loggedin = false;
                if (response.data + '' !== 'GUEST') {
                    responseString = response.data + '';
                    loggedin = true;
                }
                this.setState({
                    loggedin, 
                    session: {
                        currentUser: responseString,
                        admin: this.state.session.admin,
                    },
                });
            });
    };

    userMenuFunction(input: number): void {
        let test = 'please remove test in line 95 of admin.tsx when done.';
        console.log(test);
        switch (input) {
            default: test = 'xxx'; break;
            case (2): this.logout(); break;
        }
    }

    clearLoginData(): void {
        let { login } = this.state;
        login = {
            username: '',
            password: '',
        };
        this.setState({ login });
    }

    beginTransition(command: () => void): void {
        let { transitionCommand } = this.state;
        this.setState({
            transition: 1,
            transitionStep: 1,
            transitionCommand: command
        });
        setTimeout(() => {
            transitionCommand();
            this.setState({ transition: 0 });
            setTimeout(() => {
                this.setState({ transitionStep: 0 });
            }, 200);
        }, 400);
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
                this.beginTransition(() => { this.setState({ loggedin: true }) });
            }
            else if (response.data === 'FAIL') { console.log('Wrong login information!'); }
            else {
                console.log('UNKNOWN ERROR???')
                console.log('response data: ' + response.data);
            }
        });
    }

    logout(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=logout`)
            .then((response) => {
                if (response.status === 200) {
                    this.setState({ menuOn: false });
                    this.getCurrentUser();
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

    template_adminpanel(): JSX.Element {
        const { session, menuOn, adminPanel, loggedin } = this.state;
        let panel = <div key='admin_none'></div>;
        switch (adminPanel) {
            default: panel = <ManageQuotes loggedIn={loggedin}/>; break;
        }

        const hamburgerTop = this.hamburgerMenuStyle(true);
        const hamburgerCenter = (menuOn) ? { 'opacity': '0' } : { 'opacity': '1' };
        const hamburgerBottom = this.hamburgerMenuStyle(false);

        return(
            <div key='admin_main' className='admin-body'>
                <div key='admin_navbar' className='userbar-back' style={{ opacity: 1 }}>
                    <span key='admin_username' className='user-icon'>
                        <div key='user_text' className='user-text'>
                            {session.currentUser}
                        </div>
                        <div
                            key='user_hamburger'
                            className='user-hamburber'
                            onMouseEnter={() => this.setState({ menuHover: 'hover'})}
                            onMouseLeave={() => this.setState({ menuHover: ''})}
                            onClick={() => {this.setState({ menuOn: !menuOn })}}
                        >
                            <div
                                key='hbu_1'
                                className={`user-hamburger-dash ${this.state.menuHover}`}
                                style={hamburgerTop}
                            ></div>
                            <div
                                key='hbu_2'
                                className={`user-hamburger-dash ${this.state.menuHover}`}
                                style={hamburgerCenter}
                            ></div>
                            <div
                                key='hbu_3'
                                className={`user-hamburger-dash ${this.state.menuHover}`}
                                style={hamburgerBottom}
                            ></div>
                        </div>
                    </span>
                    <span key='nav_item1' className='nav-items'>Manage Quotes</span>
                    <span key='nav_item2' className='nav-items'>Manage User</span>
                    <span key='nav_item3' className='nav-items'>Refresh</span>
                    {this.userMenu()}
                </div>
                <div key='admin_contain' className='admin-contain'>
                    {panel}
                </div>
            </div>
        )
    }

    hamburgerMenuStyle(top: boolean):object {
        const { menuOn } = this.state;
        let result = (menuOn) ? {
            'transform': 'rotate(-45deg) scaleX(1.1)',
            'transformOrigin': '2px -1px'
        } : {
            'transform': 'rotate(0) scaleX(1)',
            'transformOrigin': '0px 0px'
        };

        if (top === true) {
            result = (menuOn) ? {
                'transform': 'rotate(45deg) scaleX(1.1)',
                'transformOrigin': '4px 5px'
            } : {
                'transform': 'rotate(0) scaleX(1)',
                'transformOrigin': '0px 0px'
            };
        }
        return result;
    }

    userMenu(): JSX.Element {
        const { menuOn } = this.state;

        const height = this.userMenuItem.length;
        const userMainBarStyle = {
            'height': (menuOn)
                ? `${(height * 3).toString()}em`
                : '0px'
            ,
        }
        return (
            <div key='user_menu' className='user-menu' style={userMainBarStyle}>
                {this.userMenuContents()}
            </div>
        )
    }

    userMenuContents(): JSX.Element[] {
        let output = [<div key='um_placeholder'></div>];
        this.userMenuItem.forEach((item: [string, number], num: number) => {
            output.push(
                <span
                    key={`guest_i${num.toString()}`}
                    className='user-menu-item'
                    onClick={() => {this.userMenuFunction(item[1])}}
                >
                    {item[0]}
                </span>
            );
        });
        output.shift();
        return (output);
    }

    loading(): JSX.Element {
        const { loading, loadingLast, loadCanEnd, endLoad } = this.state;
        const styleOff = { 'opacity': 0, 'zIndex': -1 };
        const styleOn = { 'opacity': 1, 'zIndex': 10 };
        let style = (loading) ? styleOn : styleOff;

        if (loading !== loadingLast) {
            if (loadingLast === false) {
                style = styleOn;
                setTimeout(() => {this.setState({ loadCanEnd: true })}, 1000);
            }
            setTimeout(
                () => {this.setState({ loadingLast: loading })}, 1);
        }

        if (loadCanEnd === true && endLoad === true) {
            setTimeout(
                () => { this.setState({
                    loadCanEnd: false,
                    endLoad: false,
                    loading: false,
                })},1
            );
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

    transition(): JSX.Element {
        let { transition, transitionStep } = this.state;
        let content = <div key='transition_none'></div>
        
        const style = { 'opacity': transition };
        if (transitionStep > 0) {
            content = <div key='transition_cover' className = 'transition-cover' style={style}></div>;
        }

        return (<>{content}</>);
    }

    testInfo(): JSX.Element {
        return(
            <>
                <div key='test_user'>Username: {this.state.session.currentUser}</div>
                <div key='test_user_reload' onClick={() => {this.getCurrentUser()}}>[RELOAD USERNAME]</div>
            </>
        )
    }

    render() {
        const { loggedin } = this.state;
        let content = this.template_login();
        if (loggedin === true) { content = this.template_adminpanel() }
        return(
            <>
                {content}
                {this.transition()}
                {this.loading()}
            </>
        );
    }
}
