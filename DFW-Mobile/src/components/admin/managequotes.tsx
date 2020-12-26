import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: {[index: string]: any},
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
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
                    list[year] = { '_show': false };
                });
                this.setState({ list });
            });
    };

    getMakeModel(year: string, make: string | null = null): void {
        const postData = new FormData();
        postData.append('year', year);

        let requestParam = 'q=make';
        if (make !== null) {
            requestParam = 'q=model';
            postData.append('make', make);
        }

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&${requestParam}`, postData)
            .then((response) => {
                let { list } = this.state;
                const responseArray = response.data.split(',');
                responseArray.forEach((key: any) => {
                    if (make !== null) {
                        list[year][make][key] = { '_show': false };
                    } else {
                        list[year][key] = { '_show': false };
                    }
                });
                this.setState({ list });
            });
    }

    toggleDisplayYear(year: string): void {
        let { list } = this.state;
        if (!list.hasOwnProperty(year)) {
            list[year]['_show'] = false;
        }
        list[year]['_show'] = !list[year]['_show'];
        this.setState({ list });
    }
    toggleDisplayMake(year: string, make: string): void {
        let { list } = this.state;
        if (!list[year].hasOwnProperty(make)) {
            list[year][make]['_show'] = false;
        }
        
        list[year][make]['_show'] = !list[year][make]['_show'];
        this.setState({ list });
    }

    /*removeKey(year: string, make: string | undefined) {
        let selection = this.state.selection;
        if (make !== undefined) {
            delete selection[year][make];
        } else {
            delete selection[year];
        }
        this.setState({ selection });
    }*/

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
                onClick={() => {this.toggleDisplayYear(year)}}
            >{year}</div>);
            output.push(this.template_listMake(year));
        });
        return <>{output}</>;
    }

    template_listMake(year: string): JSX.Element {
        const { list } = this.state;

        if (Object.keys(list[year]).length <= 1) {
            this.getMakeModel(year);
        }

        const makeList = Object.keys(list[year]).reverse();
        let output = [<div key='make_load' className='quotelist-load2'></div>];
        if (makeList.length > 0) { output = []; }

        let divClassName = '';
        if (list[year]['_show'] === true) { divClassName = 'active'; }

        makeList.forEach((make: string) => {
            if (make !== '_show') {
                output.push(<div
                    key={`makelist_${year}_${make}`}
                    className={`make-list ${divClassName}`}
                    onClick={() => {this.toggleDisplayMake(year, make)}}
                >{make}</div>)
                output.push(this.template_listModel(year, make));
            }
        });
        return <>{output}</>;
    }
    template_listModel(year: string, make: string): JSX.Element {
        const { list } = this.state;

        if (Object.keys(list[year][make]).length <= 1) {
            this.getMakeModel(year, make);
        }

        const makeList = Object.keys(list[year][make]).reverse();
        let output = [<div key='model_load' className='quotelist-load2'></div>];
        if (makeList.length > 0) { output = []; }

        let divClassName = '';
        if (list[year]['_show'] === true && list[year][make]['_show'] === true) {
            divClassName = 'active';
        }

        makeList.forEach((model: string) => {
            if (model !== '_show') {
                output.push(<div
                    key={`modellist_${year}_${make}_${model}`}
                    className={`model-list ${divClassName}`}
                >{model}</div>); 
            }
        });
        return <>{output}</>;
    }

    render() {
        return this.template();
    }
}