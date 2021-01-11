import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import AdminPrompt from './prompt';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: {[index: string]: any},
    editing: string,
    pm_message: string,
    pm_action: () => any,
    pm_cancel: () => any,
    pm_noCancel: boolean,
    toDelete: {[index: string]: any},
    toEdit: {[index: string]: any},
};

export default class ManageUsers extends React.Component<Props, State> {
    private dialogue_ref: React.RefObject<AdminPrompt>;
    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
            editing: '',
            pm_message: '',
            pm_action: () => {},
            pm_cancel: () => {},
            pm_noCancel: false,
            toDelete: {
                'id': '',
                'username': '',
            },
            toEdit: {
                'id': '',
                'username': '',
                'email': '',
                'password': '',
                'new': false,
            },
        }

        this.dialogue_ref = React.createRef();
    }

    componentDidMount() {
        this.getUsers();
    }

    /************************************************** API / UI **************************************************/
    getUsers(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_list`)
            .then((response) => {
                const { list } = this.state;
                for (const uid in response.data) {
                    if (list[uid] === undefined) { list[uid] = { '_show': false }; }
                };
                this.setState({ list: response.data });
            });
    };

    toggleDisplayUser(user: string): void {
        let { list } = this.state;
        if (!list.hasOwnProperty(user)) { list[user]._show = false; }
        list[user]._show = !list[user]._show;
        this.setState({ list });
    }

    /************************************************** TEMPLATE **************************************************/
    template_userList(): JSX.Element {
        const { list } = this.state;
        const userList = Object.keys(list); //.reverse()
        let output: JSX.Element[] = [<div key={`userlist_legend`} className={`user-list-legends`}>
            <span key={`userlist_uid_legend`} className={`user-list-uid legends`}>ID</span>
            <span key={`userlist_usn_legend`} className={`user-list-username`}>Username</span>
            <span key={`userlist_nam_legend`} className={`user-list-name`}>Name</span>
            <span key={`userlist_ema_legend`} className={`user-list-email`}>Email</span>
        </div>];

        userList.forEach((user: string) => {
            let on = ''; if (list[user]._show === true) { on = 'on'; }
            let evenListItem = ''; if (parseInt(list[user].uid) % 2 === 0) { evenListItem = '2'; }
            
            const tick = <span key={`userlistT_${user}`} className={`menu-tick ${on}`}>▶</span>

            output.push(<div key={`userlist_${user}`} className={`user-list${evenListItem} ${on}`} onClick={() => {this.toggleDisplayUser(user)}}>
                {tick}
                <span key={`userlist_uid_${user}`} className={`user-list-uid`}>{list[user].uid}</span>
                <span key={`userlist_usn_${user}`} className={`user-list-username`}>{list[user].username}</span>
                <span key={`userlist_nam_${user}`} className={`user-list-name`}>{list[user].name}</span>
                <span key={`userlist_ema_${user}`} className={`user-list-email`}>{list[user].email}</span>
            </div>);
        });
        return <React.Fragment key={`user-contain`}>{output}</React.Fragment>;
    }
    
    template(): JSX.Element {
        return(<div key='acp_user_wrapper' className='acp-u-wrapper'>
            {this.template_userList()}
        </div>)
    }

    /************************************************** RENDER **************************************************/
    render() {
        return this.template();
    }
}