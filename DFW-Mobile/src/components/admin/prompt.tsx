import React from 'react';
//import * as CONFIG from '../../config.json';

type Props = {
    visible: boolean,
    message: string,
    action: () => {},
};
type State = {
    show: number,
};

export default class AdminPrompt extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);
        this.state = {
            show: 0,
        }
    }

    handleAnimation(): void {
        const { visible } = this.props;
        let { show } = this.state;
        if (show === 0 && visible === true) { show = 1; }
    }

    template(): JSX.Element {
        return(<div key='aaaaaaaa'></div>
        );
    }

    render() {
        return(<div key='admin_pm_body' className='admin-pm-body'></div>);
    }
}