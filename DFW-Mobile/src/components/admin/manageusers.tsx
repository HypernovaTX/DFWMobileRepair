import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faKey, faTrash } from '@fortawesome/free-solid-svg-icons';
import AdminPrompt from './prompt';
import UserEdit from './useredit';

type Props = {
    loggedIn: boolean,
    uid: string,
    func_updateUsername: (param: any) => any,
    username: string, 
    role: string, 
    func_logout: () => void,
};
type State = {
    list: {[index: string]: any},
    editing: string,
    pm_message: string,
    pm_action: () => any,
    pm_cancel: () => any,
    pm_noCancel: boolean,
    toDelete: string,
    toEdit: {[index: string]: any},
};

export default class ManageUsers extends React.Component<Props, State> {
    private edit_ref: React.RefObject<UserEdit>;
    private dialogue_ref: React.RefObject<AdminPrompt>;
    private _ismounted: boolean = false;

    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
            editing: '',
            pm_message: '',
            pm_action: () => {},
            pm_cancel: () => {},
            pm_noCancel: false,
            toDelete: '',
            toEdit: { 'id': '', 'kind': 'n' },
        }

        this.dialogue_ref = React.createRef();
        this.edit_ref = React.createRef();
    }

    componentDidMount() {
        if (localStorage.getItem('listusers') !== null) {
            const tempObj = localStorage.getItem('listusers');
            this.setState({ list: JSON.parse( tempObj || '{}') });
        }
        this.getUsers();

        this._ismounted = true;
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    /************************************************** API / UI **************************************************/
    notLoggedIn(input: string): void {
        if (input === `12 - User is not logged in!` || input === `"ERROR 12 - User is not logged in!"`) {
            this.props.func_logout();
        }
    }

    getUsers(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_list`)
            .then((response) => {
                this.notLoggedIn(JSON.stringify(response.data)) //ensure it is logged in

                if (this._ismounted && typeof response.data !== 'string') {
                    const { list } = this.state;
                    const jsonData = response.data; //JSON.parse() doesn't work
                    for (const uid in jsonData) {
                        if (!list.hasOwnProperty(uid)) { jsonData[uid]._show = false; }
                        else { jsonData[uid]._show = (!list[uid].hasOwnProperty('_show')) ? false : list[uid]._show; }
                        jsonData[uid]._no_edit = false;
                        jsonData[uid]._no_pw = false;
                        jsonData[uid]._no_delete = false;
                        jsonData[uid]._existingData = true;

                        if (jsonData[uid].username !== this.props.username
                        && jsonData[uid].uid === this.props.uid) {
                            this.props.func_updateUsername(jsonData[uid].username);
                        }
                    };
                    
                    this.setState({ list: jsonData });
                    this.deleteAdditionalKeys();
                    this.saveToLocalStorage();
                }
            }
        );
    };

    deleteAdditionalKeys(): void {
        const { list } = this.state;
        for (const i in list) {
            if (!list[i].hasOwnProperty('_existingData')) { delete list[i]; }
        }
        this.setState({ list });
    }

    saveToLocalStorage(): void {
        let tempObj: {[index: string]: any} = {};
        const { list } = this.state;
        for (const user in list) {
            tempObj[user] = {
                uid: list[user].uid,
                username: list[user].username,
                email: list[user].email,
                _show: list[user]._show,
            };
        }
        localStorage.setItem('listusers', JSON.stringify(tempObj));
    }

    toggleDisplayUser(user: string): void {
        let { list } = this.state;
        if (!list.hasOwnProperty(user)) { list[user]._show = false; }
        list[user]._show = !list[user]._show;
        this.setState({ list });
        this.saveToLocalStorage();
    }

    //Can be called by other instances
    specialMessage = (msg: string, action: () => any, cancel: () => any, confirmOnly: boolean) => {
        this.setState({
            pm_message: msg,
            pm_action: action, 
            pm_cancel: cancel,
            pm_noCancel: confirmOnly,
        });
        if (this.dialogue_ref.current !== null) {
            this.dialogue_ref.current.open();
        }
    };

    deleteUser(uid: string): void {
        const postData = new FormData();
        postData.append('uid', uid);

        if (this.props.role !== '0') {
            const endFunction = () => { this.endEdit(true) };
            this.specialMessage(`Only root admins can delete users!`, endFunction, endFunction, true); return; }

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=user&u=acp_deleteuser`, postData)
        .then((response) => {
            this.notLoggedIn(response.data);

            if (this._ismounted) {
                const { list } = this.state;
                this.endEdit(true);
                if (list.hasOwnProperty(`user${uid}`)) {
                    delete list[`user${uid}`];
                    this.setState({ list });
                }
            }
        });
    }

    /************************************************** EDITING **************************************************/
    startEditing(type: string, id: string | null = null): void {
        this.setState({
            toEdit: { 'id': id || '', 'kind': type, },
        });

        if (this.edit_ref.current !== null) {
            this.edit_ref.current.open();
        }
    }

    endEdit = (refresh: boolean): void => {
        const { list, toEdit } = this.state;
        if (toEdit.id !== '') {
            list[`user${toEdit.id}`]._no_edit = false;
            list[`user${toEdit.id}`]._no_pw = false;
            list[`user${toEdit.id}`]._no_delete = false;
        }
        if (refresh === true) {
            this.getUsers();
        }
        this.setState({ list, toEdit });
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
            const rawPhone = list[user].phone || '';
            const phoneNumber = `(${rawPhone.substring(0,3)}) ${rawPhone.substring(3,6)}-${rawPhone.substring(6,10)}` || '(null)';

            //Prepare Buttons
            let deleteButton = this.template_deleteButton(list, user);
            let editButtons = this.template_editButtons(list, user);
            if (this.props.uid === list[user].uid || this.props.role !== '0') {
                deleteButton = <React.Fragment key='dont_delete_logged_in_user'></React.Fragment>; }
            if (this.props.role !== '0' && this.props.uid !== list[user].uid) {
                editButtons = <React.Fragment key={`no_edit_${list[user].uid}`}></React.Fragment>; }

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
                <span key={`userlist_ema_${user}`} className={`user-list-email mobile`}><b>Email:</b> {list[user].email}</span>
                <span key={`userlist_nam_${user}`} className={`user-list-name`}><b>Name:</b> {list[user].name}</span>
                <span key={`userlist_pho_${user}`} className={`user-list-phone`}><b>Phone:</b> {phoneNumber}</span>
                <span key={`userlist_add_${user}`} className={`user-list-address`}><b>Address:</b> {list[user].address}</span>
                <span key={`userlist_joi_${user}`} className={`user-list-joined`}><b>Joined:</b> {list[user].joined}</span>
                <div key={`${user}_icons`} className='user-edit-section'>
                    {editButtons}
                    {deleteButton}
                </div>
            </div>);
        });
        return <React.Fragment key={`user-contain`}>{output}</React.Fragment>;
    }

    template_editButtons(list: {[index: string]: any}, user: string): JSX.Element {
        return(<React.Fragment key={`temp_ue_button_${list[user].uid}`}>
            <button type='button' key={`${user}_edit`} className='edit-user-icon' disabled={list[user]['_no_edit']}
                onClick={() => {
                    list[user]['_no_edit'] = true; this.setState({ list });
                    this.startEditing('e', list[user].uid);
                }}
            ><FontAwesomeIcon icon={faEdit} /><span key={`${user}_editb_txt`} className='ue-btn-txt'> Edit User</span></button>
            <button type='button' key={`${user}_password`} className='edit-user-icon' disabled={list[user]['_no_pw']}
                onClick={() => {
                    list[user]['_no_pw'] = true; this.setState({ list });
                    this.startEditing('p', list[user].uid);
                }}
            ><FontAwesomeIcon icon={faKey} /><span key={`${user}_passb_txt`} className='ue-btn-txt'> Change Password</span></button>
        </React.Fragment>);
    }

    template_deleteButton(list: {[index: string]: any}, user: string): JSX.Element {
        return (<button type='button' key={`${user}_delete`} className='edit-user-icon' disabled={list[user]['_no_delete']}
        onClick={() => {
            list[user]._no_delete = true;
            this.setState({ list, toDelete: list[user].uid });
            this.specialMessage(
                `Are you sure you want to delete user "${list[user].username}"?`, 
                () => { this.deleteUser(list[user].uid); }, 
                () => { this.endEdit(false); }, 
            false);
        }}><FontAwesomeIcon icon={faTrash} /><span key={`${user}_deleteb_txt`} className='ue-btn-txt'> Delete User</span></button>);
    }
    
    template(): JSX.Element {
        const { toEdit, pm_message, pm_action, pm_cancel, pm_noCancel } = this.state;
        return(<div key='acp_user_wrapper' className='acp-u-wrapper'>
            {this.template_userList()}
            {<UserEdit
                user={toEdit.id}
                kind={toEdit.kind}
                endEditAction={this.endEdit}
                promptOpen={this.specialMessage}
                role={this.props.role}
                me={this.props.uid}
                logout={(value: string) => {this.notLoggedIn(value)}}

                ref={this.edit_ref}
            />}{<AdminPrompt
                message={pm_message}
                action={pm_action}
                cancel={pm_cancel}
                noCancel={pm_noCancel}

                ref={this.dialogue_ref}
            />}
        </div>)
    }

    /************************************************** RENDER **************************************************/
    render() {
        return this.template();
    }
}