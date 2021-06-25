export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/mentor/' + context.params.slug,
      permanent: true,
    },
  }
}

export default function Mentor(props) {
  return <></>
}
