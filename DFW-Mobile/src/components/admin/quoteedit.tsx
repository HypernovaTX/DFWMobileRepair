import React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../../config.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faTrash, faClone } from '@fortawesome/free-solid-svg-icons';

interface intTreeObj { title: string; child: intTreeObj[] | string; };
interface intTreeObjAlt { t: string; c: intTreeObjAlt | string; };
interface intRawJSON {[key: string]: any};
interface intEditing {
    edit: boolean; cat: string; item: string; value: string; value2: string; price: string, error: boolean;
};
type typePromptFunction = (
    message: string, functionYes: () => void, functionNo: () => void, isCancelOnly: boolean
) => void;
type typeInputChange = React.ChangeEvent<HTMLInputElement>;
type typeArrayElement = JSX.Element[];
type typeStrOrNo = string | undefined;
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
    _DATA: intTreeObj,
    editing: intEditing,

    refresh: boolean,
    loading: boolean,
    wait: boolean,
};

export default class QuoteEdit extends React.Component<Props, State> {
    private props_bg_off = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '-10', 'opacity': '0', 'backdropFilter': 'blur(0px)' };
    private props_bg_on = { 'background': 'rgba(0, 0, 0, 0.5)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(8px)' };
    private props_bg_down = { 'background': 'rgba(0, 0, 0, 0)', 'zIndex': '10', 'opacity': '1', 'backdropFilter': 'blur(0px)' };
    private _ismounted = false;

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
            _DATA: { title: 'root', child: '(null)' },
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
    public componentDidMount() {
        window.addEventListener('keydown', this.handleKeypress);
        this._ismounted = true;
    }
    public componentWillUnmount() { this._ismounted = false; }

    //Keyboard stuffs
    public handleKeypress = (ev: KeyboardEvent) => {
        //Esc to close the editing window
        if (ev.key === 'Escape' && this.state.inBackground === false) {
            if (this.state.editing.edit === false) {
                this.close();
            } else {
                this.edit_cancel();
            }
        }
    }

    /************************************************** QE - LIB **************************************************/
    private obj_setTree(title: string, child: intRawJSON | string): intTreeObj {
        let childData: intTreeObj[] = [];
        let childString: typeStrOrNo;

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
    //Convert the tree object to raw JSON for saving purposes.
    private obj_turnIntoUnrefinedJson(data: intTreeObj[] | string) : intRawJSON | string {
        let output: intRawJSON = {};
        if (typeof data !== 'string') {
            for (const item of data) {
                if (item.title !== 'root') {
                    const keyName = item.title;
                    output[keyName] = this.obj_turnIntoUnrefinedJson(item.child);
                }
                else {
                    output = this.obj_turnIntoUnrefinedJson(item.child) as intRawJSON;
                }
            }
            return output; 
        } else {
            return data;
        }
    }

    private obj_sort(input: intTreeObj): intTreeObj {
        let output = input;
        const compareObjTitle = (a: intTreeObj, b: intTreeObj) => {
            if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
            if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
            return 0;
        }

        if (typeof output.child !== 'string') {
            for (let c = 0; c < output.child.length; c++) {
                output.child[c] = this.obj_sort(output.child[c]);
            }
            output.child.sort(compareObjTitle);
        }
        return output;
    }

    /************************************************** QE - REQUESTS **************************************************/
    private getData(): void {
        const postData = new FormData();
        postData.append('id', this.props.vehicleID);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=data`, postData)
        .then((response: AxiosResponse<any>) => {

            this.props.logout(JSON.stringify(response.data));
            if (this._ismounted && typeof response.data !== 'string') {
                const refinedData = this.obj_setTree('root', response.data);
                localStorage.setItem(`temp_edit_`, JSON.stringify(refinedData));
                this.setState({ _DATA: refinedData, wait: false,  });
            }
        });
    };

    private saveData(): void {
        const { YEAR, MAKE, MODEL, _DATA, loading } = this.state;
        const DATA = this.obj_turnIntoUnrefinedJson([_DATA]);

        if (loading) { return; } //don't call it more than once

        if (YEAR === '' || MAKE === '' || MODEL === '') {                                   
            this.quickPrompt(`Vehicle's "Year", "Make", and "Model" cannot be empty!`); return; }

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

    /************************************************** QE - WINDOW **************************************************/
    public open(): void {
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

    public close(): void {
        const { show, refresh } = this.state;
        if (show === 2) {
            this.setState({
                show: 3,
                propsBG: this.props_bg_down,
                propsM: { 'top': '64px', 'opacity': '0' },
            });
            setTimeout(() => {
                if (!localStorage.getItem('temp_edit_') === null) { localStorage.removeItem('temp_edit_'); }
                this.setState({
                    show: 0,
                    propsBG: this.props_bg_off,
                    propsM: { 'top': '-64px', 'opacity': '0' }, 
                    _DATA: { title: 'root', child: '(null)'}, YEAR: '', MAKE: '', MODEL: '',
                });
                this.props.endEditAction(refresh);
            }, 250);
        }
    }

    //To save time and organize this class, since this is used frequently, this function will be added to reduce the work. 
    //(Message with OK button ONLY! No functions will be called.)
    private quickPrompt(message: string): void {
        this.props.promptOpen(message, ()=>{}, ()=>{}, true);
    }

    /************************************************** QE - EDITING **************************************************/
    private edit_start(value: string, category: string, item: typeStrOrNo = undefined, price: typeStrOrNo = undefined): void {
        const { editing } = this.state;
        editing.edit = true;
        editing.cat = category;
        editing.item = item || '';
        editing.price = price || '';
        editing.value = value;
        this.setState({ editing })
    }

    private edit_cancel(): void {
        this.setState({
            editing: { edit: false, cat: '', item: '', value: '', value2: '', price: '', error: false, }
        })
    }

    /**
     * The main method to update the changes to the data
     * @param kind - Choose either 'save', 'create'
     */
    private edit_update(kind: 'save' | 'create' | 'delete'): void {
        let { editing, _DATA} = this.state;
        let processingObj: intTreeObj;

        //EMPTY VALUE
        if (editing.value === '' && kind !== 'delete') { this.quickPrompt('Input cannot be empty!'); return; }

        //This is an object to reference where to update the edit
        const saveObj: intTreeObjAlt = {
            t: editing.cat,
            c: (editing.item === '') ? '' : {
                t: editing.item, 
                c: (editing.price === '') ? '' : {
                    t: editing.price,
                    c: '' 
                }
            }
        }
        //console.log('SAVE OBJ' + JSON.stringify(saveObj)); //for debugging purposes

        //Choose the correct logic for the "kind" of update
        switch (kind) {
            case ('save'): processingObj = this.editLogic_save(saveObj, _DATA
        ); break;
            case ('create'): processingObj = this.editLogic_create(saveObj, _DATA
        ); break;
            case ('delete'): processingObj = this.editLogic_delete(saveObj, _DATA
        ); break;
        }

        //When it returns error
        if (processingObj.title === 'ERROR') {
            switch (processingObj.child) {
                case ('save_cat'): this.quickPrompt('There is already an existing category on the list!'); break;
                case ('save_itm'): this.quickPrompt('There is already an existing quote item on the list!'); break;
                case ('create_cat'): this.quickPrompt('There is already an existing category on the list!'); break;
                case ('create_itm'): this.quickPrompt('There is already an existing quote item on the list!'); break;
                case ('delete'): this.quickPrompt('Cannot find the item to delete.'); break;
                case ('illegal'): this.quickPrompt('ILLEGAL ACTION! How did you know?!'); break;
                case ('unknown'): this.quickPrompt('An unknown error has occured! Please contact the developer over this.'); break;
            }
            
            //Exit the method when error occurs
            return;
        }

        processingObj = this.obj_sort(processingObj);

        //If nothing's wrong, save
        this.setState({ _DATA: processingObj });
        this.edit_cancel();
    }

    /**
     * Call this from the delete button and prepare the data to be deleted.
     * @param cat - Which category node to delete
     * @param item - (optional) which item node to delete
     */
    private prepare_deletion(category: string, item: string | null = null): void {
        let { editing } = this.state;

        const actual_deletion = () => {
            editing.cat = category;
            editing.item = item || '';
            this.setState({ editing });
            this.edit_update('delete');
        }
        const deleteMessage = (item) ? `item: "${category} - ${item}"` : `category: "${category}"`;
        this.props.promptOpen(`Confirm to delete the ${deleteMessage}?`, actual_deletion, ()=>{}, false);
    }

    /**
     * Process the data from editing to the object to __save__ to
     * @param toSave - Reference object (see edit_update method above) 
     * @param input - Actual object in (intTreeObj) to save to
     * @returns - intTreeObj (it there's error, it will be: { title: 'ERROR', child: <error code here>})
     */
    private editLogic_save(toSave: intTreeObjAlt, input: intTreeObj): intTreeObj {
        const { editing } = this.state;
        let ERROR: null | string = null;
        let output = input;

        //First thing first, check for certain string if the user is crazy to pull this off
        if (editing.value === '_<!!NewCategory!!>_' || editing.value === '_<!!NewItem!!>_') { 
            return { title: 'ERROR', child: 'illegal'};
        }

        //start from the category
        if (input.title === 'root' && typeof input.child !== 'string' && !ERROR) {
            //Scan the category in case of collision
            for (const searchItem of input.child) {
                if (searchItem.title.toLowerCase() === editing.value.toLowerCase()
                && typeof toSave.c === 'string'
                && editing.value.toLowerCase() !== editing.cat.toLowerCase()) {
                    ERROR = 'cat'; break;
                }
            }
            //Each of the category
            for (let c = 0; c < input.child.length; c ++) { 
                //Stop running the loop if it's error
                if (ERROR) { break; }
                //Skip if it doesn't match
                if (input.child[c].title === toSave.t && !ERROR) {
                    //In case the output OBJ's child is a string
                    if (typeof output.child === 'string') { output.child = []; } 
                    //Dig further if it's not just the category
                    if (typeof toSave.c !== 'string') {
                        //In case of error, make sure it is passed down
                        if (this.editLogic_save(toSave.c, input.child[c]).title === 'ERROR') { ERROR = 'itm'; break; }
                    }
                    //Update the category
                    else { input.child[c].title = editing.value; }

                    break;
                }
            }
        }

        //items
        else if (input.title !== 'root' && typeof input.child !== 'string' && !ERROR) {
            //Scan the items in case of collision
            for (const searchItem of input.child) {
                if (searchItem.title.toLowerCase() === editing.value.toLowerCase()
                && typeof toSave.c === 'string'
                && editing.value.toLowerCase() !== editing.item.toLowerCase()) {
                    ERROR = 'itm'; break;
                }
            }
            //Each of the category
            for (let i = 0; i < input.child.length; i ++) { 
                //Stop running the loop if it's error
                if (ERROR) { break; }
                //Skip if it doesn't match
                if (input.child[i].title === toSave.t && !ERROR) {
                    //In case the output OBJ's child is a string
                    if (typeof output.child === 'string') { output.child = []; } 
                    //Update the price
                    if (toSave.c === '') { output.child[i].title = editing.value; }
                    //update the item name
                    else { output.child[i].child = editing.value; }

                    break;
                }
            }
        }
        //How did you (end user) get here? Are you a hacker?!
        else {
            output = { title: 'ERROR', child: 'unknown'};
        }

        //Pass the error down
        if (ERROR) {
            output = { title: 'ERROR', child: `save_${ERROR}`};
        }

        return output;
    }

    /**
     * Process the data from editing to the object to __create__
     * @param toCreate - Reference object (see edit_update method above) 
     * @param input - Actual object in (intTreeObj) to create the node
     * @returns - intTreeObj (it there's error, it will be: { title: 'ERROR', child: <error code here>})
     */
    private editLogic_create(toCreate: intTreeObjAlt, input: intTreeObj): intTreeObj {
        const { editing } = this.state;
        let output = input;
        let ERROR: null | string = null;

        //First thing first, check if the end user is insane
        if (editing.value === '_<!!NewCategory!!>_' || editing.value === '_<!!NewItem!!>_') { 
            return { title: 'ERROR', child: 'illegal'};
        }

        //Start from the root
        if (input.title === 'root' && !ERROR) {
            //Convert the child to string just in case
            if (typeof output.child === 'string') { output.child = []; }
            if (typeof input.child === 'string') { input.child = []; }

            //SAVE ITEM - If the child(.c) of toCreate object IS NOT a string
            if (typeof toCreate.c !== 'string') {
                let undefinedChild = true;

                //Find the correct child and dig/save recursively
                for (let c = 0; c < input.child.length; c ++) { 
                    //If the title matches with the reference object (toCreate), create 
                    if (input.child[c].title === toCreate.t) {
                        //Have to create a placeholder varlable since TypeScript always think "output.child[c].child" ...
                        //... is "string | intTreeObj[]" even with "as" and "typeof", this is the only workaround I know of.
                        let tempValue: intTreeObj[] = output.child[c].child as intTreeObj[];

                        //First check for duplicate item names
                        for (const test of tempValue) {
                            if (test.title.toLowerCase() === editing.value.toLowerCase()) { ERROR = 'itm'; break; } 
                        }

                        //Save 
                        tempValue.push({
                            title: editing.value,
                            child: (typeof toCreate.c.c !== 'string') ? editing.value2 : ''
                        });
                        output.child[c].child = tempValue;

                        //Confirm that there's something that matches in the for loop
                        undefinedChild = false;
                        break;
                    }
                }
                //In case the child node doesn't exists
                if (undefinedChild && !ERROR) {
                    output.child.push({
                        title: toCreate.t,
                        child: (typeof toCreate.c.c !== 'string') ? editing.value2 : ''
                    });
                }
            }
            //CREATE CATEGORY - If the child(.c) of toCreate obj IS a string
            else if (typeof output.child !== 'string') {
                //Scan the category in case of collision
                for (const searchItem of output.child) {
                    if (searchItem.title.toLowerCase() === editing.value.toLowerCase()
                    && typeof toCreate.c === 'string') {
                        ERROR = 'cat'; break; }
                }
                //Save if there's no error found
                if (!ERROR) {
                    output.child.push({ title: editing.value, child: []});
                }
            }
        } else if (!ERROR) { //Seriously. I would be impressed if you (the end user) got here.
            output = { title: 'ERROR', child: 'unknown'};
        }

        //Pass the error down
        if (ERROR) {
            output = { title: 'ERROR', child: `create_${ERROR}`};
        }
        
        return output;
    }

    /**
     * Process the data from editing to the object for __deletion__ of a node
     * @param toDelete - Reference object (see edit_update method above) 
     * @param input - Actual object in (intTreeObj) to delete the node
     * @returns - intTreeObj (it there's error, it will be: { title: 'ERROR', child: <error code here>})
     */
    private editLogic_delete(toDelete: intTreeObjAlt, input: intTreeObj): intTreeObj {
        let deleted = false;
        let output = input;

        //start from the root
        if (typeof input.child !== 'string') {
            //Go through each of the child from the root
            let eachCat = input.child.length;
            while (eachCat --) {
                //If it matches with the category title
                if (toDelete.t === input.child[eachCat].title) {
                    //just in case the output child is NOT an array, which is highly unlikely
                    if (typeof output.child === 'string') { output.child = []; }

                    //Delete the category if there's no child in toDelete reference object
                    if (typeof toDelete.c === 'string') {
                        output.child.splice(eachCat, 1);
                        deleted = true;
                        break;
                    }
                    //if toDelete.child is not a string, dig deeper
                    else {
                        //Prepare these since Typescript thinks this is ALWAYS "string | intTreeObj[]" even with typeof
                        let tempChild = output.child[eachCat].child as intTreeObj[];
                        let eachItem = tempChild.length;
                        //Delete the item if matches in the loop
                        while (eachItem --) {
                            const matchTitle = tempChild[eachItem] as intTreeObj;
                            if (toDelete.c.t === matchTitle.title) {
                                tempChild.splice(eachItem, 1);
                                input.child[eachCat].child = tempChild;
                                deleted = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!deleted) { return { title: 'ERROR', child: 'delete' }; }
        return output;
    }

    private reset(): void {
        if (localStorage.getItem('temp_edit_') === null) {
            this.quickPrompt(`ERROR: Cached data is not found to reset to!`);
            return;
        } else {
            const oldData = localStorage.getItem('temp_edit_') as string;
            this.setState({
                _DATA: JSON.parse(oldData),
                YEAR: this.props.vehicleYear,
                MAKE: this.props.vehicleMake,
                MODEL: this.props.vehicleModel,
            });
        }
    }
    
    private applyTemplate(): void {
        const loadTemplate = () => {
            const refinedData = this.obj_setTree('root', CONFIG.template);
            localStorage.setItem(`temp_edit_`, JSON.stringify(refinedData));
            this.setState({ _DATA: refinedData,  });
        }
        this.props.promptOpen("Are you sure you want to apply the template and overwrite all of the exiting data?", loadTemplate, ()=>{}, false);
        
    }

    /************************************************** QE - TEMPLATE **************************************************/
    private template_loadingCover(): JSX.Element { 
        const { loading } = this.state;
        const loadCSS = (loading) ? { opacity: 1, zIndex: 10 } : {};
        const styleSpinner = { animationDuration: '2s' };
        return(
            <div key='quoteedit_loading_cover' className='loading-cover' style={loadCSS}>
                <div key='quoteedit_loading_cover_center' className='loading-cover-center'>
                    <div key='quoteedit_loading_icon' className='ld ld-clock' style={styleSpinner}><img
                        src={require('./../../resources/images/nut.png')} alt='loading' key='quoteedit_loading_img' 
                    ></img></div>
                    <div key='quoteedit_loading_txt' className='loading-cover-text'>Saving data...</div>
                </div>
            </div>
        );
    }
    
    //DATA STRUCTURE as represented in "node , child": root , { category , { item , price } }
    private handle_dataToList(inObj: intTreeObj, resursive: boolean = false, passTitle: typeStrOrNo = undefined): typeArrayElement {
        const { wait } = this.state;
        let output: typeArrayElement = [<div key='qe_placeholder_cat'>XXX</div>];
        let tempOutput: typeArrayElement = [];

        if (wait) { return [this.template_loadBar()]; }

        //avoid using root for creating any elements
        if (inObj.title === 'root') {
            if (typeof inObj.child !== 'string') {
                //dig deeper into the object
                for (const childItem of inObj.child) { output = [...output, ...this.handle_dataToList(childItem)]; }

                //Add category button
                output.push(this.template_addCategory());
                output.shift(); //Comment this out for debugging with the original element (it will show XXX to split between the two)
            }
        } 
        //Begin handle data and turn them into elements
        else {
            const elementKind = (resursive) ? listKinds.item : listKinds.category;
            
            //Used for items
            if (typeof inObj.child !== 'string' && !resursive) {
                //For each of the child of category
                for (const childItem of inObj.child) { tempOutput.push(this.handle_dataToList(childItem as intTreeObj, true, inObj.title)[0]); }

                //Call to render category
                tempOutput.push(this.template_addItem(inObj.title));
                const catElement = this.template_chooseKind(inObj.title, elementKind, tempOutput); //call a myself to render 
                output.push(catElement);
                output.shift();
            }
            else {
                //Call to render each item
                const addonVar = (passTitle) ? `${passTitle}[sep]` : '';
                output.push(this.template_chooseKind(`${addonVar + inObj.title}[sep]${inObj.child}`, elementKind, output));
                output.shift();
            }
            
        }
        return output;
    }

    private template_chooseKind(data: string, kind: number, addon: JSX.Element | JSX.Element[]): JSX.Element { 
        let output: JSX.Element = <React.Fragment key='listItemNA'></React.Fragment>;
        let arrayData: string[] = [];

        if (kind === listKinds.item) {
            arrayData = data.split(/\[sep\]/);
        }
        switch (kind) {
            case (listKinds.category): 
                output = this.template_listCategory(data, addon);
                break;
            case (listKinds.item):
                output = this.template_listItem(arrayData[0], arrayData[1], arrayData[2]); 
                break;
        }
        return output;
    }

    private template_listCategory(category: string, addOn: JSX.Element | JSX.Element[]): JSX.Element { 
        const { editing } = this.state;

        //Delete button
        const catDelete =
            <span key={`qec_s_${category}`} className='qe-bar-text right'>
                <span key={`qec_b_${category}`} className='qe-bar-button delete'
                    onClick={() => { this.prepare_deletion(category); }}
                ><FontAwesomeIcon icon={faTrash}/></span>
            </span>;

        //Main category content
        let catContent = 
            <span key={`qec_${category}`} className='qe-bar-text'>
                <span key={`qec_t_${category}`} className='qe-bar-text-span'>{category}</span>
                <span key={`qec_e_${category}`} className='qe-bar-button' onClick={() => { this.edit_start(category, category) }}>
                    <FontAwesomeIcon icon={faPen}/></span>
                {catDelete}
            </span>;

        //Category template (EDITING)
        if (editing.cat === category && editing.item === '' && editing.edit) {
            catContent = <span key={`qec_${category}`} className='qe-bar-text'>
                <input key={`qec_i_${category}`} className='edit-item-txt' value={editing['value']}
                    onChange={(change: typeInputChange) => { editing.value = change.target.value; this.setState({ editing }); }}
                ></input>
                <span key={`qec_ed_${category}`} className='qe-bar-button ok' onClick={() => { this.edit_update('save') }}>
                    <FontAwesomeIcon icon={faCheck}/>
                </span>
                <span key={`qec_eq_${category}`} className='qe-bar-button' onClick={() => { this.edit_cancel() }}>
                    <FontAwesomeIcon icon={faTimes}/>
                </span>
                {catDelete}
            </span>;
        }

        return (
            <div key={`qe_cat_${category}`} className='qe-cat'>
                {catContent}
                {addOn}
            </div>
        )
    }

    private template_listItem(category: string, item: string, price: string): JSX.Element {
        const { editing } = this.state;
        const forKey = category + item;
        
        //Normal quote item (no editing)
        let itemName = 
            <span key={`qei_${forKey}`} className='qe-bar-text left'>
                <span key={`qei_et_${forKey}`} className='qe-bar-text-span'>{item}</span>
                <span key={`qei_e_${forKey}`} className='qe-bar-button' onClick={() => { this.edit_start(item, category, item) }}>
                    <FontAwesomeIcon icon={faPen}/>
                </span>
            </span>;

        //Quote item price (no editing)
        let itemValue = 
            <span key={`qei_V_${forKey}`} className='qe-bar-text'>${price}
                <span key={`qe_itemV_e_${forKey}`} className='qe-bar-button'
                    onClick={() => { this.edit_start(price, category, item, price) }}
                ><FontAwesomeIcon icon={faPen}/></span>
            </span>;

        //While it is editing
        if (editing.cat === category && 
            editing.item === item && 
            editing.edit) {
            //quote item name
            if (editing.price === '') {
                itemName =
                    <span key={`qei_${forKey}`} className='qe-bar-text left'>
                        <input key={`qeit_input_${forKey}`} className='edit-item-txt' value={editing.value}
                            onChange={(change: typeInputChange) => { editing.value = change.target.value; this.setState({ editing }); }}
                        ></input>
                        <span key={`qei_ed_${forKey}`} className='qe-bar-button ok' onClick={() => { this.edit_update('save') }}>
                            <FontAwesomeIcon icon={faCheck}/>
                        </span>
                        <span key={`qei_eq_${forKey}`} className='qe-bar-button' onClick={() => { this.edit_cancel() }}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </span>
                    </span>;
            }
            
            //quote item price
            if (editing.price === price) {
                itemValue = 
                    <span key={`qeit_p_${forKey}`} className='qe-bar-text'>
                        $<input key={`qei_p_i_${forKey}`} className='edit-item-txt short' value={editing.value} 
                            onChange={(change: typeInputChange) => { editing.value = change.target.value; this.setState({ editing }); }} 
                        ></input>
                        <span key={`qei_p_sv_${forKey}`} className='qe-bar-button ok' onClick={() => { this.edit_update('save') }}>
                            <FontAwesomeIcon icon={faCheck}/>
                        </span>
                        <span key={`qei_p_qt_${forKey}`} className='qe-bar-button' onClick={() => { this.edit_cancel() }}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </span>
                    </span>;
            }
        }
    
        //Delete button
        let itemBar = 
            <span key={`qei_I_${forKey}`} className='qe-bar-text right'>
                <span key={`qei_I_btxt_${forKey}`} className='qe-bar-delete-txt'>Delete "{item}"</span>
                <span key={`qei_I_t_${forKey}`} className='qe-bar-button delete'
                    onClick={() => { this.prepare_deletion(category, item); }}
                ><FontAwesomeIcon icon={faTrash}/></span>
            </span>;

        //Combie and return
        return (
            <div key={`qei_MAIN_${forKey}`} className='qe-item'>{itemName} {itemValue} {itemBar}</div>
        );
    }

    private template_addCategory(): JSX.Element {
        let { editing } = this.state;
        let output: JSX.Element;
        //Editing mode
        if (editing.cat === '_<!!NewCategory!!>_' && editing.edit === true) {
            output = 
                <div key={`qe_addC`} className='qe-cat'>
                    <span key={`qe_addC_name`} className='qe-bar-text left'>
                        <input key={`qe_addC_name_i`} className='edit-item-txt' value={editing.value}
                            onChange={(change: typeInputChange) => { editing.value = change.target.value; this.setState({ editing }); }}
                        ></input>
                    </span>
                    <span key={`qe_add_e`} className='qe-bar-text right'>
                        <span key={`qe_add_eq`} className='qe-bar-button ok' onClick={() => { this.edit_update('create') }}>
                            <FontAwesomeIcon icon={faCheck}/>
                        </span>
                        <span key={`qe_add_ed`} className='qe-bar-button' onClick={() => { this.edit_cancel() }}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </span>
                    </span>
                </div>;
        }
        //As a button
        else {
            output =
                <div key='qe_addC' className='qe-cat add' onClick={() => {
                    editing.item = '';
                    editing.cat = '_<!!NewCategory!!>_';
                    editing.edit = true;
                    editing.value = '';
                    this.setState({ editing });
                }}>Add Category</div>;
        }
        return output;
    }

    private template_addItem(category: string): JSX.Element {
        let { editing } = this.state;
        let output: JSX.Element;
        
        //When it is in editing mode
        if (editing.cat === category && editing.item === '_<!!NewItem!!>_' && editing.edit) {
            output = 
                <div key={`qe_addI_${category}`} className='qe-item'>
                    <span key={`qe_addI_n_${category}`} className='qe-bar-text left'>
                        <input key={`qe_addI_n_i_${category}`} className='edit-item-txt' value={editing.value}
                            onChange={(change: typeInputChange) => { editing['value'] = change.target.value; this.setState({ editing }); }}
                        ></input>
                    </span>
                    <span key={`qe_addI_p_${category}`} className='qe-bar-text'>
                        $<input key={`qe_addI_p_i_${category}`} className='edit-item-txt short' value={editing.value2} type='number' min='0.00'
                            onChange={(change: typeInputChange) => { editing['value2'] = change.target.value; this.setState({ editing }); }}
                        ></input>
                    </span>
                    <span key={`qe_addI_e_${category}`} className='qe-bar-text right'>
                        <span key={`qe_addI_eq_${category}`} className='qe-bar-button ok' onClick={() => { this.edit_update('create') }}>
                            <FontAwesomeIcon icon={faCheck}/>
                        </span>
                        <span key={`qe_addI_ed_${category}`} className='qe-bar-button' onClick={() => { this.edit_cancel() }}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </span>
                    </span>
                </div>;
        }
        //As a button
        else {
            output = 
                <div key={`qe_addI_${category}`} className='qe-item add'
                    onClick={() => {
                        editing.cat = category;
                        editing.item = '_<!!NewItem!!>_';
                        editing.edit = true;
                        editing.price = '_<!!NewPrice!!>_'
                        editing.value = '';
                        editing.value2 = '0.00';
                        this.setState({ editing });
                    }}
                >Add Quote</div>;
        }
        return output;
    }

    private template_loadBar(): JSX.Element {
        const styleSpinner = { animationDuration: '2.0s' };
        return(<div key={`quoteedit_loading_content`} className={`qe-cat add`}>
            <div key={`quoteedit_load_spinner`} className='ld ld-spin' style={styleSpinner}>
                <img src={require('./../../resources/images/nut.png')} alt='loading' key={`quoteedit_load_img`}></img></div></div>);
    }

    private template_buttons(): JSX.Element {
        const { wait } = this.state;
        const { newQuote } = this.props;
        let reset = <React.Fragment key='admin_qe_reset_empty'></React.Fragment>;
        let saveButtonName = 'Create';
        if (newQuote === false) {
            reset = (
                <button
                    key='admin_qe_reset' disabled={wait} className='admin-qe-btn'
                    onClick={() => {
                        this.props.promptOpen('Are you sure you want to reset all of the data to how it is?', 
                            () => { this.reset(); this.setState({ inBackground: false }); }, 
                            () => { this.setState({ inBackground: false }); }, 
                            false);
                        this.setState({ inBackground: true });
                    }}
                >Reset</button>
            );
            saveButtonName = 'Update';
        }

        return (
            <div key='admin_qe_bc'  className='admin-qe-buttonbox'>
                <button
                    key='admin_qe_confirm' onClick={() => { this.saveData(); }} disabled={wait} className='admin-qe-btn main'
                >{saveButtonName}</button>
                <button
                    key='admin_qe_cancel' onClick={() => { this.close(); }} disabled={wait} className='admin-qe-btn'
                >Cancel</button>
                {reset}
                <button
                    key='admin_qe_template' onClick={() => { this.applyTemplate(); }} disabled={wait} className='admin-qe-btn small'
                ><FontAwesomeIcon icon={faClone}/></button>
            </div>
        );
    }
    
    //Main template
    private template(): JSX.Element {
        const { propsM, YEAR, MAKE, MODEL, wait } = this.state;
        
        return(
            <div key='admin_qe_dbox' className='admin-qe-box' style={propsM}>
                <div key='admin_qe_vehicle_info' className='admin-qe-block'>
                    <div key='admin_qe_title_sub' className='admin-qe-ttext'>Vehicle Make/Model:</div>
                    <div key='admin_qe_title' className='admin-qe-title'>
                        <input
                            key={`admin_qe_year`} className='admin-qe-title-txt' value={YEAR} type='number' placeholder='year' size={1} disabled={wait}
                            onChange={(e: typeInputChange) => { this.setState({ YEAR: e.currentTarget.value.replace(/\D/, '') }); }}
                        ></input>
                        <input
                            key={`admin_qe_make`} className='admin-qe-title-txt' value={MAKE} placeholder='make' size={10} disabled={wait}
                            onChange={(e: typeInputChange) => { this.setState({ MAKE: e.currentTarget.value }); }}
                        ></input>
                        <input
                            key={`admin_qe_model`} className='admin-qe-title-txt' value={MODEL} placeholder='model' size={20} disabled={wait}
                            onChange={(e: typeInputChange) => { this.setState({ MODEL: e.currentTarget.value }); }}
                        ></input>
                    </div>
                    <div key='admin_qe_content_sub' className='admin-qe-ttext'>List of quotes:</div>
                    <div key='admin_qe_content' className='admin-qe-content'>{this.handle_dataToList(this.state._DATA, false)}</div>
                    {this.template_buttons()}
                </div>
            </div>
        );
    }

    public render() {
        const { propsBG } = this.state;
        return(<div key='admin_pm_body' className='admin-pm-body' style={propsBG}>{this.template()}{this.template_loadingCover()}</div>);
    }
}
