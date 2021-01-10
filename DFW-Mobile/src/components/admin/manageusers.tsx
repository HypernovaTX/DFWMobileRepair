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

export class manageUsers extends React.Component<Props, State> {
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
}