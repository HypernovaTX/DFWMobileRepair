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
}
interface intRawJSON {[key: string]: any};

type typeRefDiv = React.RefObject<HTMLDivElement>;
type typeDragEv = React.DragEvent<HTMLElement>;
type typeStringOrNo = string | undefined;

type Props = {
};
type State = {
    SELECTION: intSelector, 
    DATA: intTreeObj, 
    
    list_year: string[], 
    list_make: string[], 
    list_model: string[], 

    load_general: boolean,
    load_list: boolean, 
};

export default class Quotes extends React.Component<Props, State> {
    private _ismounted: boolean = false;
    private ref_top: typeRefDiv = React.createRef();

    constructor(p: Props) {
        super(p);

        this.state = {
            SELECTION: { year: '', make: '', model: '', }, 
            DATA: { title: 'root', child: '(null)' }, 

            list_year: [], 
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
        this.getData();
    }

    //-------------------------------------------------------------------- API --------------------------------------------------------------------
    private getData(): void {
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
                    {}
                </div>
            </div>
        );
    }
    private template_generate_selection(): JSX.Element {
        //If there's no data to pull
        if (localStorage.getItem('quote_list') === undefined) {
            return (<div key='no-data'></div>)
        }
        
        const getData = JSON.parse(localStorage.getItem('quote_list') || '{}');
        return (
            <div key='no-data'></div>
        )
    }
    private template_quotesection() {
        //const { DATA } = this.state;
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