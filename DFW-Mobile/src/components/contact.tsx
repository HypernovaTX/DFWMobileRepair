import React from 'react';

type Props = {

};
type State = {
    form_name: string,
    form_email: string,
    form_type: string,
    form_phone: string,
    form_title: string,
    form_description: string,
    form_vehicle: string,
};

export default class ContactForm extends React.Component<Props, State> {
    re_emailVerify: RegExp;
    re_numbers: RegExp
    inquiryList: string[];
    constructor(p: Props) {
        super(p);
        this.state = {
            form_name: '',
            form_email: '',
            form_type: '',
            form_title: '',
            form_phone: '',
            form_description: '',
            form_vehicle: '',
        };

        this.re_emailVerify = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/g;
        this.re_numbers = /[^\d]/g;
        this.inquiryList = [
            'Get a quote',
            'Schedule an appointment',
            'Other inquiry'
        ];
    }

    updateForm(state: string, value: string): void {
        switch (state) {
            case ('name'):          this.setState({ form_name: value }); break;
            case ('email'):         this.setState({ form_email: value }); break;
            case ('type'):          this.setState({ form_type: value }); break;
            case ('phone'):         this.setState({ form_phone: value }); break;
            case ('title'):         this.setState({ form_title: value }); break;
            case ('description'):   this.setState({ form_description: value }); break;
            case ('vehicle'):         this.setState({ form_vehicle: value }); break;
        }
        
    }
    
    requiredMark(key: string): JSX.Element {
        return (
            <span key={key} style={{color: '#C22'}}>*</span>
        );
    }

    template():JSX.Element {
        return(<>
            <form key='contact_form'>
                <div key='cform_block1' className='form-block'>
                    <div key='cform_name' className='form-title'>Full Name{this.requiredMark('name_required')}</div>
                    <div key='cform_name_box'>
                        <input
                            key = 'cform_name_box_input'
                            type = 'text'
                            value = {this.state.form_name}
                            onChange = {(c: any) => {this.updateForm('name', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        ></input>
                    </div>
                </div>

                <div key='cform_block2' className='form-block'>
                    <div key='cform_email' className='form-title'>Your Email{this.requiredMark('email_required')}</div>
                    <div key='cform_email_box'>
                        <input
                            key = 'cform_name_box_input'
                            type = 'text'
                            value = {this.state.form_email}
                            onChange = {(c: any) => {this.updateForm('email', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        ></input>
                    </div>
                </div>

                <div key='cform_block5' className='form-block'>
                    <div key='cform_phone' className='form-title'>Phone Number{this.requiredMark('title_required')}</div>
                    <div key='cform_phone_box'>
                        <input
                            key = 'cform_phone_box_input'
                            type = 'text'
                            value = {this.state.form_title}
                            onChange = {(c: any) => {this.updateForm('phone', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        ></input>
                    </div>
                </div>

                <div key='cform_block3' className='form-block'>
                    <div key='cform_type' className='form-title'>Inquiry Type{this.requiredMark('type_required')}</div>
                    <div key='cform_type_box'>
                        <select
                            key = 'cform_type_box_input'
                            value = {this.state.form_type}
                            onChange = {(c: any) => {this.updateForm('type', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        >{
                            this.inquiryList.map((name, num) => {
                                return (
                                    <option
                                        key={`cform_type_option_${num}`}
                                        // eslint-disable-next-line
                                        value={name}
                                    >{name}</option>
                                );
                            })
                        }</select>
                    </div>
                </div>

                <div key='cform_block4' className='form-block-n'>
                    <div key='cform_title' className='form-title'>Subject{this.requiredMark('title_required')}</div>
                    <div key='cform_title_box'>
                        <input
                            key = 'cform_title_box_input'
                            type = 'text'
                            value = {this.state.form_title}
                            onChange = {(c: any) => {this.updateForm('title', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        ></input>
                    </div>
                </div>

                <div key='cform_block9' className='form-block-n'>
                    <div key='cform_description' className='form-title'>Description{this.requiredMark('desc_required')}</div>
                    <div key='cform_description_box'>
                        <textarea
                            key = 'cform_description_box_input'
                            value = {this.state.form_description}
                            onChange = {(c: any) => {this.updateForm('description', c.target.value)}}
                            rows = {8}
                            cols = {48}
                            disabled = {false}
                            className = 'form-input-textarea'
                        ></textarea>
                    </div>
                </div>
                <div key='cform_submit_block' className='form-block-n submit'>
                    <button
                        key = 'cform_submit_button'
                        type = 'button'
                        disabled = {false}
                        onClick = {() => {/* Do nothing at the moment */}}
                        className = 'form-button'
                    >Submit</button>
                </div>
            </form>
            <div key='contact_note' className='contact-note'>Phone: 972-968-9688</div>
        </>);
    }

    render() {
        return (this.template());
    }
}