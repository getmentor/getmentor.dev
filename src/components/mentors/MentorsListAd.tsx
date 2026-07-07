import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons'

type YaContextCallback = () => void

interface YaAdvManager {
  render: (options: { blockId: string; renderTo: string }) => void
  destroy: (options: { blockId: string; renderTo: string }) => void
}

declare global {
  interface Window {
    yaContextCb?: Array<YaContextCallback>
    Ya?: {
      Context?: {
        AdvManager?: YaAdvManager
      }
    }
    getmentorAds?: {
      mentorsListBlockId?: string
    }
  }
}

const DEFAULT_SLOT_ID = 'mentors-list-ad-slot'
const BLOCK_DETECTION_TIMEOUT_MS = 3000

interface MentorsListAdProps {
  id?: string
  blockId?: string
  blockDetectionTimeoutMs?: number
}

function queueYaCallback(cb: YaContextCallback): void {
  if (typeof window === 'undefined') return
  window.yaContextCb = window.yaContextCb ?? []
  window.yaContextCb.push(cb)
}

function resolveBlockId(override?: string): string | undefined {
  if (override) return override
  if (typeof window === 'undefined') return undefined
  return window.getmentorAds?.mentorsListBlockId
}

export default function MentorsListAd({
  id = DEFAULT_SLOT_ID,
  blockId,
  blockDetectionTimeoutMs = BLOCK_DETECTION_TIMEOUT_MS,
}: MentorsListAdProps): JSX.Element {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    let cancelled = false

    queueYaCallback(() => {
      if (cancelled) return
      setIsBlocked(false)
      const resolvedBlockId = resolveBlockId(blockId)
      if (!resolvedBlockId) return
      const advManager = window.Ya?.Context?.AdvManager
      if (!advManager) return
      try {
        advManager.destroy({ blockId: resolvedBlockId, renderTo: id })
      } catch {
        // No existing block on first mount — expected.
      }
      advManager.render({ blockId: resolvedBlockId, renderTo: id })
    })

    const blockDetectionTimer = window.setTimeout(() => {
      if (cancelled) return
      if (!window.Ya?.Context?.AdvManager) {
        setIsBlocked(true)
      }
    }, blockDetectionTimeoutMs)

    return () => {
      cancelled = true
      window.clearTimeout(blockDetectionTimer)
      queueYaCallback(() => {
        const resolvedBlockId = resolveBlockId(blockId)
        if (!resolvedBlockId) return
        const advManager = window.Ya?.Context?.AdvManager
        if (!advManager) return
        try {
          advManager.destroy({ blockId: resolvedBlockId, renderTo: id })
        } catch {
          // Already gone — ignore.
        }
      })
    }
  }, [blockId, id, blockDetectionTimeoutMs])

  return (
    <div
      data-testid="mentors-list-ad"
      aria-label="Реклама"
      className="relative w-full h-[480px] sm:h-[420px] overflow-hidden bg-gray-100"
    >
      <div id={id} className="w-full h-full overflow-hidden" />
      {isBlocked && (
        <div
          data-testid="mentors-list-ad-fallback"
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 px-6 text-center"
        >
          <FontAwesomeIcon icon={faBan} size="2x" className="mb-3 text-gray-400" />
          <p className="text-sm leading-relaxed">
            Здесь должен был быть рекламный блок, но его заблокировали
          </p>
        </div>
      )}
    </div>
  )
}
