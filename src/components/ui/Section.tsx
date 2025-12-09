import classNames from 'classnames'
import { forwardRef, type ReactNode } from 'react'

interface SectionProps {
  id?: string
  className?: string
  children: ReactNode
}

interface TitleProps {
  className?: string
  children: ReactNode
}

const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  { className, children },
  ref
): JSX.Element {
  return (
    <h2 ref={ref} className={classNames('text-center mt-0', className)}>
      {children}
    </h2>
  )
})

function SectionBase({ id, className, children }: SectionProps): JSX.Element {
  return (
    <section className={classNames('py-14', className)} data-section={id}>
      <a id={id}></a>

      <div className="container">{children}</div>
    </section>
  )
}

const Section = SectionBase as typeof SectionBase & { Title: typeof Title }
Section.Title = Title

export default Section
