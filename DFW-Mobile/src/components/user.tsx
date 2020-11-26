import React from 'react';
import '.././resources/user.css';
import axios from 'axios';
import * as CONFIG from '../config.json';

type Props = {
};
type State = {
    currentUser: string
    testAny: any
};

export default class User extends React.Component<Props, State> {
    private API_Request: NodeJS.Timeout;
    private API_refreshInterval: number;
    constructor(p: Props) {
        super(p);

        this.state = {
            currentUser: '',
            testAny: '[object Object]'
        }

        //Placeholder NodeJS.Timeout to prevent any errors
        this.API_Request = setInterval(() => {}, 9999999999);
        clearInterval(this.API_Request);

        this.API_refreshInterval = 5000; 
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

    userBar():JSX.Element {
        const { currentUser } = this.state;
        const dis_user = (currentUser === '') ?
            'Guest' : currentUser;


        return (<div key='userbar_main' className='user-bar'>
            <div key='userbar_icon' className='user-icon'>
                <div key='user_text' className='user-text'>
                    {dis_user}
                </div>
                <div key='user_hamburger' className='user-hamburber'>
                    <div key='hbu_1' className='user-hamburger-dash'></div>
                    <div key='hbu_2' className='user-hamburger-dash'></div>
                    <div key='hbu_3' className='user-hamburger-dash'></div>
                </div>
            </div>
        </div>);
    }

    render() {
        return (this.userBar());
    }
}