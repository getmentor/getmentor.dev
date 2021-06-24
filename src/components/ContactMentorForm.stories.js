import ContactMentorForm from './ContactMentorForm'

export default {
  title: 'ContactMentorForm',
  component: ContactMentorForm,
}

const Template = (args) => (
  <div className="max-w-lg">
    <ContactMentorForm {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  isLoading: false,
  isError: false,
}
