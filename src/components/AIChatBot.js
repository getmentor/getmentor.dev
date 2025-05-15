import Link from 'next/link'
import { useState } from 'react'
import classNames from 'classnames'

export default function AIChatBot({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      {/* Trigger Button */}
      <div className="text-center mt-0 mb-4">
        <Link
          href="#"
          className="link"
          onClick={(e) => {
            e.preventDefault()
            setIsOpen(true)
          }}
        >
          <sup>β</sup> Подобрать ментора с помощью AI
        </Link>
        <br />(
        <Link
          className="link"
          href="https://airtable.com/app9RGcIg2p4LksJE/pagIu4nANl8EYUNTz/form"
          target="_blank"
        >
          <i>оставить отзыв</i>
        </Link>
        )
      </div>

      {/* Modal Overlay */}
      <div
        className={classNames(
          'fixed inset-0 flex items-center justify-center z-50',
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        onClick={closeModal}
        style={{ transition: 'opacity 0.3s ease' }} // Smooth transition for visibility
      >
        {/* Modal Content */}
        <div
          className="relative w-5/6 h-5/6 max-w-3xl bg-white p-6 rounded shadow-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <div id="ai_chat_bot" className="w-full h-full"></div>
        </div>
      </div>

      {/* Background Overlay */}
      <div
        className={classNames(
          'fixed inset-0 bg-black z-40',
          isOpen ? 'visible opacity-50' : 'invisible opacity-0'
        )}
        onClick={closeModal}
        style={{ transition: 'opacity 0.3s ease' }} // Smooth transition for visibility
      ></div>
    </>
  )
}
