import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    listYear: String[],
    list: {[index: string]: any},
    selection: {[index: string]: any},
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
                let { list } = this.state;
                const responseArray = response.data.split(',');
                responseArray.forEach((key: any) => {
                    list[key] = '';
                });
                //list = responseArray.reduce((a: any, year: string) => (a[year] = '', a));
                this.setState({ listYear: responseArray, list })
            });
    };

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'></div>;
    }

    render() {
        return this.template();
    }
}