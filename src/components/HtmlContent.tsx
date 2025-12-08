import type { HtmlContentProps } from '@/types'
import { htmlContent } from '@/lib/html-content'

export default function HtmlContent({ content, className }: HtmlContentProps): JSX.Element {
  return <div className={className} dangerouslySetInnerHTML={{ __html: htmlContent(content) }} />
}
