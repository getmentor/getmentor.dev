import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import classNames from 'classnames'
import { htmlContent } from '../lib/html-content'

export default function Wysiwyg({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-full my-2 mx-3 focus:outline-none',
      },
    },
    content: htmlContent(content),
    onUpdate() {
      onUpdate(this)
    },
  })

  return (
    <div className="block w-full sm:text-sm border border-gray-300 rounded-md shadow-sm relative">
      <div className="bg-white sticky top-0 z-10 rounded-t-md">
        <MenuBar editor={editor} />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function MenuBar({ editor }) {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:divide-x sm:divide-gray-300 border-b border-gray-300">
      <div className="px-2 my-2 pl-1">
        <div className="-my-1 space-x-1">
          <button
            type="button"
            title="Bold"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('bold'),
            })}
            onClick={() => {
              editor.chain().focus().toggleBold().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
            </svg>
          </button>

          <button
            type="button"
            title="Italic"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('italic'),
            })}
            onClick={() => {
              editor.chain().focus().toggleItalic().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
            </svg>
          </button>

          <button
            type="button"
            title="Strike"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('strike'),
            })}
            onClick={() => {
              editor.chain().focus().toggleStrike().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z" />
            </svg>
          </button>

          <button
            type="button"
            title="Link"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('link'),
            })}
            onClick={() => {
              const { from, to } = editor.state.selection

              let existingUrl = ''
              editor.state.doc.nodesBetween(from, to, (node) => {
                if (existingUrl !== '') {
                  return
                }

                for (const mark of node.marks) {
                  if (mark.type.name === 'link') {
                    existingUrl = mark.attrs.href
                    break
                  }
                }
              })

              const url = window.prompt('URL', existingUrl)
              if (url === null) {
                return // user canceled
              } else if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-2 my-2">
        <div className="-my-1 space-x-1">
          <button
            type="button"
            title="Heading 2"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('heading', { level: 2 }),
            })}
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0H24V24H0z" />
              <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8z" />
            </svg>
          </button>

          <button
            type="button"
            title="Heading 3"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('heading', { level: 3 }),
            })}
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0H24V24H0z" />
              <path d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z" />
            </svg>
          </button>

          <button
            type="button"
            title="Paragraph"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('paragraph'),
            })}
            onClick={() => {
              editor.chain().focus().setParagraph().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M12 6v15h-2v-5a6 6 0 1 1 0-12h10v2h-3v15h-2V6h-3zm-2 0a4 4 0 1 0 0 8V6z" />
            </svg>
          </button>

          <button
            type="button"
            title="Bullet List"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('bulletList'),
            })}
            onClick={() => {
              editor.chain().focus().toggleBulletList().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
            </svg>
          </button>

          <button
            type="button"
            title="Ordered List"
            className={classNames('rounded p-1 hover:bg-gray-200', {
              'bg-gray-200': editor.isActive('orderedList'),
            })}
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-2 my-2">
        <div className="-my-1 space-x-1">
          <button
            type="button"
            title="Hard Break"
            className="rounded p-1 hover:bg-gray-200"
            onClick={() => {
              editor.chain().focus().setHardBreak().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M15 18h1.5a2.5 2.5 0 1 0 0-5H3v-2h13.5a4.5 4.5 0 1 1 0 9H15v2l-4-3 4-3v2zM3 4h18v2H3V4zm6 14v2H3v-2h6z" />
            </svg>
          </button>

          <button
            type="button"
            title="Clear Format"
            className="rounded p-1 hover:bg-gray-200"
            onClick={() => {
              editor.chain().focus().clearNodes().run()
              editor.chain().focus().unsetAllMarks().run()
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M12.651 14.065L11.605 20H9.574l1.35-7.661-7.41-7.41L4.93 3.515 20.485 19.07l-1.414 1.414-6.42-6.42zm-.878-6.535l.27-1.53h-1.8l-2-2H20v2h-5.927L13.5 9.257 11.773 7.53z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
