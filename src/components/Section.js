import classNames from 'classnames'

export default function Section(props) {
  const {
    id,
    className,
    children,
  } = props

  return (
    <section className={classNames('py-14', className)} data-section={id}>
      <a name={id}></a>

      <div className="container">
        {children}
      </div>
    </section>
  )
}

function Title(props) {
  const {
    className,
    children,
  } = props

  return (
    <h2 className={classNames('text-center mt-0', className)}>
      {children}
    </h2>
  )
}

Section.Title = Title
