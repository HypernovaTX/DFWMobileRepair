import React from 'react';

type Props = {

};
type State = {
    form_name: string,
    form_email: string,
    form_type: string,
    form_title: string,
    form_description: string,
};

export default class ContactForm extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);
        this.state = {
            form_name: '',
            form_email: '',
            form_type: '',
            form_title: '',
            form_description: '',
        };
    }

    updateForm(state: string, value: string):void {
        switch (state) {
            case ('name'):          this.setState({ form_name: value }); break;
            case ('email'):         this.setState({ form_email: value }); break;
            case ('type'):          this.setState({ form_type: value }); break;
            case ('title'):         this.setState({ form_title: value }); break;
            case ('description'):   this.setState({ form_description: value }); break;
        }
        
    }

    template():JSX.Element {
        return(<>
            <form key='contact_form'>
                <div key='cform_block1' className='form-block'>
                    <div key='cform_name' className='form-title'>Name</div>
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
                    <div key='cform_email' className='form-title'>Email</div>
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

                <div key='cform_block3' className='form-block'>
                    <div key='cform_type' className='form-title'>Inquiry</div>
                    <div key='cform_type_box'>
                        <input
                            key = 'cform_name_box_input'
                            type = 'text'
                            value = {this.state.form_type}
                            onChange = {(c: any) => {this.updateForm('type', c.target.value)}}
                            disabled = {false}
                            className = 'form-input-text'
                        ></input>
                    </div>
                </div>

                <div key='cform_block4' className='form-block'>
                    <div key='cform_title' className='form-name'>Subject</div>
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

                <div key='cform_block9' className='form-block'>
                    <div key='cform_description' className='form-title'>Description</div>
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
                <div key='cform_submit_block' className='form-block submit'>
                    <button
                        key = 'cform_submit_button'
                        type = 'button'
                        disabled = {false}
                        onClick = {() => {}}
                        className = 'form-button'
                    >Submit</button>
                </div>
            </form>
        </>);
    }

    render() {
        return (this.template());
    }
}