import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faKey, faTrash } from '@fortawesome/free-solid-svg-icons';
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
                const jsonData = response.data; //JSON.parse() doesn't work
                for (const uid in jsonData) {
                    if (list[uid]?._show === undefined
                     || list[uid]?._no_edit === undefined
                     || list[uid]?._no_pw === undefined 
                     || list[uid]?._no_delete === undefined) {
                        list[uid] = { '_show': false, '_no_edit': false, '_no_pw': false, '_no_delete': false };
                    }
                };
                this.setState({ list: jsonData });
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
            <span key={`userlist_ema_legend`} className={`user-list-email`}>Email</span>
        </div>];

        userList.forEach((user: string) => {
            //Prepare
            let on = ''; if (list[user]._show === true) { on = 'on'; }
            let evenListItem = ''; if (parseInt(list[user].uid) % 2 === 0) { evenListItem = '2'; }
            let rootUser = ''; if (list[user].role === '0') { rootUser = 'rootuser'; }
            const tick = <span key={`userlistT_${user}`} className={`menu-tick ${on}`}>▶</span>
            const rawPhone = list[user].phone;
            const phoneNumber = `(${rawPhone.substring(0,3)}) ${rawPhone.substring(3,6)}-${rawPhone.substring(6,10)}` || '(null)';

            //Put all of the info and items for the userbar
            output.push(<div key={`userlist_${user}`} className={`user-list${evenListItem} ${on}`}>
                <div key={`userlistC_${user}`} className={`user-list-clickable`} onClick={() => {this.toggleDisplayUser(user)}}>
                    {tick}
                    <span key={`userlist_uid_${user}`} className={`user-list-uid`}>{list[user].uid}</span>
                    <span key={`userlist_usn_${user}`} className={`user-list-username ${rootUser}`}>
                        {list[user].username}
                        {(rootUser === 'rootuser') ? ' (root)' : ''}
                    </span>
                    <span key={`userlist_ema_${user}`} className={`user-list-email`}>{list[user].email}</span>
                </div>
                <span key={`userlist_nam_${user}`} className={`user-list-name`}><b>Name:</b> {list[user].name}</span>
                <span key={`userlist_pho_${user}`} className={`user-list-phone`}><b>Phone:</b> {phoneNumber}</span>
                <span key={`userlist_add_${user}`} className={`user-list-address`}><b>Address:</b> {list[user].address}</span>
                <span key={`userlist_joi_${user}`} className={`user-list-joined`}><b>Joined:</b> {list[user].joined}</span>
                <div key={`${user}_icons`} className='user-edit-section'>
                    <button type='button' key={`${user}_edit`} className='edit-user-icon' disabled={list[user]['_no_edit']}
                        onClick={() => { list[user]['_no_edit'] = true; this.setState({ list }); /*this.startEditing(false, vehicle['id'], year, make, model);*/ }}
                    ><FontAwesomeIcon icon={faEdit} /> Edit User</button>
                    <button type='button' key={`${user}_password`} className='edit-user-icon' disabled={list[user]['_no_pw']}
                        onClick={() => { list[user]['_no_pw'] = true; this.setState({ list }); /*this.startEditing(false, vehicle['id'], year, make, model);*/ }}
                    ><FontAwesomeIcon icon={faKey} /> Change Password</button>
                    <button type='button' key={`${user}_edit`} className='edit-user-icon' disabled={list[user]['_no_delete']}
                        onClick={() => { list[user]['_no_delete'] = true; this.setState({ list }); /*this.startEditing(false, vehicle['id'], year, make, model);*/ }}
                    ><FontAwesomeIcon icon={faTrash} /> Delete User</button>
                </div>
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