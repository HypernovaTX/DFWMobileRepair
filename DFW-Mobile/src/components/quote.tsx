import React from 'react';
import './../resources/quote.css';
import axios, { AxiosResponse } from 'axios';
import * as CONFIG from './../config.json';
import ContactForm from './contact';
import './../resources/loading.min.css';
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
    has_car: boolean,
    empty_quote: boolean,
};

export default class Quotes extends React.Component<Props, State> {
    private _ismounted: boolean = false;
    private ref_top: RefDiv = React.createRef();
    private ref_quotebox: RefDiv = React.createRef();
    private waitForData: NodeJS.Timeout = setTimeout(() => {}, 0);

    constructor(p: Props) {
        super(p);

        this.state = {
            SELECTION: { year: 'NA', make: 'NO_MAKE_NAME', model: '', id: '____', }, 
            DATA: { title: 'root', child: '(null)' }, 

            list_make: [],
            list_model: [],

            load_general: false, 
            load_list: false, 
            has_car: false, 
            empty_quote: true, 
        }
    }
    //-------------------------------------------------------------------- COMPONENT --------------------------------------------------------------------
    public componentDidMount(): void {
        this.setState({ load_general: true });
        this._ismounted = true;
        /*if (localStorage.getItem('my_vehicle')) {
            const SELECTION = JSON.parse(
                localStorage.getItem('my_vehicle') || JSON.stringify(this.state.SELECTION)
            );
            this.setState({ SELECTION });
        }*/
        this.getFullVehicleList();

        this.waitForData = setInterval(() => {
            if (this.state.empty_quote) { this.forceUpdate(); }
        }, 500);
    }

    //-------------------------------------------------------------------- API --------------------------------------------------------------------
    private getFullVehicleList(): void {
        axios.get(`${CONFIG.backendhost}/${CONFIG.backendindex}?act=quote&q=fulllist`)
        .then((response: APIResponse) => {
            if (this._ismounted && typeof response.data !== 'string') {
                const refinedData = this.obj_sort(this.obj_setTree('root', response.data));
                localStorage.setItem(`quote_list`, JSON.stringify(refinedData));
                //setTimeout(() => { this.setState({ load_general: false }); }, 1000);
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
            setTimeout(() => {
                this.setState({ load_list: false, has_car: true });
            }, 500);
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
    private update_makemodel(input: intTreeObj): void {
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
            localStorage.setItem('my_vehicle', JSON.stringify(SELECTION));
            this.setState({ load_list: true, has_car: true });
            this.getVehicleQuotes();
        }
        this.setState({ list_make, list_model });
    }

    private get_quotediv_height(): number {
        const quoteBoxRef = this.ref_quotebox.current;
        if (quoteBoxRef) {
            console.log('height: ' + quoteBoxRef.clientHeight);
            return (quoteBoxRef.clientHeight);
        }
        return 0;
    }

    private scrollTo(ref: React.RefObject<any>): () => void {
        const scroll_behavior = { behavior: 'smooth', block: 'start' };
        const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        //const up = window.pageYOffset;
        //console.log({ up });

        //iOS Safari scrolling bug fix
        if (iosPlatforms.indexOf(window.navigator.platform) !== -1) {
            return () => { ref.current.scrollIntoViewIfNeeded(scroll_behavior); };
        }
        //Applies to any system 
        else {
            return () => { ref.current.scrollIntoView(scroll_behavior); };
        }
    }

    //-------------------------------------------------------------------- TEMPLATE --------------------------------------------------------------------
    //The very top banner
    private template_lander(): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = { backgroundPositionY: `calc(${(window.pageYOffset / 2 )} - 50vh)` };
        const preventDrag = (e: DragEv) => { e.preventDefault(); };
        const goHome = () => { window.location.href = CONFIG.root; }

        return (
            <div key='qt_l' className='lander quote' style={style} ref={this.ref_top} onClick={goHome}>
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
        const { load_general } = this.state;
        const styleSpinner = { animationDuration: '2s' };
        const preventDrag = (e: DragEv) => { e.preventDefault(); };
        const footnote = `
            If your vehicle and/or service is not on the list. 
            Please give us a call at (972) 968-9688 or leave us a message using the contact form below. 
            We will get back to you as soon as possible! 
        `;
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
        if (load_general) {
            selectors = (
                <div key='loading_all_cars' className='list-quotes load'>
                    <div key='qt_qss_loading_icon' className='ld ld-clock' style={styleSpinner} onDragStart={preventDrag}><img
                        src={require('./../resources/images/nut.png')} alt='loading' key='quoteedit_loading_img' onDragStart={preventDrag}
                    ></img></div>
                    <div key='qt_qss_loading_txt' className='loading-cover-text'>Loading vehicle list...</div>
                </div>
            );
        }

        const wrapper = (
            <div key='qt_s' className='ct-section section5'>
                <div key='qt_ss' className='section2-box'>
                    <h3>Select your vehicle:</h3>
                    {selectors}

                    <div key='qt_s_note' className='quote-footnote'>{footnote}</div>
                </div>
            </div>
        );
        return (wrapper);
    }
    private template_selection_year(): JSX.Element {
        const { SELECTION, empty_quote } = this.state;
        let JSONData: intTreeObj = { title: 'root', child: '(null)' };
        if (localStorage.getItem('quote_list') !== null) {
            if (empty_quote) { this.setState({ empty_quote: false }); }
            if (this.waitForData) { clearTimeout(this.waitForData); }
            JSONData = JSON.parse(
                localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`
            );
        } else if (!empty_quote) {
            this.setState({ empty_quote: true, load_general: true });
            this.getFullVehicleList();
        }
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
                        this.setState({ SELECTION, list_model: [], has_car: false });
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
        let JSONData: intTreeObj = { title: 'root', child: '(null)' };
        let output: JSX.Element[] = [];


        if (localStorage.getItem('quote_list') !== null) {
            JSONData = JSON.parse(
                localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`
            );
        }

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
                this.setState({ SELECTION, list_model: [], has_car: false });
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
        let JSONData: intTreeObj = { title: 'root', child: '(null)' };
        let output: JSX.Element[] = [];

        if (localStorage.getItem('quote_list') !== null) {
            JSONData = JSON.parse(
                localStorage.getItem('quote_list') || `{ title: 'root', child: '(null)' }`
            );
        }

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
                this.setState({ SELECTION, has_car: false });
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

    private template_list_quotes(): JSX.Element {
        const { has_car, load_list, SELECTION } = this.state;
        const wrapperClassName = (has_car || load_list) ? 'active' : '';
        const sectionTitle = `Quotes for ${SELECTION.year} ${SELECTION.make} ${SELECTION.model}`;
        let cacheData: intTreeObj = { title: 'root', child: '(null)' };

        //Prepare saved localStorage data 'quote_vehicle' (saved list of quotes for a selected car)
        if (localStorage.getItem('quote_vehicle') !== null) {
            cacheData = JSON.parse(
                localStorage.getItem('quote_vehicle') || `{ title: 'root', child: '(null)' }`
            );
        }

        //Get height for the section
        //let styleHeight = (has_car || load_list) ? { height: this.get_quotediv_height() + 160 } : { height: 0 };
        //console.log({ styleHeight });
        //Default
        let contents = (<div key='qt_qss_wrap' className='list-quotes none'>No Data</div>);

        //When the list is loading
        if (load_list) {
            const styleSpinner = { animationDuration: '2s' };
            contents = (
                <div key='qt_qss_wrap' className='list-quotes load'>
                    <div key='qt_qss_loading_icon' className='ld ld-clock' style={styleSpinner}><img
                        src={require('./../resources/images/nut.png')} alt='loading' key='quoteedit_loading_img' 
                    ></img></div>
                    <div key='qt_qss_loading_txt' className='loading-cover-text'>Loading quotes...</div>
                </div>
            );
        }
        //When the list is done loading and has data
        else if (has_car && typeof cacheData.child !== 'string') {
            contents = (
                <div key='qt_qss_wrap' className='list-quotes'>
                    {this.template_format_quote(cacheData)}
                </div>
            );
        }

        const wrapper = (
            <div key='qt_qs' className={`ct-section section6 ${wrapperClassName}`} style={{}}> 
                <div key='qt_qss' className='section3-box' ref={this.ref_quotebox}>
                    <h2>{sectionTitle}</h2>
                    {contents}
                </div>
            </div>
        );
        return (wrapper);
    }
    private template_format_quote(data: intTreeObj): JSX.Element[] {
        let output: JSX.Element[] = [];
        //start from the root
        if (data.title === 'root') {
            //Ensure child data is not a string
            if (typeof data.child === 'string') { data.child = []; }
            //for each category
            for (const cat of data.child) {
                const name = cat.title;
                //Populate the items (subcat)
                const child = this.template_format_quote(cat);

                //Push to the list of categories
                output.push(
                    <div key={`qt_list_cat_${name}`} className='qlist-cat'>
                        <div key={`qt_list_cat_title_${name}`} className='qlist-cat-title'>{name}</div>
                        {child}
                    </div>
                )
            }
            //If it's blank
            if (output.length === 0) {
                output.push(<React.Fragment key='qt_list_cat_NAN'>No Data</React.Fragment>);
            }
        }
        else {
            //Use this for putting the 'alt' tag on 'qlist-itm' for a slightly different color for every even numbered entry
            let altList = false;
            //for each item (subcat)
            for (const item of data.child as intTreeObj[]) {
                const name = item.title;
                const listAltClass = (altList) ? 'alt' : '';
                altList = !altList;
                //Push to the list of items (subcat)
                output.push(
                    <div key={`qt_list_${data.title}_itm_${name}`} className={`qlist-itm ${listAltClass}`}>
                        <div key={`qt_list_${data.title}_itm_${name}_l`} className='qlist-itm-l'>{item.title}</div>
                        <div key={`qt_list_${data.title}_itm_${name}_r`} className='qlist-itm-r'>${item.child}</div>
                    </div>
                )
            }
            //If it's blank
            if (output.length === 0) {
                output.push(
                    <div key={`qt_list_${data.title}_itm_NA`} className='qlist-itm nan'>- No Data -</div>
                );
            }
        }
        return output;
    }

    private template_footer(): JSX.Element {
        return (
            <div key='M_footer' className='footer'>
                <div key='f_container' className='footer-contain'>
                    <span key='f_text1' className='footer-text'>Copyright &#169; 2014 - 2020, DFW Mobile Repair</span>
                    <span key='f_text2' className='footer-text'>Website designed and programmed by Arthur (Hypernova) Guo</span>
                </div>
            </div>
        );
    }
    private template_gotop(): JSX.Element {
        let goTop = { opacity: 0, right: -80 };
        if (window.pageYOffset > window.innerHeight * 0.1) {
            goTop = { opacity: 1, right: 0 };
        }
        return <div key='q_go_up' className='go-top' style={goTop} onClick={this.scrollTo(this.ref_top)}
                >&#8679;</div>
    }

    //MAIN template
    private template_main(): JSX.Element {
        return(
            <div key='q_wrapper' className='wrapper'>
                {this.template_lander()}
                {this.template_selector()}
                {this.template_list_quotes()}
                <div key='M_section4' className='ct-section section4'>
                    <div key='contact_body' className='section1-box'>
                        <h2 key='contact_h2'>Contact Form</h2>
                        <div key='contact_content' className='contact-body'><ContactForm /></div>
                    </div>
                </div>
                {this.template_footer()}
            </div>
        );
    }

    public render() {
        return(
            <React.Fragment key='classWrapper'>
                
                {this.template_main()}
            </React.Fragment>
        );
    }
}