import React from 'react';
import '../resources/quote.css';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../config.json';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faPlus, faUsers, faTags } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

interface intTreeObj {
    title: string;
    child: intTreeObj[] | string;
};
interface intSelector {
    year: string;
    make: string;
    model: string;
    id: string;
}
interface intRawJSON {[key: string]: any};

type RefDiv = React.RefObject<HTMLDivElement>;
type DragEv = React.DragEvent<HTMLElement>;
type StringOrNo = string | undefined;
type DropdownSelect = React.ChangeEvent<HTMLSelectElement>;
type APIResponse = AxiosResponse<any>;

type Props = {
};
type State = {
    SELECTION: intSelector, 
    DATA: intTreeObj, 

    list_make: string[],
    list_model: string[][],

    load_general: boolean,
    load_list: boolean, 
};

export default class Quotes extends React.Component<Props, State> {
    private _ismounted: boolean = false;
    private ref_top: RefDiv = React.createRef();

    constructor(p: Props) {
        super(p);

        this.state = {
            SELECTION: { year: 'NA', make: 'NO_MAKE_NAME', model: '', id: '____', }, 
            DATA: { title: 'root', child: '(null)' }, 

            list_make: [],
            list_model: [],

            load_general: false, 
            load_list: false,
        }
    }
    //-------------------------------------------------------------------- COMPONENT --------------------------------------------------------------------
    public componentDidMount(): void {
        this.setState({ load_general: true });
        this._ismounted = true;
        this.getFullVehicleList();
    }

    //-------------------------------------------------------------------- API --------------------------------------------------------------------
    private getFullVehicleList(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=fulllist`)
        .then((response: APIResponse) => {
            if (this._ismounted && typeof response.data !== 'string') {
                const refinedData = this.obj_sort(this.obj_setTree('root', response.data));
                localStorage.setItem(`quote_list`, JSON.stringify(refinedData));
            }
        });
    }

    private getVehicleQuotes(): void {
        const { SELECTION } = this.state;
        const postData = new FormData();
        postData.append('id', SELECTION.id);

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=data`, postData)
        .then((response: APIResponse) => {
            if (this._ismounted && typeof response.data !== 'string') {
                const refinedData = this.obj_sort(this.obj_setTree('root', response.data));
                localStorage.setItem(`quote_vehicle`, JSON.stringify(refinedData));
            }
        });
    }
    //-------------------------------------------------------------------- LOGICS --------------------------------------------------------------------
    //convert raw JSON data into something more refined 
    private obj_setTree(title: string, child: intRawJSON | string): intTreeObj {
        let childData: intTreeObj[] = [];
        let childString: StringOrNo;

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

    //Used for sorting complext obj
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

    //This functions updates the list for make and model, also calls for API request if the selection is complete
    update_makemodel(input: intTreeObj): void {
        const { SELECTION } = this.state;

        let { list_make, list_model } = this.state;
        //starts from te root and starts off finding Make when the year is selected
        if (SELECTION.year && typeof input.child !== 'string') {
            //NEW CODES
            //Pull the child array of "intTreeObj" from the "root" child (input.child)
            const MakesFromYear = (
                input.child.find((findYear: intTreeObj) => findYear.title === SELECTION.year) ||
                { title: SELECTION.year, child: [] } //default if undefined
            ).child as intTreeObj[];

            //Map out the title of each object in the array to 'list_make'
            list_make = MakesFromYear.reverse().map((make: intTreeObj) => { return make.title });
            
            //Now dig deeper for models from MAKE node
            if (SELECTION.make) {
                //Pull the child array of "intTreeObj" from the "year" child (MakesFromYear)
                const ModelsFromMake = (
                    MakesFromYear.find((findMake: intTreeObj) => findMake.title === SELECTION.make) ||
                    { title: SELECTION.make, child: [] } //default if undefined
                ).child as intTreeObj[];

                 //Map out the title of each object in the array to 'list_make'
                list_model = ModelsFromMake.reverse().map((model: intTreeObj) => {
                    return [model.title, model.child as string]
                });
            }
        }

        //calls for API request if the selection is complete
        if (SELECTION.model && SELECTION.id !== '____' && !Cookies.get('current_vehicle')) {
            Cookies.set('current_vehicle', SELECTION.id);
            this.setState({ load_list: true });
            this.getVehicleQuotes();
        }
        this.setState({ list_make, list_model });
    }

    //-------------------------------------------------------------------- TEMPLATE --------------------------------------------------------------------
    //The very top banner
    private template_lander(): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = { backgroundPositionY: `calc(${(window.pageYOffset / 2 )} - 50vh)` };
        const preventDrag = (e: DragEv) => { e.preventDefault(); };

        return (
            <div key='qt_l' className='lander quote' style={style} ref={this.ref_top}>
                <div key='qt_lc' className='lander-contain quote' draggable='false' onDragStart={preventDrag}>
                    <div key='qt_lcl' className='logo'>
                        <img key={`qt_lcl_im`} src={LOGO_IMG} alt='DFW Mobile Repair Logo' draggable="false" onDragStart={preventDrag}></img>
                    </div>
                </div>
                <div key='qt_lccs' className='lander-cover-shade'></div>
                <div key='qt_lcc' className='lander-cover'>
                    <div key='qt_lcct' className='lander-cover-txt'>Return to home</div>
                </div>
            </div>
        );
    }

    //The section for the vehicle selectors
    private template_selector(): JSX.Element {
        let selectors = (
            <div key='selectionArea' className='selection-area'>
                {this.template_selection_year()}
                {this.template_selection_make()}
                {this.template_selection_model()}
            </div>
        );
        
        //If there's no data to pull
        if (localStorage.getItem('quote_list') === undefined) {
            selectors = (<div key='no-data'>NO DATA</div>);
        }

        const wrapper = (
            <div key='qt_s' className='ct-section section5' style={{}} ref={this.ref_top}>
                <div key='qt_ss' className='section2-box'>
                    <h3>Select your vehicle:</h3>
                    {selectors}
                </div>
            </div>
        );
        return (wrapper);
    }
    private template_selection_year(): JSX.Element {
        const { SELECTION } = this.state;
        const JSONData: intTreeObj = JSON.parse(
            localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`
        );
        let output: JSX.Element[] = [<React.Fragment key='q_year'></React.Fragment>];
        //Go over each of the child for year
        if (typeof JSONData.child !== 'string') {
            output = JSONData.child.reverse().map((childObj: intTreeObj) => {
                return (
                    <option key={`qso_y_${childObj.title}`} value={childObj.title}>{childObj.title}</option>
                );
            })
        }
        return (
            <select
                key='q_year'
                className='form-selectcar '
                onChange={(ev: DropdownSelect) => {
                    //When changing the SELECT YEAR input
                    let { SELECTION } = this.state;
                    //Do not change value and reset if the value is the same as before
                    if (SELECTION.year !== ev.target.value) {
                        SELECTION.year = ev.target.value;
                        SELECTION.make = 'NO_MAKE_NAME';
                        SELECTION.model = '';
                        SELECTION.id = '____';
                        if (Cookies.get('current_vehicle')) { Cookies.remove('current_vehicle'); }
                        this.update_makemodel(JSONData);
                        this.setState({ SELECTION, list_model: [] });
                    }
                    
                }}
            >
                <option key='qso_y_XXX' disabled={(SELECTION.year !== 'NA')} value='NA'> -- SELECT YEAR -- </option>
                {output}
            </select>
        );
    }
    private template_selection_make(): JSX.Element {
        const { list_make, SELECTION } = this.state;
        const JSONData: intTreeObj = JSON.parse(localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`);
        let output: JSX.Element[] = [];

        //Go over each of the child for make
        output = list_make.reverse().map((makeName: string) => {
            return <option key={`qso_mk_${makeName}`} value={makeName}>{makeName}</option>
        });

        
        const onChangeEvent = (ev: DropdownSelect) => {
            //When changing the SELECT MAKE input
            let { SELECTION } = this.state;
            //Do not change value and reset if the value is the same as before
            if (SELECTION.make !== ev.target.value) {
                SELECTION.make = ev.target.value;
                SELECTION.model = '';
                SELECTION.id = '____';
                this.setState({ SELECTION, list_model: [] });
                if (Cookies.get('current_vehicle')) { Cookies.remove('current_vehicle'); }
                this.update_makemodel(JSONData);
            }
        }

        //determine the stype of <select>
        let selectWrap = 
            <select key='q_make' className='form-selectcar disabled' disabled={true} onChange={onChangeEvent} value={SELECTION.make}>
                <option key='qso_mk_XXX' disabled value='NO_MAKE_NAME'> -- SELECT MAKE -- </option>
                {output}
            </select>;
        if (list_make.length > 0) {
            selectWrap = 
                <select key='q_make' className='form-selectcar' disabled={false} onChange={onChangeEvent} value={SELECTION.make}>
                    <option key='qso_mk_XXX' disabled value='NO_MAKE_NAME'> -- SELECT MAKE -- </option>
                    {output}
                </select>;
        }

        return (selectWrap);
    }
    private template_selection_model(): JSX.Element {
        const { list_model, SELECTION } = this.state;
        const JSONData: intTreeObj = JSON.parse(localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`);
        let output: JSX.Element[] = [];

        //Go over each of the child for model
        output = list_model.reverse().map((modelName: string[]) => {
            return (
                <option key={`qso_md_${modelName[1]}`} value={modelName.join('____')}>{modelName[0]}</option>
            );
        });

        
        const onChangeEvent = (ev: DropdownSelect) => {
            //When changing the SELECT MODEL input
            enum _ { make, id };
            let { SELECTION } = this.state;
            const makeAndID = ev.target.value.split('____');
            
            //Do not change value and reset if the value is the same as before
            if (SELECTION.model !== makeAndID[_.make]) {
                SELECTION.model = makeAndID[_.make];
                SELECTION.id = makeAndID[_.id];
                this.setState({ SELECTION });
                if (Cookies.get('current_vehicle')) { Cookies.remove('current_vehicle'); }
                this.update_makemodel(JSONData);
            }
        }
        let selectValue = '____';
        if (SELECTION.model && SELECTION.id !== '____') {
            selectValue = SELECTION.model + '____' + SELECTION.id;
        }

        //determine whether to enable/disable <select> with custom classnames and attributes
        let selectWrap = 
            <select key='q_model' className='form-selectcar disabled' disabled={true} onChange={onChangeEvent} value={selectValue}>
                <option key='qso_md_XXX' disabled value='____'> -- SELECT MODEL -- </option>
                {output}
            </select>;
        if (list_model.length > 0) {
            selectWrap = 
                <select key='q_model' className='form-selectcar' disabled={false} onChange={onChangeEvent} value={selectValue}>
                    <option key='qso_md_XXX' disabled value='____'> -- SELECT MODEL -- </option>
                    {output}
                </select>;
        }

        return (selectWrap);
    }

    //MAIN template
    private template_main(): JSX.Element {
        return(<div key='q_wrapper' className='wrapper'>
            {this.template_lander()}
            {this.template_selector()}
        </div>)
    }

    public render() {
        return(this.template_main());
    }
}