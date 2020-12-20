import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    listYear: String[],
    list: object,
    selection: object,
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            listYear: [],
            list: {},
            selection: {},
        }
    }

    componentDidMount() {
        this.getYears();
    }

    getYears(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=year`)
            .then((response) => {
                const responseString = response.data.split(',');
                this.setState({listYear: responseString})
            });
    };

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'></div>;
    }

    render() {
        return this.template();
    }
}