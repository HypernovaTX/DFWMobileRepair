import React from 'react';
import * as emailjs from 'emailjs-com'
import{ init } from 'emailjs-com';
init("");

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
    submitted: boolean,
    popupMessage: string,
    popupVisible: number,
};

export default class ContactForm extends React.Component<Props, State> {
    re_emailVerify: RegExp;
    re_numbers: RegExp;
    dest_email: string;
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
            submitted: false,
            popupMessage: 'This is a test message',
            popupVisible: 0,
        };

        this.re_emailVerify = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/g;
        this.re_numbers = /[^\d]/g;
        this.inquiryList = [
            'Get a quote',
            'Schedule an appointment',
            'Other inquiry'
        ];
        this.dest_email = '';
    }

    handleSubmit(e: any): void {
        e.preventDefault()
        const {
            form_name,
            form_email,
            form_title,
            form_phone,
            form_type,
            form_vehicle,
            form_description
        } = this.state;

        const templateParams = {
            from_name: form_name,
            from_email: form_email,
            to_name: this.dest_email,
            subject: form_title,
            message: form_description,
            phone: form_phone,
            vehicle: form_vehicle,
            request: form_type,
        }

        const emailTemplate
            = (form_type === this.inquiryList[2])
                ? 'template_dfwmr_misc'
                : 'template_dfwmr_quote';

        const verification = this.verifyEmail();

        if (verification === 1) {
            this.popupShow('One or more of the forms are empty, please check the required fields (with red *) before submitting.');
        } else if (verification === 2) {
            this.popupShow('The email is invalid. Did you made any typos?');
        } else {
            //Email IS Send
            this.popupShow('Your email has been sent to a DFW Mobile technician! Please allow us some time to get back to you accordingly! If you did not receive any email confirmation, please try again later.');
            this.resetForm();
        }
     }

    resetForm(): void {
        this.setState({
            form_name: '',
            form_email: '',
            form_type: '',
            form_title: '',
            form_phone: '',
            form_description: '',
            form_vehicle: '',
        });
    }

    /**
     * 0 - no errors
     * 1 - empty form
     * 2 - invalid email
     * 3 - invalid phone number
     */
    verifyEmail(): number {
        const {
            form_name, form_email, form_title, form_phone, form_type, form_vehicle, form_description
        } = this.state;

        if (form_name === ''
        || form_email === ''
        || form_title === ''
        || form_phone === ''
        || form_description === '')
            { return 1; }
        if (form_vehicle === '' && form_type !== this.inquiryList[2]) { return 1; }
        if (!form_email.match(this.re_emailVerify)) { return 2; }
        return 0;
    }

    updateForm(state: string, value: string): void {
        switch (state) {
            case ('name'):          this.setState({ form_name: value }); break;
            case ('email'):         this.setState({ form_email: value }); break;
            case ('type'):          this.setState({ form_type: value }); break;
            case ('title'):         this.setState({ form_title: value }); break;
            case ('description'):   this.setState({ form_description: value }); break;
            case ('vehicle'):       this.setState({ form_vehicle: value }); break;
            case ('phone'):         this.setState({ form_phone: value }); break;
        }
        
    }
    
    requiredMark(key: string): JSX.Element {
        return (
            <span key={key} style={{color: '#C22'}}>*</span>
        );
    }

    formatPhoneText(value: string): string {
        value = value.replace(/[^0-9\b]/g, '').substring(0, 10);
        
        if (value.length > 3 && value.length <= 6) {
            value = value.slice(0,3) + "-" + value.slice(3);
        } else if (value.length > 6) {
            value = value.slice(0,3) + "-" + value.slice(3,6) + "-" + value.slice(6);
        }
        return value;
    }

    template():JSX.Element {
        let popup = <></>
        if (this.state.popupVisible > 0) { popup = this.popup(); }
        return(<>
            {popup}
            <form key='contact_form' onSubmit={this.handleSubmit.bind(this)}>
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
                    <div key='cform_phone' className='form-title'>Phone Number (xxx-xxx-xxxx){this.requiredMark('title_required')}</div>
                    <div key='cform_phone_box'>
                        <input
                            key = 'cform_phone_box_input'
                            type = 'text'
                            value = {this.state.form_phone}
                            onChange = {(c: any) => {this.updateForm('phone', this.formatPhoneText(c.target.value))}}
                            disabled = {false}
                            pattern='[\d-]*'
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

                <div key='cform_block6' className='form-block-n'>
                    <div key='cform_car' className='form-title'>Vehicle (Year Make Model Trim) {
                        (this.state.form_type !== this.inquiryList[2]) ? this.requiredMark('title_required') : <></>
                    }</div>
                    <div key='cform_car_box'>
                        <input
                            key = 'cform_car_box_input'
                            type = 'text'
                            value = {this.state.form_vehicle}
                            onChange = {(c: any) => {this.updateForm('vehicle', c.target.value)}}
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
                        type = 'submit'
                        disabled = {false}
                        onClick = {() => {/* Do nothing at the moment */}}
                        className = 'form-button'
                    >Submit</button>
                </div>
            </form>
            <div key='contact_note' className='contact-note'>Phone: 972-968-9688</div>
        </>);
    }

    popupShow = (message: string) => {
        let { popupVisible } = this.state;
        if (popupVisible === 0) {
            this.setState({popupVisible: 1, popupMessage: message});
            setTimeout(() => {
                this.setState({popupVisible: 2});
            }, 50);
        }
    };

    popupHide = () => {
        let { popupVisible } = this.state;
        if (popupVisible > 0 || popupVisible < 3) {
            this.setState({popupVisible: 3});
            setTimeout(() => {
                this.setState({popupVisible: 0});
            }, 500);
        }
    };

    popup(): JSX.Element {
        const { popupMessage, popupVisible } = this.state;
        const opacity = (popupVisible === 2)
            ? { opacity: 1 }
            : { opacity: 0 }
        const boxY = { top: (opacity.opacity * 48) - 48 };
        const disabledButton = (popupVisible === 3) ? 'disabled' : '';
        return(
            <div key='popup_bg' className='popup-overlay' style={opacity}>
                <div key='popup_box' className='popup-box' style={boxY}>
                    <span key='popup_text' className='popup-text'>{popupMessage}</span>
                    <div key='popup_close' className={`popup-button ${disabledButton}`} onClick={() => {this.popupHide()}}>Close</div>
                </div>
            </div>
        );
    }

    render() {
        return (this.template());
    }
}