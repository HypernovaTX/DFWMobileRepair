import React from 'react';
import axios from 'axios';
import * as CONFIG from '../config.json';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faPlus, faUsers, faTags } from '@fortawesome/free-solid-svg-icons';
//import Cookies from 'js-cookie';

type Props = {
};
type State = {
    SELECTION: {[parameter: string]: any}, 
    DATA: {[parameter: string]: any}, 
    
    list_year: string[], 
    list_make: string[], 
    list_model: string[], 

    load_general: boolean,
    load_list: boolean, 
};

export default class Quotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            SELECTION: { year: '', make: '', model: '', }, 
            DATA: {}, 

            list_year: [], 
            list_make: [], 
            list_model: [], 

            load_general: false, 
            load_list: false,
        }
    }

    template_lander() {

    }
    template_selector() {

    }
    template_quotesection() {
        const { DATA } = this.state;
    }
    template_main() {
        return(<div key='q_wrapper' className='wrapper'>
            
        </div>)
    }

    render() {
        return(<React.Fragment key='na'></React.Fragment>);
    }
}