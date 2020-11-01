import React from 'react';
import Template from './template'

type Props = {};
type State = {
    bgy_landing: number,
    bgy_panel2: number
};

export default class MainPage extends React.Component<Props, State> { 
    constructor(p: Props) {
        super(p);
        this.state = {
            bgy_landing: 0,
            bgy_panel2: 0
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
        this.setState({
            bgy_landing: window.pageYOffset / 2,
            bgy_panel2: window.pageYOffset / 3
        });
    }

    render() {
        const { bgy_landing, bgy_panel2 } = this.state;

        return (
            <Template
                head_bgy={bgy_landing}
                head_bgo={0}
                p2_bgy={bgy_panel2}
            />
        );
    }
}