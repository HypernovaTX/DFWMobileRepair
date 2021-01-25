import React from 'react';
import '../resources/quote.css';
//import axios from 'axios';
//import * as CONFIG from '../config.json';
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

    }

    //-------------------------------------------------------------------- API --------------------------------------------------------------------

    //-------------------------------------------------------------------- LOGICS --------------------------------------------------------------------

    //-------------------------------------------------------------------- TEMPLATE --------------------------------------------------------------------
    private template_lander(): JSX.Element {
        const LOGO_IMG = require('./../resources/images/logo-current.png');
        const style = { backgroundPositionY: window.pageYOffset / 2 };
        const preventDrag = (e: typeDragEv) => { e.preventDefault(); };
        const key = ['qt_ld', 'qt_ld_co', 'qt_ld_co_lo'];

        return (
            <div key={key[0]} className='lander quote' style={style} ref={this.ref_top}>
                <div key={key[1]} className='lander-contain quote' draggable='false' onDragStart={preventDrag}>
                    <div key={key[2]} className='logo'>
                        <img key={`${key[2]}_im`} src={LOGO_IMG} alt='DFW Mobile Repair Logo' draggable="false" onDragStart={preventDrag}></img>
                        <div key={`${key[2]}_sc`} className='land-btn-section'>
                            <span key={`${key[2]}_sc_bt`} className='land-item' onClick={() => {}}>RETURN TO HOME</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    private template_selector() {

    }
    private template_quotesection() {
        const { DATA } = this.state;
    }
    private template_main(): JSX.Element {
        return(<div key='q_wrapper' className='wrapper'>
            {this.template_lander()}
        </div>)
    }

    public render() {
        return(this.template_main());
    }
}