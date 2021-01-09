import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

///TO-DO: Need to convert OBJ to arrays for this.state.DATA for better ordering capabilities

type Props = {
    vehicleID: string,
    vehicleYear: string,
    vehicleMake: string,
    vehicleModel: string,
    newQuote: boolean,
    endEditAction: () => void,
    promptOpen: (msg: string, action: () => any, cancel: () => any, confirmOnly: boolean) => void,
};
type State = {
    show: number,
    inBackground: boolean,
    propsBG: {[index: string]: any},
    propsM: {[index: string]: any},

    YEAR: string,
    MAKE: string,
    MODEL: string,
    DATA: {[index: string]: any},
    OLD: string,
    editing: {[index: string]: any},
};

export default class QuoteEdit extends React.Component<Props, State> {
    private props_bg_off: {};
    private props_bg_on: {};
    private props_bg_down: {};
    constructor(p: Props) {
        super(p);

        this.props_bg_off = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '-10', 'opacity': '0', 'backdropFilter': 'blur(0px)' };
        this.props_bg_down = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(0px)' };
        this.props_bg_on = { 'background': 'rgba(0, 0, 0, 0.5)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(8px)' };
        
        this.state = {
            show: 0,
            inBackground: false,
            propsBG: this.props_bg_off,
            propsM: { 'top': '-64px', 'opacity': '0' },

            YEAR: '',
            MAKE: '',
            MODEL: '',
            DATA: {},
            OLD: '',
            editing: {
                'edit': false,
                'cat': '',
                'item': '',
                'value': '',
                'value2': '',
                'price': '',
                'error': false,
            },
        }
    }
    /************************************************** QE - EVENTS **************************************************/
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeypress);
    }

    //Keyboard stuffs
    handleKeypress = (ev: KeyboardEvent) => {
        //Esc to close the editing window
        if (ev.key === 'Escape' && this.state.inBackground === false) {
            if (this.state.editing.edit === false) {
                this.close();
            } else {
                this.quitEdit();
            }
        }
    }

    /************************************************** QE - LIB **************************************************/
    sortObj = (object: {[index: string]: any}): {[index: string]: any} => {
        let keys = Object.keys(object);
        keys.sort();
        let newObject: {[index: string]: any} = {};
        for (var i = 0; i < keys.length; i ++) {
            //Only applies to objects recursively to prevent infinite loops
            if (typeof object[keys[i]] === 'object') { 
                newObject[keys[i]] = this.sortObj(object[keys[i]]);
            } else {
                newObject[keys[i]] = object[keys[i]];
            }
        }
        return newObject;
    };
    objKeyExists(obj: object, prop: string): boolean {
        if (obj.hasOwnProperty(prop)) { return true; }
        return false;
    }

    /************************************************** QE - REQUESTS **************************************************/
    getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=data`, postData)
        .then((response) => {
            let sortedData = this.sortObj(response.data);
            this.setState({ DATA: sortedData, OLD: JSON.stringify(sortedData) });
        });
    };

    saveData(): void {
        const { YEAR, MAKE, MODEL, DATA } = this.state;

        if (YEAR === '' || MAKE === '' || MODEL === '') {
            this.props.promptOpen(`Vehicle's "Year", "Make", and "Model" cannot be empty!`, () => {}, () => {}, true);
            return;
        }

        const postData = new FormData();
        postData.append('id', this.props.vehicleID);
        postData.append('year', YEAR);
        postData.append('make', MAKE);
        postData.append('model', MODEL);
        postData.append('data', JSON.stringify(DATA));

        let param = 'update';
        if (this.props.newQuote === true) { param = 'create'; }
        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=${param}`, postData)
        .then(() => {
            this.close();
        });
    }

    deleteKey(cat: string, item: string | null = null): void {
        const { DATA } = this.state;
        if (item !== null)
            { delete DATA[cat][item]; }
        else
            { delete DATA[cat]; }
        
        this.setState({ DATA });
    }

    /************************************************** QE - WINDOW **************************************************/
    open(): void {
        this.setState({
            show: 1,
            propsBG: this.props_bg_on,
            propsM: { 'top': '0px', 'opacity': '1' },
        });
        setTimeout(() => {
            //Have to delay getData since it take a delay to have vehicle props to be sent over
            this.setState({
                YEAR: this.props.vehicleYear,
                MAKE: this.props.vehicleMake,
                MODEL: this.props.vehicleModel,
            })
            if (this.state.show === 1) { this.getData(); }
            setTimeout(() => {
                this.setState({ show: 2 });
            }, 300);
        }, 5);
    }

    close(): void {
        const { show } = this.state;
        if (show === 2) {
            this.setState({
                show: 3,
                propsBG: this.props_bg_down,
                propsM: { 'top': '64px', 'opacity': '0' },
            });
            setTimeout(() => {
                this.setState({
                    show: 0,
                    propsBG: this.props_bg_off,
                    propsM: { 'top': '-64px', 'opacity': '0' },
                });
                this.props.endEditAction();
            }, 250);
        }
    }

    /************************************************** QE - EDITING **************************************************/
    startEdit(value: string, category: string, item: string | null = null, price: string | null = null): void {
        this.setState({
            editing: {
                'edit': true,
                'cat': category,
                'item': (item !== null) ? item : '',
                'value': value,
                'price': (price !== null) ? price : '',
            }
        })
    }

    saveEdit(): void {
        const { editing, DATA } = this.state;

        //EMPTY VALUE
        if (editing.value === '') {
            this.props.promptOpen('Input cannot be empty!', () => {}, () => {}, true);
            return;
        }

        //Update category
        if (editing.item === '' && !DATA.hasOwnProperty(editing.value)) {
            DATA[editing.value] = DATA[editing.cat];
            delete DATA[editing.cat];
        }
        //Update item
        else if (editing.price === '' && editing.item !== '' && !this.objKeyExists(DATA[editing.cat], editing.item)) {
            DATA[editing.cat][editing.value] = DATA[editing.cat][editing.item];
            delete DATA[editing.cat][editing.item];
        }
        //update quote value
        else if (editing.price !== '') {
            DATA[editing['cat']][editing['item']] = editing.value;
        }
        this.setState({ DATA: this.sortObj(DATA) });
        this.quitEdit();
    }

    createKey():void {
        const { editing, DATA } = this.state;

        const creationErrorMessage = (): void => {
            this.props.promptOpen('Inputs cannot be empty!', () => {}, () => {}, true);
        }

        //create quote item
        if (editing.item !== '') {
            if (editing.value === '' || editing.value2 === '') { creationErrorMessage(); return; }
            DATA[editing.cat][editing.value] = editing.value2;
            this.setState({ DATA });
        }
        //create category
        else {
            if (editing.value === '') { creationErrorMessage(); return; }
            DATA[editing.value] = {};
            this.setState({ DATA });
        }

        this.quitEdit();
    }

    quitEdit(): void {
        this.setState({
            editing: {
                'edit': false,
                'cat': '',
                'item': '',
                'value': '',
                'value2': '',
                'price': '',
            }
        })
    }

    reset(): void {
        this.setState({
            DATA: JSON.parse(this.state.OLD),
            YEAR: this.props.vehicleYear,
            MAKE: this.props.vehicleMake,
            MODEL: this.props.vehicleModel,
        });
    }

    delete(cat: string, item: string | null = null): void {
        const { DATA } = this.state;
        if (item !== null) {
            delete DATA[cat][item]; }
        else {
            delete DATA[cat]; }
        this.setState({ DATA });
    }
    

    /************************************************** QE - TEMPLATE **************************************************/
    //Template for all of the quote items on the editing window (it is a mess unfortunately)
    template_formatData(): JSX.Element {
        const { DATA, editing } = this.state;
        let output = [<div key='qe_placeholder_cat'></div>];
        //For each of the category (this is the worst codes I have made)
        for (const category in DATA) {
            //"addon" is the list of quotes for each category
            let addon = [<React.Fragment key={`qe_placeholder_entry${category}`}></React.Fragment>];
            if (DATA[category] !== {}) {
                for (const item in DATA[category]) { //EWWW! Nested "for" loops!
                    const forKey = `${category}${item}`;

                    //Name of the quote
                    let itemName = 
                        <span key={`qe_item_${forKey}`} className='qe-bar-text left'>
                            <span key={`qe_item_et_${forKey}`} className='qe-bar-text-span'>{item}</span>
                            <span key={`qe_item_e_${forKey}`} className='qe-bar-button' onClick={() => { this.startEdit(item, category, item) }}>
                                <FontAwesomeIcon icon={faPen}/>
                            </span>
                        </span>;
                    // |QUOTE NAME --------> (EDITING)
                    if (editing['cat'] === category && editing['item'] === item && editing['price'] === '' && editing['edit'] === true) {
                        itemName = <span key={`qe_item_${forKey}`} className='qe-bar-text left'>
                            <input key={`qe_item_input_${forKey}`} className='edit-item-txt' value={editing['value']}
                                onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                                    editing['value'] = change.target.value;
                                    this.setState({ editing });
                                }}
                            ></input>
                            <span key={`qe_item_ed_${forKey}`} className='qe-bar-button ok' onClick={() => { this.saveEdit() }}>
                                <FontAwesomeIcon icon={faCheck}/>
                            </span>
                            <span key={`qe_item_eq_${forKey}`} className='qe-bar-button' onClick={() => { this.quitEdit() }}>
                                <FontAwesomeIcon icon={faTimes}/>
                            </span>
                        </span>;
                    }

                    //Quote pricing
                    let itemValue = 
                        <span key={`qe_itemV_${forKey}`} className='qe-bar-text'>
                            ${DATA[category][item]}
                            <span
                                key={`qe_itemV_e_${forKey}`}
                                className='qe-bar-button'
                                onClick={() => { this.startEdit(DATA[category][item], category, item, DATA[category][item]) }}
                            ><FontAwesomeIcon icon={faPen}/></span>
                        </span>;
                    // |QUOTE PRICING --------> (EDITING)
                    if (editing['cat'] === category && editing['item'] === item && editing['price'] === DATA[category][item] && editing['edit'] === true) {
                        itemValue = <span key={`qe_itemp_${forKey}`} className='qe-bar-text'>
                            $<input key={`qe_item_inputp_${forKey}`} className='edit-item-txt short' value={editing['value']} type='number' min='0.00'
                                onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                                    editing['value'] = change.target.value;
                                    this.setState({ editing });
                                }}
                            ></input>
                            <span key={`qe_itemp_ed_${forKey}`} className='qe-bar-button ok' onClick={() => { this.saveEdit() }}>
                                <FontAwesomeIcon icon={faCheck}/>
                            </span>
                            <span key={`qe_itemp_eq_${forKey}`} className='qe-bar-button' onClick={() => { this.quitEdit() }}>
                                <FontAwesomeIcon icon={faTimes}/>
                            </span>
                        </span>;
                    }
                    
                    //Delete
                    let itemBar = 
                        <span key={`qe_itemI_${forKey}`} className='qe-bar-text right'>
                            <span
                                key={`qe_itemI_t_${forKey}`}
                                className='qe-bar-button delete'
                                onClick={() => {
                                    this.props.promptOpen(`Confirm to delete "${category} - ${item}"?`, () => {
                                        this.deleteKey(category, item);
                                    }, () => {}, false);
                                }}
                            ><FontAwesomeIcon icon={faTrash}/></span>
                        </span>;
                    
                    addon.push(
                        <div key={`qe_item_${forKey}`} className='qe-item'>
                            {itemName} {itemValue} {itemBar}
                        </div>
                    );
                }

                //ITEM - Add quote bar 
                // ----- EDITING -----
                if (editing.cat === category && editing.item === '_<!!NewItem!!>_' && editing.edit === true) {
                    addon.push(<div key={`qe_addmore_i_${category}`} className='qe-item'>
                        <span key={`qe_item_add_name_${category}`} className='qe-bar-text left'>
                            <input key={`qe_item_add_name_i_${category}`} className='edit-item-txt' value={editing.value}
                                onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                                    editing['value'] = change.target.value;
                                    this.setState({ editing });
                                }}
                            ></input>
                        </span>
                        <span key={`qe_item_add_price_${category}`} className='qe-bar-text'>
                            $<input key={`qe_item_add_price_i_${category}`} className='edit-item-txt short' value={editing.value2} type='number' min='0.01'
                                onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                                    editing['value2'] = change.target.value;
                                    this.setState({ editing });
                                }}
                            ></input>
                        </span>
                        <span key={`qe_item_add_e_${category}`} className='qe-bar-text right'>
                            <span key={`qe_item_add_eq_${category}`} className='qe-bar-button ok' onClick={() => { this.createKey() }}>
                                <FontAwesomeIcon icon={faCheck}/>
                            </span>
                            <span key={`qe_item_add_ed_${category}`} className='qe-bar-button' onClick={() => { this.quitEdit() }}>
                                <FontAwesomeIcon icon={faTimes}/>
                            </span>
                        </span>
                    </div>);
                }
                // ----- BUTTON -----
                else {
                    addon.push(<div
                        key={`qe_addmore_i_${category}`}
                        className='qe-item add'
                        onClick={() => {
                            editing.cat = category;
                            editing.item = '_<!!NewItem!!>_';
                            editing.edit = true;
                            editing.value = '';
                            editing.value2 = '0.00';
                            this.setState({ editing });
                        }}
                    >Add Quote</div>);
                }
                addon.shift();
            }

            //Category delete
            const catDelete =
                <span key={`qe_cat_s_${category}`} className='qe-bar-text right'>
                    <span key={`qe_cat_st_${category}`} className='qe-bar-button delete'
                        onClick={() => { this.props.promptOpen(`Confirm to delete "${category}"?`, () => {
                            this.deleteKey(category);
                        }, () => {}, false);}}
                    ><FontAwesomeIcon icon={faTrash}/></span></span>;

            //Category template (NOT EDITING)
            let catContent = <span key={`qe_cat_${category}`} className='qe-bar-text'>
                <span key={`qe_cat_et_${category}`} className='qe-bar-text-span'>{category}</span>
                <span key={`qe_car_e_${category}`} className='qe-bar-button' onClick={() => { this.startEdit(category, category) }}>
                    <FontAwesomeIcon icon={faPen}/>
                </span>
                {catDelete}
            </span>;

            //Category template (EDITING)
            if (editing['cat'] === category && editing['item'] === '' && editing['edit'] === true) {
                catContent = <span key={`qe_cat_${category}`} className='qe-bar-text'>
                    <input key={`qe_cat_input_${category}`} className='edit-item-txt' value={editing['value']}
                        onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                            editing['value'] = change.target.value;
                            this.setState({ editing });
                        }}
                    ></input>
                    <span key={`qe_car_ed_${category}`} className='qe-bar-button ok' onClick={() => { this.saveEdit() }}>
                        <FontAwesomeIcon icon={faCheck}/>
                    </span>
                    <span key={`qe_car_eq_${category}`} className='qe-bar-button' onClick={() => { this.quitEdit() }}>
                        <FontAwesomeIcon icon={faTimes}/>
                    </span>
                    {catDelete}
                </span>;
            }
            
            output.push(
                <div key={`qe_cat_${category}`} className='qe-cat'>
                    {catContent}
                    {addon}
                </div>
            );
        }

        //CAT - Add category bar 
        //----- editing
        if (editing.cat === '_<!!NewCategory!!>_' && editing.edit === true) {
            output.push(<div key={`qe_addmore`} className='qe-cat'>
                <span key={`qe_addmore_name`} className='qe-bar-text left'>
                    <input key={`qe_addmore_name_i`} className='edit-item-txt' value={editing.value}
                        onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                            editing['value'] = change.target.value;
                            this.setState({ editing });
                        }}
                    ></input>
                </span>
                <span key={`qe_addmore_e`} className='qe-bar-text right'>
                    <span key={`qe_addmore_eq`} className='qe-bar-button ok' onClick={() => { this.createKey() }}>
                        <FontAwesomeIcon icon={faCheck}/>
                    </span>
                    <span key={`qe_addmore_ed`} className='qe-bar-button' onClick={() => { this.quitEdit() }}>
                        <FontAwesomeIcon icon={faTimes}/>
                    </span>
                </span>
            </div>);
        }
        //----- button
        else {
            output.push(<div key='qe_addmore' className='qe-cat add' onClick={() => {
                editing.item = '';
                editing.cat = '_<!!NewCategory!!>_';
                editing.edit = true;
                editing.value = '';
                this.setState({ editing });
            }}>Add Category</div>);
        }



        output.shift();
        return (<React.Fragment key='qe_list'>{output}</React.Fragment>);
    }
    
    //Main template
    template(): JSX.Element {
        const { propsM, YEAR, MAKE, MODEL } = this.state;
        return(<div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_qe_title_sub' className='admin-qe-ttext'>Vehicle Make/Model:</div>
            <div key='admin_qe_title' className='admin-qe-title'>
                <input
                    key={`admin_qe_year`}
                    className='admin-qe-title-txt'
                    value={YEAR}
                    type='number'
                    placeholder='year'
                    size={1}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ YEAR: e.currentTarget.value.replace(/\D/, '') });
                    }}></input>
                <input
                    key={`admin_qe_make`}
                    className='admin-qe-title-txt'
                    value={MAKE}
                    placeholder='make'
                    size={10}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ MAKE: e.currentTarget.value });
                    }}></input>
                <input
                    key={`admin_qe_model`}
                    className='admin-qe-title-txt'
                    value={MODEL}
                    placeholder='model'
                    size={20}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                        this.setState({ MODEL: e.currentTarget.value });
                    }}></input>
            </div>
            <div key='admin_qe_content_sub' className='admin-qe-ttext'>List of quotes:</div>
            <div key='admin_qe_content' className='admin-qe-content'>
                {this.template_formatData()}
            </div>
            <div key='admin_qe_bc'  className='admin-qe-buttonbox'>
                <button
                    key='admin_qe_confirm'
                    onClick={() => { this.saveData(); }}
                    className='admin-qe-btn main'
                >Update</button>
                <button
                    key='admin_qe_cancel'
                    onClick={() => { this.close(); }}
                    className='admin-qe-btn'
                >Cancel</button>
                <button
                    key='admin_qe_reset'
                    onClick={() => {
                        this.props.promptOpen(
                            'Are you sure you want to reset all of the data to how it is?', 
                            () => { this.reset(); this.setState({ inBackground: false }); }, 
                            () => { this.setState({ inBackground: false }); },
                            false
                        );
                        this.setState({ inBackground: true });
                    }}
                    className='admin-qe-btn'
                >Reset</button>
            </div>
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}</div>);
    }
}
