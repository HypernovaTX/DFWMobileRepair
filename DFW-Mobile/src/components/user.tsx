import React from 'react';
import '.././resources/user.css';
import axios from 'axios';
import * as CONFIG from '../config.json';

type Props = {
};
type State = {
    testAny: any,
    menuHover: string,
    userBarOn: boolean,
    menuOn: boolean,
    popupVisible: number,
    session: {
        currentUser: string,
        admin: boolean,
    },
    login: {
        username: string,
        password: string,
    },
};

export default class User extends React.Component<Props, State> {
    private API_Request: NodeJS.Timeout;
    private API_refreshInterval: number;
    private listGuest: string[][];
    private listUser: string[][];
    private listAdmin: string[][];

    constructor(p: Props) {
        super(p);

        this.state = {
            testAny: '',
            userBarOn: false,
            menuHover: '',
            menuOn: false, 
            popupVisible: 0, 
            session: {
                currentUser: '',
                admin: false,
            },
            login: {
                username: '',
                password: ''
            }
        }

        //Placeholder NodeJS.Timeout to prevent any errors
        this.API_Request = setInterval(() => {}, 9999999999);
        clearInterval(this.API_Request);

        this.API_refreshInterval = 5000; 
        this.listGuest = [
            ['Login', 'login'],
            ['Register', 'register'],
        ];
        this.listUser = [
            ['Profile', 'profile'],
            ['Settings', 'settings'],
            ['Log Out', 'logout'],
        ]
        this.listAdmin = [
            ['Quotes', 'quotes'],
        ]
    }

    componentDidMount() {
        clearInterval(this.API_Request);
        this.getCurrentUser(); //Initial API request
        //Run API request every X amount of time (see "..\config.json" > General > refreshInterval)
        this.API_Request = setInterval(() => this.getCurrentUser(), this.API_refreshInterval);
    }

    getCurrentUser = () => {
        const postData = {
            headers: {
                  'Access-Control-Allow-Origin': '*',
            }
        }

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=check`, postData)
            .then((response) => {
                const responseString = (response.data + '' === 'GUEST')
                    ? 'Guest'
                    : response.data + '';
                this.setState({
                    session: { currentUser: responseString, admin: this.state.session.admin },
                });
            });
    };

    hamburgerMenuStyle(top: boolean):object {
        const { menuOn } = this.state;
        let result = (menuOn) ? {
            'transform': 'rotate(-45deg) scaleX(1.1)',
            'transform-origin': '2px -1px'
        } : {
            'transform': 'rotate(0) scaleX(1)',
            'transform-origin': '0px 0px'
        };

        if (top === true) {
            result = (menuOn) ? {
                'transform': 'rotate(45deg) scaleX(1.1)',
                'transform-origin': '4px 5px'
            } : {
                'transform': 'rotate(0) scaleX(1)',
                'transform-origin': '0px 0px'
            };
        }
        return result;
    }

    userBar():JSX.Element {
        const { session, menuOn } = this.state;
        const { currentUser } = session;
        const dis_user = (currentUser === '') ?
            'Guest' : currentUser;
        const bgBarStyle = this.userBarScroll();
        const hamburgerTop = this.hamburgerMenuStyle(true);
        const hamburgerCenter = (menuOn) ? { 'opacity': '0' } : { 'opacity': '1' };
        const hamburgerBottom = this.hamburgerMenuStyle(false);

        return (
            <div key='userbar_main' className='user-bar'>
                <div key='userbar_bg' className='userbar-back' style={bgBarStyle}></div>
                <div key='userbar_icon' className='user-icon'>
                    <div key='user_text' className='user-text'>
                        {dis_user}
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
                </div>
                {this.userMenu()}
            </div>
        );
    }

    userBarScroll(): object {
        let barStyle = { opacity: 0, top: -80 };
        if (window.pageYOffset > window.innerHeight * 0) {
            barStyle = { opacity: 1, top: 0 };
        }
        return barStyle;
    }

    userMenu(): JSX.Element {
        const { menuOn } = this.state;

        const height = this.getUserMenuHeight();
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

    getUserMenuHeight(): number {
        const { currentUser, admin } = this.state.session;
        if (currentUser === '') { return 0; }
        else if (currentUser === 'Guest') {
            return this.listGuest.length;
        } else {
            return (admin === true)
                ? this.listUser.length + this.listAdmin.length
                : this.listUser.length
            ;
        }
    }

    userMenuContents(): JSX.Element[] {
        const { currentUser } = this.state.session;
        let output = [<></>];
        if (currentUser === 'Guest') {
            this.listGuest.forEach((item: string[], num: number) => {
                output.push(
                    <span
                        key={`guest_i${num}`}
                        className='user-menu-item'
                    >
                        {item[0]}
                    </span>
                );
            });
            output.shift();
        } else if (currentUser !== '') {
            this.listUser.forEach((item: string[], num: number) => {
                output.push(
                    <span
                        key={`user_i${num}`}
                        className='user-menu-item'
                    >
                        {item[0]}
                    </span>
                );
            });
            output.shift();
        }
        return (output);
    }

    popup(content: JSX.Element | JSX.Element[]): JSX.Element {
        const { popupVisible } = this.state;
        const opacity = (popupVisible === 2)
            ? { opacity: 1 }
            : { opacity: 0 }
        const boxY = { top: (opacity.opacity * 48) - 48 };
        return(
            <div key='u_popup_bg' className='popup-overlay' style={opacity}>
                <div key='popup_box' className='popup-box' style={boxY}>
                    {content}
                </div>
            </div>
        );
    }

    templateLogin(): JSX.Element {
        const { popupVisible } = this.state;
        const disabledButton = (popupVisible === 3) ? 'disabled' : '';
        return (
            <>
                <input
                    key = 'uform_login_user'
                    type = 'text'
                    value = {this.state.login.username}
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
                <input
                    key = 'uform_login_user'
                    type = 'password'
                    value = {this.state.login.username}
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
                    key='u_popup_close'
                    className={`popup-button ${disabledButton}`}
                    onClick={() => {this.login()}}
                >Log in</div>
                <div
                    key='u_popup_close'
                    className={`popup-button ${disabledButton}`}
                    onClick={() => {this.popupHide()}}
                >Cancel</div>
            </>
        )
    }

    login(): void {
        const postData = {
            username: this.state.login.username,
            password: this.state.login.password,
        }
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}`, postData)
        .then((response) => {
            if (response.data === 'MATCH') { console.log('Logged in!'); }
            else if (response.data === 'FAIL') { console.log('Wrong login information!'); }
            else { console.log('CHECK THE CODES!'); }
        });
    }

    popupHide(): void {
        let { popupVisible } = this.state;
        if (popupVisible > 0 || popupVisible < 3) {
            this.setState({popupVisible: 3});
            setTimeout(() => {
                this.setState({popupVisible: 0});
            }, 500);
        }
    }
    popupShow(): void {
        let { popupVisible } = this.state;
        if (popupVisible === 0) {
            this.setState({popupVisible: 1});
            setTimeout(() => {
                this.setState({popupVisible: 2});
            }, 50);
        }
    }

    render() {
        return (<>
            {this.userBar()}
        </>);
    }
}