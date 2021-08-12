import Notification from './Notification'

export default {
  title: 'Notification',
  component: Notification,
}

const Template = (args) => <Notification {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'Successfully saved!',
  description: 'Anyone with a link can now view this file.',
}
