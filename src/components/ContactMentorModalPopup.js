import { useEffect, useState } from 'react'
import ContactMentorForm from './ContactMentorForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import analytics from '../lib/analytics'
import Link from 'next/link'

export default function ContactMentorModalPopup({ mentor, titleText }) {
  const [showModal, setShowModal] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [readyStatus, setReadyStatus] = useState('')

  const addScrollLock = () => {
    document.querySelector('html').classList.add('scroll-lock')
  }
  const removeScrollLock = () => {
    document.querySelector('html').classList.remove('scroll-lock')
  }

  useEffect(() => {
    if (window?.location?.hash === '#contact' && firstLoad) {
      setFirstLoad(false)
      onShowModal()
    }
  })

  const onShowModal = () => {
    setShowModal(true)
    addScrollLock()
  }

  const onCloseModal = (rs) => {
    setShowModal(false)
    setReadyStatus(rs)
    removeScrollLock()
  }

  const onSubmit = (data) => {
    if (readyStatus === 'loading') {
      return
    }

    setReadyStatus('loading')

    fetch('/api/contact-mentor', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        mentorAirtableId: mentor.id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setReadyStatus('success')
          onCloseModal('success')
        } else {
          setReadyStatus('error')
        }
      })
      .catch((e) => {
        setReadyStatus('error')
        console.error(e)
      })
  }

  return (
    <>
      {/*body*/}
      {readyStatus === 'success' ? (
        <SuccessMessage mentor={mentor} />
      ) : (
        <Link href="#contact" shallow>
          <button className="button" type="button" onClick={onShowModal}>
            {titleText}
          </button>
        </Link>
      )}
      {showModal ? (
        <>
          <div className="justify-center items-center  overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between rounded-t">
                  <button
                    className="p-1 ml-auto bg-transparent opacity-60 border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={onCloseModal}
                  >
                    <span className="text-black pb-0 h-6 w-6 text-4xl pr-6 block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>

                {/*body*/}
                {readyStatus === 'success' ? (
                  <div className="container">
                    <SuccessMessage mentor={mentor} />
                  </div>
                ) : (
                  <div className="container py-6">
                    <div className="max-w-md mx-auto">
                      <ContactMentorForm
                        mentor={mentor}
                        isLoading={readyStatus === 'loading'}
                        isError={readyStatus === 'error'}
                        onSubmit={onSubmit}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  )
}

function SuccessMessage({ mentor }) {
  useEffect(() => {
    analytics.event('Mentor Request Sent', {
      id: mentor.id,
      name: mentor.name,
      experience: mentor.experience,
      price: mentor.price,
      menteeCount: mentor.menteeCount,
    })
  }, [])

  return (
    <div className="text-center">
      <div className="text-xl bg-green-100 py-5 px-4">
        <FontAwesomeIcon icon={faCheck} /> Ваша заявка принята
      </div>
    </div>
  )
}
