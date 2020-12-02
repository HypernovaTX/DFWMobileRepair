import React from 'react';
import axios from 'axios';
import * as CONFIG from '../config.json';

type Props = {
    action: string,
};
type State = {
    popupVisible: number,
};

export default class Popup extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);

        this.state = {
            popupVisible: 0,
        }
    }
}