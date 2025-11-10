type ModalType = "levelUp" | "gameOver" | "victory" | "itemFound" | "achievement"

interface QueuedModal {
  id: string
  type: ModalType
  data: any
  priority: number
}

class ModalQueue {
  private queue: QueuedModal[] = []
  private currentModal: QueuedModal | null = null
  private listeners: Array<(modal: QueuedModal | null) => void> = []

  enqueue(type: ModalType, data: any, priority = 0) {
    const modal: QueuedModal = {
      id: Date.now().toString() + Math.random(),
      type,
      data,
      priority,
    }

    this.queue.push(modal)
    this.queue.sort((a, b) => b.priority - a.priority) // Higher priority first

    if (!this.currentModal) {
      this.showNext()
    }
  }

  private showNext() {
    if (this.queue.length === 0) {
      this.currentModal = null
      this.notifyListeners()
      return
    }

    this.currentModal = this.queue.shift()!
    this.notifyListeners()
  }

  dismiss() {
    this.showNext()
  }

  getCurrent(): QueuedModal | null {
    return this.currentModal
  }

  subscribe(callback: (modal: QueuedModal | null) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentModal))
  }

  clear() {
    this.queue = []
    this.currentModal = null
    this.notifyListeners()
  }
}

export const modalQueue = new ModalQueue()
export type { ModalType, QueuedModal }
