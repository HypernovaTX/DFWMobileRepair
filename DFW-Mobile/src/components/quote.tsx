import React from 'react';
import '../resources/quote.css';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from '../config.json';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faPlus, faUsers, faTags } from '@fortawesome/free-solid-svg-icons';
//import Cookies from 'js-cookie';

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

type typeRefDiv = React.RefObject<HTMLDivElement>;
type typeDragEv = React.DragEvent<HTMLElement>;
type typeStringOrNo = string | undefined;
type typeDropdown = React.ChangeEvent<HTMLSelectElement>;

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
    private ref_top: typeRefDiv = React.createRef();

    constructor(p: Props) {
        super(p);

        this.state = {
            SELECTION: { year: '', make: '', model: '', id: '____', }, 
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
        const postData = new FormData();

        axios.post(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=fulllist`, postData)
        .then((response: AxiosResponse<any>) => {
            if (this._ismounted && typeof response.data !== 'string') {
                const refinedData = this.obj_setTree('root', response.data);
                localStorage.setItem(`quote_list`, JSON.stringify(refinedData));
            }
        });
    }
    //-------------------------------------------------------------------- LOGICS --------------------------------------------------------------------
    //convert raw JSON data into something more refined 
    obj_setTree(title: string, child: intRawJSON | string): intTreeObj {
        let childData: intTreeObj[] = [];
        let childString: typeStringOrNo;

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

    update_makemodel(input: intTreeObj): void {
        const { SELECTION } = this.state;

        let { list_make, list_model } = this.state;
        if (SELECTION.year !== '' && typeof input.child !== 'string') {
            for (const each_year of input.child) {
                if (each_year.title === SELECTION.year && typeof each_year.child !== 'string') {
                    for (const each_make of each_year.child) {
                        if (each_make.title === SELECTION.make && typeof each_make.child !== 'string' && SELECTION.make !== '') {
                            list_model = each_make.child.reverse().map((model: intTreeObj) => {
                                return [model.title, model.child as string];
                            }); 
                        }
                    }
                    list_make = each_year.child.reverse().map((make: intTreeObj) => { return make.title })
                }
            }
        }
        this.setState({ list_make, list_model });
    }

    //-------------------------------------------------------------------- TEMPLATE --------------------------------------------------------------------
    private template_lander(): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = { backgroundPositionY: `calc(${(window.pageYOffset / 2 )} - 50vh)` };
        const preventDrag = (e: typeDragEv) => { e.preventDefault(); };

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
    private template_selector(): JSX.Element {
        return (
            <div key='qt_s' className='ct-section section4' style={{}} ref={this.ref_top}>
                <div key='qt_ss' className='section2-box'>
                    <h3>Select your vehicle:</h3>
                    {this.template_generate_selection()}
                </div>
            </div>
        );
    }
    private template_generate_selection(): JSX.Element {
        //If there's no data to pull
        if (localStorage.getItem('quote_list') === undefined) {
            return (<div key='no-data'></div>)
        }
        return (
            <div key='selectionArea' className='selection-area'>
                {this.template_selection_year()}
                {this.template_selection_make()}
                {this.template_selection_model()}
            </div>
        )
    }

    private template_selection_year(): JSX.Element {
        const JSONData: intTreeObj = JSON.parse(
            localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`
        );
        let output: JSX.Element[] = [<React.Fragment key='q_year'></React.Fragment>];
        //Go over each of the child for year
        if (typeof JSONData.child !== 'string') {
            output = JSONData.child.reverse().map((childObj: intTreeObj) => {
                return <option value={childObj.title}>{childObj.title}</option>
            })
        }
        return (
            <select
                key='q_year'
                className='form-selectcar '
                onChange={(ev: typeDropdown) => {
                    //When changing the SELECT YEAR input
                    let { SELECTION } = this.state;
                    //Do not change value and reset if the value is the same as before
                    if (SELECTION.year !== ev.target.value) {
                        SELECTION.year = ev.target.value;
                        SELECTION.make = '';
                        SELECTION.model = '';
                        SELECTION.id = '____';
                        this.update_makemodel(JSONData);
                        this.setState({ SELECTION, list_model: [] });
                    }
                    
                }}
            >
                <option disabled selected> -- SELECT YEAR -- </option>
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
            return <option value={makeName}>{makeName}</option>
        });

        
        const onChangeEvent = (ev: typeDropdown) => {
            //When changing the SELECT MAKE input
            let { SELECTION } = this.state;
            //Do not change value and reset if the value is the same as before
            if (SELECTION.make !== ev.target.value) {
                SELECTION.make = ev.target.value;
                SELECTION.model = '';
                SELECTION.id = '____';
                this.setState({ SELECTION, list_model: [] });
                this.update_makemodel(JSONData);
            }
        }

        //determine the stype of <select>
        let selectWrap = 
            <select key='q_make' className='form-selectcar disabled' disabled={true} onChange={onChangeEvent} value={SELECTION.make}>
                <option disabled selected value=''> -- SELECT MAKE -- </option>
                {output}
            </select>;
        if (list_make.length > 0) {
            selectWrap = 
                <select key='q_make' className='form-selectcar' disabled={false} onChange={onChangeEvent} value={SELECTION.make}>
                    <option disabled selected value=''> -- SELECT MAKE -- </option>
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
                <option value={modelName.join('____')}>{modelName[0]}</option>
            );
        });

        
        const onChangeEvent = (ev: typeDropdown) => {
            //When changing the SELECT MODEL input
            enum _ { make, id };
            let { SELECTION } = this.state;
            const makeAndID = ev.target.value.split('____');
            
            //Do not change value and reset if the value is the same as before
            if (SELECTION.model !== makeAndID[_.make]) {
                SELECTION.model = makeAndID[_.make];
                SELECTION.id = makeAndID[_.id];
                this.setState({ SELECTION });
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
                <option disabled selected value='____'> -- SELECT MODEL -- </option>
                {output}
            </select>;
        if (list_model.length > 0) {
            selectWrap = 
                <select key='q_model' className='form-selectcar' disabled={false} onChange={onChangeEvent} value={selectValue}>
                    <option disabled selected value='____'> -- SELECT MODEL -- </option>
                    {output}
                </select>;
        }

        return (selectWrap);
    }

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