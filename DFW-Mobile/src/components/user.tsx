import React from 'react';
import '.././resources/user.css';
import axios from 'axios';
import * as CONFIG from '../config.json';

type Props = {
};
type State = {
    currentUser: string,
    testAny: any,
    menuHover: string,
    userBarOn: boolean,
    menuOn: boolean,
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
            currentUser: '',
            testAny: '',
            userBarOn: false,
            menuHover: '',
            menuOn: false,
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
                this.setState({ currentUser: responseString });
            });
    };

    /**
     * @param top - 0: center, 1: top, 2: bottom
     */
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
        const { currentUser, menuOn } = this.state;
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
        if (window.pageYOffset > window.innerHeight * 0.25) {
            barStyle = { opacity: 1, top: 0 };
        }
        return barStyle;
    }

    userMenu(): JSX.Element {
        const { menuOn } = this.state;
        const userMainBarStyle = {
            'height': (menuOn)
                ? 'auto' : '0px',
            'padding': (menuOn)? '8px 12px' : '0px'
        }
        return (
            <div key='user_menu' className='user-menu' style={userMainBarStyle}>
                {this.userMenuContents()}
            </div>
        )
    }

    userMenuContents(): JSX.Element[] {
        const { currentUser } = this.state;
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
        }
        return (output);
    }

    render() {
        return (<>
            {this.userBar()}
        </>);
    }
}