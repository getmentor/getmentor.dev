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

export function getMentorFullProfileDescription(mentor) {
  var description = ''

  if (mentor.about) {
    description = htmlContent(mentor.about)
  }
  if (mentor.description) {
    description += htmlContent(mentor.description)
  }
  if (mentor.competencies) {
    description += '<p><b>Основные компетенции:</b><br/>' + mentor.competencies + '</p>'
  }
  return description
}
