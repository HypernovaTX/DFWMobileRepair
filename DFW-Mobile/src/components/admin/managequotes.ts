import React from 'react';
import axios from 'axios';
import * as CONFIG from '../../config.json';

type Props = {
};
type State = {
    year: string,
    make: string,
    model: string,
};


export class manageQuotes extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            year: '',
            make: '',
            model: '',
        }
    }
}