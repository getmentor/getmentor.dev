import { htmlContent } from '@/lib/html-content'

describe('htmlContent', () => {
  it('wraps plain text with paragraphs and preserves line breaks', () => {
    const raw = 'First line\nSecond line'
    const result = htmlContent(raw)

    expect(result).toContain('<p>First line</p>')
    expect(result).toContain('<p>Second line</p>')
  })

  it('sanitizes script tags', () => {
    const raw = '<p>Hello</p><script>alert("xss")</script>'
    const result = htmlContent(raw)

    expect(result).toContain('<p>Hello</p>')
    expect(result).not.toContain('<script>')
  })

  it('forces safe link attributes', () => {
    const raw = '<a href="http://example.com">Example</a>'
    const result = htmlContent(raw)

    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })
})
