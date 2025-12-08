import sanitizeHtml from 'sanitize-html'

/**
 * SECURITY: Sanitize user-generated HTML content to prevent XSS attacks
 * This function helps to migrate HTML from one wysiwyg to another
 * and ensures all content is properly sanitized
 *
 * @param {string} html - Raw HTML content from user
 * @returns {string} - Sanitized HTML safe for rendering
 */
export function htmlContent(html) {
  if (!html) return ''

  // First, handle wysiwyg v1 (airtable) format migration
  let processedHTML = html
  if (!html.startsWith('<p>')) {
    processedHTML =
      '<p>' + html.replace(/\n+([0-9-])/g, '<br/>$1').replace(/\n+/g, '</p><p>') + '</p>'
  }

  // SECURITY: Sanitize HTML to prevent XSS attacks
  // Only allow safe tags and attributes
  const clean = sanitizeHtml(processedHTML, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'a',
      'ul',
      'ol',
      'li',
      'h2',
      'h3',
      'h4',
      'blockquote',
      'code',
      'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    // Disallow all URL schemes except http(s) and mailto
    allowedSchemes: ['http', 'https', 'mailto'],
    // Transform all links to be safe
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }
      },
    },
  })

  return clean
}
