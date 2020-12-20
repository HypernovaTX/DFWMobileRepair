import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: {[index: string]: any},
    selection: {[index: string]: any},
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
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
                responseArray.forEach((year: any) => {
                    list[year] = {};
                });
                this.setState({ list })
            });
    };

    getMakeModel(isMake: Boolean, year: string, make: string): void {
        const postData = new FormData();
        postData.append('year', year);

        let requestParam = 'q=make';
        if (isMake === false) {
            requestParam = 'q=model';
            postData.append('make', make);
        }

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&${requestParam}`, postData)
            .then((response) => {
                let { list } = this.state;
                const responseArray = response.data.split(',');
                responseArray.forEach((model: any) => {
                    list[year][make] = {};
                    if (isMake === false) {
                        list[year][make][model] = {}
                    }
                    
                });
                this.setState({ list });
            });
    }

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'></div>;
    }

    render() {
        return this.template();
    }
}