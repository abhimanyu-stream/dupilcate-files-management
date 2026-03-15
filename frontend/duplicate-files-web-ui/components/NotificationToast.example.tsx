/**
 * Example usage of NotificationToast and NotificationContainer components
 * This file demonstrates how to integrate notifications into the application
 */

import React, { useState } from 'react';
import { Notification, createSuccessNotification, createErrorNotification, createInfoNotification } from '@/types';
import NotificationContainer from './NotificationContainer';

export default function NotificationExample() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a notification to the stack
  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  // Remove a notification by ID
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Handle retry action for error notifications
  const handleRetry = (notification: Notification) => {
    console.log('Retrying operation for:', notification.message);
    // Implement retry logic here
    // Call the retry action if it exists
    if (notification.retryAction) {
      notification.retryAction();
    }
  };

  // Example: Show success notification
  const showSuccess = () => {
    addNotification(createSuccessNotification('File deleted successfully!'));
  };

  // Example: Show error notification with retry
  const showError = () => {
    addNotification(
      createErrorNotification(
        'Failed to delete file. Please try again.',
        () => {
          console.log('Retry action triggered');
          // Implement your retry logic here
        }
      )
    );
  };

  // Example: Show info notification
  const showInfo = () => {
    addNotification(createInfoNotification('Processing 5 files...'));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Notification Examples</h1>
      
      <div className="flex gap-4">
        <button
          onClick={showSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Show Success
        </button>
        
        <button
          onClick={showError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Show Error
        </button>
        
        <button
          onClick={showInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Info
        </button>
      </div>

      {/* Notification Container - Place at root level of your app */}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

/**
 * Integration Guide:
 * 
 * 1. Add NotificationContainer to your main page/layout:
 * 
 *    <NotificationContainer
 *      notifications={notifications}
 *      onDismiss={dismissNotification}
 *    />
 * 
 * 2. Manage notifications state in your page component:
 * 
 *    const [notifications, setNotifications] = useState<Notification[]>([]);
 * 
 * 3. Add notifications using helper functions:
 * 
 *    // Success (auto-dismisses after 3 seconds)
 *    setNotifications(prev => [...prev, createSuccessNotification('Operation successful!')]);
 * 
 *    // Error with retry action
 *    setNotifications(prev => [...prev, createErrorNotification(
 *      'Operation failed',
 *      () => retryOperation() // Optional retry callback
 *    )]);
 * 
 *    // Info (manual dismiss only)
 *    setNotifications(prev => [...prev, createInfoNotification('Processing...')]);
 * 
 * 4. Implement dismiss handler:
 * 
 *    const dismissNotification = (id: string) => {
 *      setNotifications(prev => prev.filter(n => n.id !== id));
 *    };
 */
