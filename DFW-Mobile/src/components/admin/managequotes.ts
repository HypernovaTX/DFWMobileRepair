import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: object,
    year: string,
    make: string,
    model: string,
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
            year: '',
            make: '',
            model: '',
        }
    }
}