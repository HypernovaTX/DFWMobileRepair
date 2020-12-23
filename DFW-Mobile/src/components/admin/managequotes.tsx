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
                this.setState({ list });
            });
    };

    getMakeModel(year: string, make: string | undefined): void {
        const postData = new FormData();
        postData.append('year', year);

        let requestParam = 'q=make';
        if (make !== undefined) {
            requestParam = 'q=model';
            postData.append('make', make);
        }

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&${requestParam}`, postData)
            .then((response) => {
                let { list } = this.state;
                const responseArray = response.data.split(',');
                responseArray.forEach((key: any) => {
                    list[year][key] = {};
                    if (make !== undefined) {
                        list[year][make][key] = {};
                    }
                });
                this.setState({ list });
            });
    }

    expandYear(year: string): void {
        let selection = this.state.selection;
        if (!selection.hasOwnProperty(year)) {
            selection[year] = {};
        }
        this.setState({ selection });
    }
    removeKey(year: string, make: string | undefined) {
        let selection = this.state.selection;
        if (make !== undefined) {
            delete selection[year][make];
        } else {
            delete selection[year];
        }
        this.setState({ selection });
    }

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'>{this.template_listYears()}</div>;
    }

    template_listYears(): JSX.Element {
        const { list } = this.state;
        const yearList = Object.keys(list).reverse();
        let output = [<div key='year_load' className='quotelist-load'></div>];
        if (yearList.length > 0) { output = []; }

        yearList.forEach((year: string) => {
            output.push(<div
                key={`yearlist_${year}`}
                className='year-list'
                onClick={() => {}}
            >{year}</div>);
        });
        return <>{output}</>;
    }

    template_listMake(year: string): JSX.Element {
        const { list } = this.state;
        const makeList = Object.keys(list[year]).reverse();
        let output = [<div key='make_load' className='quotelist-load2'></div>];
        if (makeList.length > 0) { output = []; }

        makeList.forEach((make: string) => {
            output.push(<div key={`makelist_${year}_${make}`} className='make-list'>{make}</div>);
        });
        return <>{output}</>;
    }

    render() {
        return this.template();
    }
}