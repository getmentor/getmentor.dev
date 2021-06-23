import ContactMentorForm from './ContactMentorForm'

export default {
  title: 'ContactMentorForm',
  component: ContactMentorForm,
}

const Template = (args) => <ContactMentorForm {...args} />

export const Default = Template.bind({})
Default.args = {}
