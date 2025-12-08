import classNames from 'classnames'
import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  className?: string
  children: ReactNode
}

interface TitleProps {
  className?: string
  children: ReactNode
}

function Title({ className, children }: TitleProps): JSX.Element {
  return <h2 className={classNames('text-center mt-0', className)}>{children}</h2>
}

function Section({ id, className, children }: SectionProps): JSX.Element {
  return (
    <section className={classNames('py-14', className)} data-section={id}>
      <a id={id}></a>

      <div className="container">{children}</div>
    </section>
  )
}

Section.Title = Title

export default Section
