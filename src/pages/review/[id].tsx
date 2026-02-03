/**
 * Review Page
 *
 * Allows mentees to submit feedback about their mentorship session.
 */

import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

interface ReviewFormData {
  review: string
}

export default function ReviewPage(): JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReviewFormData>({
    review: '',
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!id) {
      setError('Некорректная ссылка')
      return
    }

    if (!formData.review.trim()) {
      setError('Пожалуйста, напишите отзыв')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: id,
          review: formData.review,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось отправить отзыв')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setFormData({
      review: e.target.value,
    })
  }

  return (
    <>
      <Head>
        <title>Оставить отзыв — getmentor.dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <a href="https://getmentor.dev" className="inline-block">
              <h1 className="text-3xl font-bold text-[#1A2238]">GetMentor.dev</h1>
            </a>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Спасибо за отзыв!</h2>
              <p className="text-gray-600 mb-6">
                Ваш отзыв очень важен для нас. Он помогает менторам становиться лучше и позволяет
                нам улучшать сервис.
              </p>
              <a
                href="https://getmentor.dev"
                className="inline-block px-6 py-3 bg-[#1A2238] text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Вернуться на главную
              </a>
            </div>
          ) : (
            /* Form State */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Как прошла встреча с ментором?
              </h2>
              <p className="text-gray-600 mb-6">
                Мы рады, что вы воспользовались нашим сервисом. Пожалуйста, расскажите, как прошла
                встреча — ваша обратная связь очень важна для нас и для ментора.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваш отзыв <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review"
                    name="review"
                    rows={8}
                    value={formData.review}
                    onChange={handleChange}
                    placeholder="Расскажите, как прошла встреча: что вам понравилось, что было полезно, что можно улучшить..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-[#1A2238] text-white font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить отзыв'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Если у вас возникли проблемы, напишите нам:{' '}
                  <a
                    href="mailto:hello@getmentor.dev"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    hello@getmentor.dev
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
