import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

type Props = {
    loggedIn: boolean;
};
type State = {
    list: {[index: string]: any},
    editing: string,
};


export default class ManageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            list: {},
            editing: '',
        }
    }

    componentDidMount() {
        this.getYears();
    }

    /************************************************** REQUESTS **************************************************/

    getYears(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=year`)
            .then((response) => {
                let { list } = this.state;
                const responseArray = response.data.split(',');
                responseArray.forEach((year: any) => {
                    if (list[year] === undefined) {
                        list[year] = { '_show': false };
                    }
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
                        const splitInfo = key.split(/\[sep\]/);
                        if (list[year][make][splitInfo[0]] === undefined) {
                            list[year][make][splitInfo[0]] = { '_no_delete': false, '_no_edit': false, id: splitInfo[1] };
                        }
                    } else if (list[year][key] === undefined) {
                        list[year][key] = { '_show': false };
                    }
                });
                this.setState({ list });
            });
    }

    /************************************************** TOGGLES **************************************************/

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

    /************************************************** EDITING **************************************************/

    deleteVehicle(id: string, year: string, make: string, model: string): void {
        const postData = new FormData();
        postData.append('id', id);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&delete`, postData).then(() => {
            this.removeKey(year, make, model);
        });
    }

    removeKey(year: string, make: string | undefined, model: string | undefined): void {
        let list = this.state.list;
        if (model !== undefined && make !== undefined) { delete list[year][make][model]; }
        else if (make !== undefined) { delete list[year][make]; }
        else { delete list[year]; }
        this.setState({ list });
    }

    /************************************************** TEMPLATE **************************************************/

    template(): JSX.Element {
        return <div key='mq_body' className='mq-body'>{this.template_listYears()}</div>;
    }

    template_listYears(): JSX.Element {
        const { list } = this.state;
        const yearList = Object.keys(list).reverse();
        let output = [<div key='year_load' className='quotelist-load'></div>];
        if (yearList.length > 0) { output = []; }

        yearList.forEach((year: string) => {
            let on = '';
            if (list[year]['_show'] === true) { on = 'on'; }
            const tick = <span key={`yearlistT_${year}`} className={`menu-tick ${on}`}>▶</span>

            output.push(<div
                key={`yearlist_${year}`}
                className={`year-list`}
                onClick={() => {this.toggleDisplayYear(year)}}
            >{tick}{year}</div>);
            output.push(this.template_listMake(year));
        });
        return <div key={`year-contain`}>{output}</div>;
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
                let on = '';
                if (list[year][make]['_show'] === true) { on = 'on'; }
                const tick = <span key={`makelistT_${year}`} className={`menu-tick ${on}`}>▶</span>

                output.push(<div
                    key={`makelist_${year}_${make}`}
                    className={`make-list ${divClassName}`}
                    onClick={() => {this.toggleDisplayMake(year, make)}}
                >{tick}{make}</div>)
                output.push(this.template_listModel(year, make));
            }
        });
        return <div key={`make-contain${year}`}>{output}</div>;
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
            const keyName = `modellist_${year}_${make}_${model}`;
            const vehicle = list[year][make][model];
            const icons = (
                <div key={`${keyName}_icons`} className='model-edit-section'>
                    <button
                        type='button'
                        key={`${keyName}_edit`}
                        className='edit-icon'
                        disabled={vehicle['_no_edit']}
                        onClick={() => {
                            console.log(`${year} ${make} ${model} edit pressed!`);
                        }}
                    ><FontAwesomeIcon icon={faEdit} /> Edit</button>
                    <button
                        type='button'
                        key={`${keyName}_trash`}
                        className='edit-icon'
                        disabled={vehicle['_no_delete']}
                    ><FontAwesomeIcon icon={faTrash} /> Delete</button>
                </div>
            );

            if (model !== '_show') {
                output.push(<div
                    key={keyName}
                    className={`model-list ${divClassName}`}
                >{icons}{model}</div>); 
            }
        });
        return <div key={`model-contain${year}${make}`}>{output}</div>;
    }

    /************************************************** RENDER **************************************************/
    render() {
        return this.template();
    }
}