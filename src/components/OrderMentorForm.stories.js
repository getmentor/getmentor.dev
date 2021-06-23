import OrderMentorForm from './OrderMentorForm'

export default {
  title: 'OrderMentorForm',
  component: OrderMentorForm,
}

const Template = (args) => <OrderMentorForm {...args} />

export const Default = Template.bind({})
Default.args = {}
