import React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

interface intTreeObj {
    title: string;
    child: intTreeObj[] | string;
    show?: boolean;
};
interface intRawJSON {[key: string]: any};
type typePromptFunction = (
    message: string, 
    functionYes: () => void, 
    functionNo: () => void, 
    isCancelOnly: boolean
) => void;
enum listKinds {
    category, item, price
}

type Props = {
    vehicleID: string,
    vehicleYear: string,
    vehicleMake: string,
    vehicleModel: string,
    newQuote: boolean,
    endEditAction: ( param: boolean ) => void, 
    promptOpen: typePromptFunction,
    logout: ( param: string ) => void,
};
type State = {
    show: number,
    inBackground: boolean,
    propsBG: object,
    propsM: object,

    YEAR: string,
    MAKE: string,
    MODEL: string,
    DATA: intRawJSON,
    TESTDATA: intTreeObj;
    OLD: string,
    editing: intRawJSON,

    refresh: boolean,
    loading: boolean,
    wait: boolean,
};

export default class QuoteEdit extends React.Component<Props, State> {
    private props_bg_off = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '-10', 'opacity': '0', 'backdropFilter': 'blur(0px)' };
    private props_bg_on = { 'background': 'rgba(0, 0, 0, 0.5)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(8px)' };
    private props_bg_down = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(0px)' };
    private _ismounted = false;
    private doNot = () => {};

    constructor(p: Props) {
        super(p);
        
        this.state = {
            show: 0,
            inBackground: false,
            propsBG: this.props_bg_off,
            propsM: { 'top': '-64px', 'opacity': '0' },

            YEAR: '',
            MAKE: '',
            MODEL: '',
            DATA: {},
            TESTDATA: { title: 'root', child: '(null)' },
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

            refresh: false,
            loading: false,
            wait: false,
        }
    }
    /************************************************** QE - EVENTS **************************************************/
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeypress);
        this._ismounted = true;
    }
    componentWillUnmount() { this._ismounted = false; }

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
    sortObj = (object: intRawJSON): intRawJSON => {
        let keys = Object.keys(object);
        keys.sort();
        let newObject: intRawJSON = {};
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

    obj_setTree(title: string, child: intRawJSON | string): intTreeObj {
        let childData: intTreeObj[] = [];
        let childString: string | undefined;

        if (typeof child !== 'string') {
            for (const key in child) {
                childData.push(this.obj_setTree(key, child[key]));
            }
        } else {
            childString = child;
        }
        let output = {
            title: title,
            child: childString || childData,
        };
        return output;
    }

    obj_turnIntoUnrefinedJson(data: intTreeObj[] | string) : intRawJSON | string {
        let output: intRawJSON = {};
        if (typeof data !== 'string') {
            for (const item of data) {
                const keyName = item.title;
                output[keyName] = this.obj_turnIntoUnrefinedJson(item.child);
            }
            return output; 
        } else {
            return data;
        }
    }

    /************************************************** QE - REQUESTS **************************************************/
    getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=data`, postData)
        .then((response: AxiosResponse<any>) => {

            
            this.props.logout(JSON.stringify(response.data));
            if (this._ismounted && typeof response.data !== 'string') {
                let sortedData = this.sortObj(response.data);

                const refinedData = this.obj_setTree('root', response.data);
                console.log(JSON.stringify(this.obj_turnIntoUnrefinedJson([refinedData])));

                this.setState({ DATA: sortedData, OLD: JSON.stringify(sortedData), wait: false, TESTDATA: refinedData });
            }
        });
    };

    saveData(): void {
        const { YEAR, MAKE, MODEL, DATA, loading } = this.state;

        if (loading) { return; } //don't call it more than once

        if (YEAR === '' || MAKE === '' || MODEL === '') {                                   
            this.props.promptOpen(`Vehicle's "Year", "Make", and "Model" cannot be empty!`, ()=>{}, ()=>{}, true);
            return;
        }

        let param = 'update';
        const postData = new FormData();
        postData.append('year', YEAR);
        postData.append('make', MAKE);
        postData.append('model', MODEL);
        this.setState({ refresh: true, loading: true, wait: true, });

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=exists`, postData)
        .then((response) => {
            if (this.props.newQuote && response.data === 'nogo') {
                this.props.promptOpen(`"${YEAR} ${MAKE} ${MODEL}" already exists in the database!`, () => {
                    this.setState({ refresh: false, loading: false, wait: false, });
                }, ()=>{}, true);
                return;
            }

            postData.append('data', JSON.stringify(DATA));
            if (this.props.newQuote) { param = 'create'; }
            else { postData.append('id', this.props.vehicleID); }
            axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=${param}`, postData)
            .then((response) => {
                this.props.logout(response.data);

                if (this._ismounted) {
                    setTimeout(() => {
                        this.close();
                        setTimeout(() => { this.setState({ loading: false, wait: false, }); }, 200);
                    },1000);
                }
            });
        });

        
        
    }

    deleteKey(cat: string, item: string | null = null): void {
        const { DATA } = this.state;
        if (item !== null) {
                delete DATA[cat][item]
            }
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
            refresh: false,
            wait: true,
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
                if (this.props.newQuote) { this.setState({ wait: false }); }
            }, 300);
        }, 5);
    }

    close(): void {
        const { show, refresh } = this.state;
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
                    DATA: {}, YEAR: '', MAKE: '', MODEL: '',
                });
                this.props.endEditAction(refresh);
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
            this.props.promptOpen('Input cannot be empty!', ()=>{}, ()=>{}, true);
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

    createKey(): void {
        const { editing, DATA } = this.state;

        const creationErrorMessage = (): void => {
            this.props.promptOpen('Inputs cannot be empty!', ()=>{}, ()=>{}, true);
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
    template_formatData(): JSX.Element { //OLD
        const { DATA, editing, wait } = this.state;
        let output = [<div key='qe_placeholder_cat'></div>];

        if (wait) { return (this.template_loadBar()) }

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
                            <span key={`qe_itemI_ttxt_${forKey}`} className='qe-bar-delete-txt'>Delete "{item}"</span>
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

    template_loadingCover(): JSX.Element { //OLD
        const { loading } = this.state;
        let loadCSS: {[index: string]: any} = {};
        const styleSpinner = { animationDuration: '2s' };
        if (loading) { loadCSS = { opacity: 1, zIndex: 10 }; }
        return(
            <div key='quoteedit_loading_cover' className='loading-cover' style={loadCSS}>
                <div key='quoteedit_loading_cover_center' className='loading-cover-center'>
                    <div key='quoteedit_loading_icon' className='ld ld-clock' style={styleSpinner}><img
                            src={require('./../../resources/images/nut.png')}
                            alt='loading'
                            key='quoteedit_loading_img' 
                    ></img></div>
                    <div key='quoteedit_loading_txt' className='loading-cover-text'>Saving data...</div>
                </div>
            </div>
        );
    }

    handle_dataToList(inObj: intTreeObj, resursive: boolean): JSX.Element[] { //NEW
        let output = [<div key='qe_placeholder_cat'></div>];

        //avoid using root for creating any elements
        if (inObj.title === 'root') {
            if (typeof inObj.child !== 'string') {
                //dig deeper into the object
                for (const childItem of inObj.child) { output = this.handle_dataToList(childItem, false); }
            }
        } 
        //Begin handle data and turn them into elements
        else {
            const elementKind = (resursive) ? listKinds.item : listKinds.category;
            output.push(this.template_chooseKind(inObj.title, elementKind));
            //recursively get each of the child's details
            if (typeof inObj.child !== 'string' && resursive) {
                for (const childItem of inObj.child) { output = this.handle_dataToList(childItem, true); }
            }
        }
        return output;
    }

    template_chooseKind(data: string, kind: number): JSX.Element { //NEW
        const { category, item, price } = listKinds;
        let output: JSX.Element = <React.Fragment key='listItemNA'></React.Fragment>;
        switch (kind) {
            case (category): output = this.template_listCategory(data); break;
        }
        return output;
    }

    template_listCategory(category: string): JSX.Element { //NEW
        const { editing } = this.state;
        //Delete button
        const catDelete =
            <span key={`qec_s_${category}`} className='qe-bar-text right'>
                <span key={`qec_b_${category}`} className='qe-bar-button delete'
                    onClick={() => { this.props.promptOpen(`Confirm to delete "${category}"?`, () => { this.deleteKey(category); }, () => {}, false);}}
                ><FontAwesomeIcon icon={faTrash}/></span>
            </span>;

        //Main category content
        let catContent = 
            <span key={`qe_c_${category}`} className='qe-bar-text'>
                <span key={`qec_t_${category}`} className='qe-bar-text-span'>{category}</span>
                <span key={`qec_e_${category}`} className='qe-bar-button' onClick={() => { this.startEdit(category, category) }}>
                    <FontAwesomeIcon icon={faPen}/></span>
                {catDelete}
            </span>;

        //Category template (EDITING)
        if (editing.cat === category && editing.item === '' && editing.edit) {
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

        return (
            <span key={`qe_cat_${category}`} className='qe-bar-text'>
                <span key={`qe_cat_et_${category}`} className='qe-bar-text-span'>{category}</span>
                <span key={`qe_car_e_${category}`} className='qe-bar-button' onClick={() => { this.startEdit(category, category) }}>
                    <FontAwesomeIcon icon={faPen}/>
                </span>
                {catDelete}
            </span>
        )
    }

    template_loadBar(): JSX.Element {
        const styleSpinner = { animationDuration: '2.0s' };
        return(<div key={`quoteedit_loading_content`} className={`qe-cat add`}>
            <div key={`quoteedit_load_spinner`} className='ld ld-spin' style={styleSpinner}>
                <img src={require('./../../resources/images/nut.png')} alt='loading' key={`quoteedit_load_img`}></img></div></div>);
    }
    
    //Main template
    template(): JSX.Element {
        const { propsM, YEAR, MAKE, MODEL, wait } = this.state;
        const { newQuote } = this.props;
        let reset = <React.Fragment key='admin_qe_reset_empty'></React.Fragment>;
        let saveButtonName = 'Create';
        if (newQuote === false) {
            reset = <button key='admin_qe_reset'
                onClick={() => {
                    this.props.promptOpen('Are you sure you want to reset all of the data to how it is?', 
                        () => { this.reset(); this.setState({ inBackground: false }); }, 
                        () => { this.setState({ inBackground: false }); }, 
                        false);
                    this.setState({ inBackground: true });
                }}
                disabled={wait}
                className='admin-qe-btn'
            >Reset</button>;
            saveButtonName = 'Update';
        }
        return(<div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
            <div key='admin_qe_vehicle_info' className='admin-qe-block'>
                <div key='admin_qe_title_sub' className='admin-qe-ttext'>Vehicle Make/Model:</div>
                <div key='admin_qe_title' className='admin-qe-title'>
                    <input
                        key={`admin_qe_year`}
                        className='admin-qe-title-txt'
                        value={YEAR}
                        type='number'
                        placeholder='year'
                        size={1}
                        disabled={wait}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            this.setState({ YEAR: e.currentTarget.value.replace(/\D/, '') });
                        }}></input>
                    <input
                        key={`admin_qe_make`}
                        className='admin-qe-title-txt'
                        value={MAKE}
                        placeholder='make'
                        size={10}
                        disabled={wait}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            this.setState({ MAKE: e.currentTarget.value });
                        }}></input>
                    <input
                        key={`admin_qe_model`}
                        className='admin-qe-title-txt'
                        value={MODEL}
                        placeholder='model'
                        size={20}
                        disabled={wait}
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
                        disabled={wait}
                        className='admin-qe-btn main'
                    >{saveButtonName}</button>
                    <button
                        key='admin_qe_cancel'
                        onClick={() => { this.close(); }}
                        disabled={wait}
                        className='admin-qe-btn'
                    >Cancel</button>
                    {reset}
                </div>
            </div>
        </div>
        );
    }

    render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}{this.template_loadingCover()}</div>);
    }
}
