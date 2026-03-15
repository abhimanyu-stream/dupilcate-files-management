/**
 * NotificationContainer Component
 * Manages and displays a stack of notification toasts
 * Validates Requirements: 7.5, 8.2, 8.3, 8.5
 */

import React, { useEffect } from 'react';
import { Notification } from '@/types';

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

/**
 * Individual notification toast component
 */
function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const { id, type, message, retryAction } = notification;

  // Auto-dismiss success notifications after 3 seconds
  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [id, type, onDismiss]);

  const handleDismiss = () => {
    onDismiss(id);
  };

  const handleRetry = () => {
    if (retryAction) {
      retryAction();
    }
    onDismiss(id);
  };

  // Get notification styling based on type
  const getNotificationStyles = () => {
    const baseStyles = 'border-l-4 p-4 shadow-lg';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-white dark:bg-black border-black dark:border-white`;
      case 'error':
        return `${baseStyles} bg-white dark:bg-black border-gray-800 dark:border-gray-200`;
      case 'info':
        return `${baseStyles} bg-white dark:bg-black border-gray-500 dark:border-gray-500`;
      default:
        return `${baseStyles} bg-white dark:bg-black border-gray-400 dark:border-gray-600`;
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className="w-5 h-5 text-black dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-gray-800 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get text color based on notification type
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-black dark:text-white';
      case 'error':
        return 'text-gray-900 dark:text-gray-100';
      case 'info':
        return 'text-gray-800 dark:text-gray-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`${getNotificationStyles()} flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      data-notification-id={id}
      data-notification-type={type}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium uppercase tracking-wider ${getTextColor()}`}>
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Retry Button - Only for error notifications with retry action */}
        {type === 'error' && retryAction && (
          <button
            onClick={handleRetry}
            className="text-xs font-medium uppercase tracking-wider text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:underline"
            aria-label="Retry failed operation"
          >
            Retry
          </button>
        )}

        {/* Dismiss Button - Always available */}
        <button
          onClick={handleDismiss}
          className={`text-gray-500 hover:text-black dark:hover:text-white focus:outline-none`}
          aria-label="Dismiss notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * NotificationContainer component manages multiple notification toasts
 * - Displays notifications in a fixed position (top-right corner)
 * - Stacks multiple notifications vertically
 * - Passes dismiss handler to individual toasts
 */
export default function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}
