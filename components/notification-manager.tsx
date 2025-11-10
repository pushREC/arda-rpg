"use client"

import * as React from "react"
import { FloatingNotification, type NotificationType } from "./floating-notification"

const MAX_SIMULTANEOUS_NOTIFICATIONS = 5

interface NotificationItem {
  id: string
  type: NotificationType
  value: number | string
}

interface NotificationManagerProps {
  children?: React.ReactNode
}

export const NotificationContext = React.createContext<{
  addNotification: (type: NotificationType, value: number | string) => void
}>({
  addNotification: () => {},
})

export function NotificationManager({ children }: NotificationManagerProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  const addNotification = React.useCallback((type: NotificationType, value: number | string) => {
    const id = Date.now().toString() + Math.random()

    setNotifications((prev) => {
      // Limit to MAX_SIMULTANEOUS_NOTIFICATIONS
      const newNotifications = [...prev, { id, type, value }]
      if (newNotifications.length > MAX_SIMULTANEOUS_NOTIFICATIONS) {
        return newNotifications.slice(-MAX_SIMULTANEOUS_NOTIFICATIONS)
      }
      return newNotifications
    })
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <FloatingNotification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            value={notification.value}
            onComplete={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationManager")
  }
  return context
}
