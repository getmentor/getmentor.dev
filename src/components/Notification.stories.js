import Notification from './Notification'

export default {
  title: 'Notification',
  component: Notification,
}

const Template = (args) => <Notification {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'Successfully saved!',
  content: 'Anyone with a link can now view this file.',
}

export const WithoutTitle = Template.bind({})
WithoutTitle.args = {
  title: '',
  content: 'Successfully saved!',
}
