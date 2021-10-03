/**
 * This function helps to migrate HTML from one wysiwyg to another.
 *
 * @param {string} html
 * @returns {string}
 */
export function htmlContent(html) {
  // wysiwyg v1 (airtable)
  if (!html.startsWith('<p>')) {
    return '<p>' + html.replace(/\n+([0-9-])/g, '<br/>$1').replace(/\n+/g, '</p><p>') + '</p>'
  }

  return html
}
