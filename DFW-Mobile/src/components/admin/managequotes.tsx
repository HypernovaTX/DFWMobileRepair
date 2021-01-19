import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import AdminPrompt from './prompt';
import QuoteEdit from './quoteedit';

type Props = {
    loggedIn: boolean,
    uid: string,
    func_logout: () => void,
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


export default class ManageQuotes extends React.Component<Props, State> {
    private dialogue_ref: React.RefObject<AdminPrompt>;
    private edit_ref: React.RefObject<QuoteEdit>;
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
            toDelete: {
                'id': '',
                'year': '',
                'make': '',
                'model': '',
            },
            toEdit: {
                'id': '1',
                'year': '2020',
                'make': 'Ford',
                'model': 'Mustang GT',
                'new': false,
            },
        }

        this.dialogue_ref = React.createRef();
        this.edit_ref = React.createRef();
    }

    componentDidMount() {
        this.getYears();
        this._ismounted = true;
    }
    
    componentWillUnmount() { this._ismounted = false; }

    /************************************************** REQUESTS **************************************************/

    getYears(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=year`)
            .then((response) => {
                let { list } = this.state;
                this.notLoggedIn(response.data);
                //console.log(response.data);

                if (this._ismounted) {
                    const responseArray = response.data.split(',');
                    responseArray.forEach((year: any) => {
                        if (list[year] === undefined) {
                            list[year] = { '_show': false };
                        } else if (list[year]?._show === true) {
                            this.getMakeModel(year);
                        }
                    });
                    this.setState({ list });
                }
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
                this.notLoggedIn(response.data);

                if (this._ismounted) {
                    let { list } = this.state;
                    const responseDataRaw = response.data+'';
                    const responseArray = responseDataRaw.split(',');
                    responseArray.forEach((key: any) => {
                        if (make !== null) {
                            const splitInfo = key.split(/\[sep\]/);
                            if (list[year][make][splitInfo[0]] === undefined) {
                                list[year][make][splitInfo[0]] = { '_no_delete': false, '_no_edit': false, id: splitInfo[1] };
                            }
                        } else {
                            if (list[year][key] === undefined) {
                                list[year][key] = { '_show': false };
                            } else  if (list[year][key]?._show === true) {
                                this.getMakeModel(year, key);
                            }
                        }
                    });
                    this.setState({ list });
                }
            });
    }

    notLoggedIn(input: string): void {
        if (input === `ERROR 12 - User is not logged in!` || input === `"ERROR 12 - User is not logged in!"`) {
            this.props.func_logout();
        }
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

    /************************************************** TOGGLES **************************************************/

    toggleDisplayYear(year: string): void {
        let { list } = this.state;
        if (!list.hasOwnProperty(year)) {
            list[year]['_show'] = false;
        }

        if (Object.keys(list[year]).length <= 1) {
            this.getMakeModel(year);
        }

        list[year]['_show'] = !list[year]['_show'];
        this.setState({ list });
    }
    toggleDisplayMake(year: string, make: string): void {
        let { list } = this.state;
        if (!list[year].hasOwnProperty(make)) {
            list[year][make]['_show'] = false;
        }

        if (Object.keys(list[year][make]).length <= 1) {
            this.getMakeModel(year, make);
        }
        
        list[year][make]['_show'] = !list[year][make]['_show'];
        this.setState({ list });
    }

    /************************************************** EDITING **************************************************/

    diagDeleteVehicle(id: string, year: string, make: string, model: string): void {
        this.setState({
            pm_message: `Confirm to delete all of the quotes of "${year} ${make} ${model}"?`,
            pm_action: () => {this.deleteVehicle()}, 
            pm_cancel: () => {this.cancelDelete()}, 
            toDelete: {
                'id': id,
                'year': year,
                'make': make,
                'model': model,
            },
        });
        if (this.dialogue_ref.current !== null) {
            this.dialogue_ref.current.open();
        }
    }

    startEditing(New: boolean, id: string | null = null, year: string | null = null, make: string | null = null, model: string | null = null): void {
        this.setState({
            toEdit: {
                'id': id || '',
                'year': year || '',
                'make': make || '',
                'model': model || '',
                'new': New,
            },
        });

        if (this.edit_ref.current !== null) {
            this.edit_ref.current.open();
        }
    }
    endEdit = (refresh: boolean): void => {
        const { list, toEdit } = this.state;
        if (toEdit.year !== '' && toEdit.make !== '' && toEdit.model !== '') {
            list[toEdit.year][toEdit.make][toEdit.model]['_no_edit'] = false;
        }
        if (refresh === true) {
            this.getYears();
        }
        this.setState({ list });
    }

    cancelDelete(): void {
        const { list, toDelete } = this.state;
        list[toDelete.year][toDelete.make][toDelete.model]['_no_delete'] = false;
        this.setState({ list });
    }

    deleteVehicle(): void {
        const { toDelete } = this.state;
        const postData = new FormData();
        postData.append('id', toDelete.id);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=delete`, postData).then((response) => {
            this.notLoggedIn(response.data);
            if (this._ismounted) {
                this.removeKey(toDelete.year, toDelete.make, toDelete.model); }
        });
    }

    removeKey(year: string, make: string | null = null, model: string | null = null): void {
        let list = this.state.list;
        if (model !== null && make !== null) {
            delete list[year][make][model];
            if (Object.keys(list[year][make]).length <= 1) {
                this.removeKey(year, make);
            }
        }
        else if (make !== null) {
            delete list[year][make];
            if (Object.keys(list[year]).length <= 1) {
                this.removeKey(year);
            }
        }
        else {
            delete list[year];
        }
        this.setState({ list });
    }

    /************************************************** TEMPLATE **************************************************/

    template(): JSX.Element {
        const { pm_message, pm_action, pm_cancel, pm_noCancel, toEdit } = this.state;
        return <div key='mq_body' className='mq-body'>
            {this.template_listYears()}
            <AdminPrompt
                message={pm_message}
                action={pm_action}
                cancel={pm_cancel}
                noCancel={pm_noCancel}

                ref={this.dialogue_ref}
            />
            <QuoteEdit
                vehicleID={toEdit.id}
                vehicleYear={toEdit.year}
                vehicleMake={toEdit.make}
                vehicleModel={toEdit.model}
                newQuote={toEdit.new}
                endEditAction={this.endEdit}
                promptOpen={this.specialMessage}
                logout={(value: string) => {this.notLoggedIn(value)}}

                ref={this.edit_ref}
            />
        </div>;
    }

    templateLoadBar(nameKey: string, alt: string = ''): JSX.Element {
        const styleSpinner = { animationDuration: '2.0s' };
        return(
            <div key={`${nameKey}_load_outer`} className={`quotelist-load${alt}`}>
                <div key={`${nameKey}_load_spinner`} className='ld ld-spin' style={styleSpinner}>
                    <img
                        src={require('./../../resources/images/nut.png')}
                        alt='loading'
                        key={`${nameKey}_load_img`} 
                    ></img>
                </div>
            </div>
        );
    }

    template_listYears(): JSX.Element {
        const { list } = this.state;
        const yearList = Object.keys(list).reverse();
        let output = [this.templateLoadBar('year')];
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
        return <React.Fragment key={`year-contain`}>{output}</React.Fragment>;
    }

    template_listMake(year: string): JSX.Element {
        const { list } = this.state;

        let divClassName = '';
        if (list[year]['_show'] === true) { divClassName = 'active'; }

        const makeList = Object.keys(list[year]).reverse();
        let output = [this.templateLoadBar(`make_${year}`, `2 ${divClassName}`)];
        if (makeList.length > 1) { output = []; }
        

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
        return <React.Fragment key={`make-contain${year}`}>{output}</React.Fragment>;
    }

    template_listModel(year: string, make: string): JSX.Element {
        const { list } = this.state;

        let divClassName = '';
        if (list[year]['_show'] === true && list[year][make]['_show'] === true) {
            divClassName = 'active';
        }

        const makeList = Object.keys(list[year][make]).reverse();
        let output = [this.templateLoadBar(`model_${year}_${make}`, `2 ${divClassName}`)];
        if (makeList.length > 1) { output = []; }

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
                            list[year][make][model]['_no_edit'] = true;
                            this.setState({ list });
                            this.startEditing(false, vehicle['id'], year, make, model);
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        <span key={`${keyName}_editbut_text`} className='list-button-txt'> Edit</span>
                    </button>
                    <button
                        type='button'
                        key={`${keyName}_trash`}
                        className='edit-icon'
                        disabled={vehicle['_no_delete']}
                        onClick={() => {
                            list[year][make][model]['_no_delete'] = true;
                            this.setState({ list });
                            this.diagDeleteVehicle(vehicle['id'], year, make, model);
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        <span key={`${keyName}_delbut_text`} className='list-button-txt'> Delete</span>
                    </button>
                </div>
            );

            if (model !== '_show') {
                output.push(<div
                    key={keyName}
                    className={`model-list ${divClassName}`}
                >{icons}{model}</div>); 
            }
        });
        return <React.Fragment key={`model-contain${year}${make}`}>{output}</React.Fragment>;
    }

    /************************************************** RENDER **************************************************/
    render() {
        return this.template();
    }
}