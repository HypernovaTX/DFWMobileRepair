import React from 'react';
import '.././resources/user.css';

type Props = {
};
type State = {
    currentUser: string
};

export default class User extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            currentUser: ''
        }
    }

    userBar():JSX.Element {
        const { currentUser } = this.state;
        const dis_user = (currentUser === '') ?
            'Guest' : currentUser;


        return (<div key='userbar_main' className='user-bar'>
            <div key='userbar_icon' className='user-icon'>
                {dis_user}
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