'use client'

import { useDesktopStore } from '@/stores/desktop-store'
import { Window } from './Window'

export function WindowManager() {
  const { openWindows } = useDesktopStore()

  return (
    <>
      {openWindows
        .filter(w => !w.minimized)
        .map(win => (
          <Window key={win.id} window={win} />
        ))}
    </>
  )
}
