import React from 'react';
import Template from './template'

type Props = {};
type State = {
    bgy_landing: number
};

export default class MainPage extends React.Component<Props, State> { 
    constructor(p: Props) {
        super(p);
        this.state = {
            bgy_landing: 0
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
            bgy_landing: window.pageYOffset / 2
        });
    }

    render() {
        const { bgy_landing } = this.state;

        return (
            <Template
                head_bgy={bgy_landing}
                head_bgo={0}
            />
        );
    }
}