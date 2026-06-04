import { useEffect } from 'react'

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
  }
}

const DEFAULT_BLOCK_ID = 'R-A-19309570-2'
const DEFAULT_SLOT_ID = 'mentors-list-ad-slot'

interface MentorsListAdProps {
  id?: string
  blockId?: string
}

function queueYaCallback(cb: YaContextCallback): void {
  if (typeof window === 'undefined') return
  window.yaContextCb = window.yaContextCb ?? []
  window.yaContextCb.push(cb)
}

export default function MentorsListAd({
  id = DEFAULT_SLOT_ID,
  blockId = DEFAULT_BLOCK_ID,
}: MentorsListAdProps): JSX.Element {
  useEffect(() => {
    queueYaCallback(() => {
      const advManager = window.Ya?.Context?.AdvManager
      if (!advManager) return
      try {
        advManager.destroy({ blockId, renderTo: id })
      } catch {
        // No existing block on first mount — expected.
      }
      advManager.render({ blockId, renderTo: id })
    })

    return () => {
      queueYaCallback(() => {
        const advManager = window.Ya?.Context?.AdvManager
        if (!advManager) return
        try {
          advManager.destroy({ blockId, renderTo: id })
        } catch {
          // Already gone — ignore.
        }
      })
    }
  }, [blockId, id])

  return (
    <div
      data-testid="mentors-list-ad"
      aria-label="Реклама"
      className="w-full h-[480px] sm:h-[420px] overflow-hidden bg-gray-100"
    >
      <div id={id} className="w-full h-full overflow-hidden" />
    </div>
  )
}
