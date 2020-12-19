import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: object,
    selection: object,
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
            selection: {},
        }
    }

    getYears(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&u=year`)
            .then((response) => {
                let responseString = response.data.split(',');
                let years = new Set();
            });
    };

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'></div>;
    }

    render() {
        return this.template();
    }
}