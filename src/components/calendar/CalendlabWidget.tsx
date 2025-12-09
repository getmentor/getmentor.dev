interface CalendlabWidgetProps {
  url: string
}

export default function CalendlabWidget({ url }: CalendlabWidgetProps): JSX.Element {
  const embedUrl = url + '?embed=true'

  return <iframe src={embedUrl} width="100%" height="700px" frameBorder="0"></iframe>
}
