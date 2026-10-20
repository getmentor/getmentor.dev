import { Fragment, useState } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import type { DonateItem } from '@/types'

interface DonateLinksProps {
  donates: DonateItem[]
  itemClassName?: string
}

function DonateLogo({ donate }: { donate: DonateItem }): JSX.Element {
  return (
    <Image
      src={donate.image.url}
      width={donate.image.width}
      height={donate.image.height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      alt={donate.name}
    />
  )
}

export default function DonateLinks({
  donates,
  itemClassName = 'h-20 px-8 flex justify-center items-center',
}: DonateLinksProps): JSX.Element {
  const [qrDonate, setQrDonate] = useState<DonateItem | null>(null)

  return (
    <>
      <div className="flex flex-wrap justify-center items-center">
        {donates.map((donate) => {
          const link = (
            <a className={itemClassName} href={donate.linkUrl} target="_blank" rel="noreferrer">
              <DonateLogo donate={donate} />
            </a>
          )

          if (!donate.qrCode) {
            return <Fragment key={donate.name}>{link}</Fragment>
          }

          // Mobile: open the link directly. Desktop: show a QR code modal.
          return (
            <Fragment key={donate.name}>
              <div className="md:hidden">{link}</div>
              <button
                type="button"
                className={`hidden md:flex ${itemClassName}`}
                onClick={() => setQrDonate(donate)}
              >
                <DonateLogo donate={donate} />
              </button>
            </Fragment>
          )
        })}
      </div>

      <Transition show={qrDonate !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setQrDonate(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <button
                  type="button"
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setQrDonate(null)}
                  aria-label="Закрыть"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {qrDonate?.qrCode && (
                  <>
                    <Dialog.Title className="text-xl font-semibold text-center mb-4">
                      {qrDonate.description}
                    </Dialog.Title>

                    <Image
                      src={qrDonate.qrCode.url}
                      width={qrDonate.qrCode.width}
                      height={qrDonate.qrCode.height}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                      alt={`QR-код для перевода через ${qrDonate.name}`}
                    />

                    <p className="text-center mt-4">
                      Отсканируйте QR-код или{' '}
                      <a className="link" href={qrDonate.linkUrl} target="_blank" rel="noreferrer">
                        перейдите по ссылке
                      </a>
                    </p>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
