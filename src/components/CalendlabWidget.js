export default function CalendlabWidget({ url }) {
  const embedUrl = url + '?embed=true'

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="700"
      frameBorder="0"
      style="border: none; min-height: 700px;"
      allowfullscreen
    ></iframe>
  )
}
