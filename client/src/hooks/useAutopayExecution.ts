/**
 * Hook for managing autopay execution and notification logic
 * Handles automatic transaction creation and reminder generation
 */

import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { calculateNextDueDate, generateId } from '@/lib/utils';
import type { AutoPay, Transaction } from '@/lib/types';

export function useAutopayExecution() {
  const { autoPays, addTransaction, addNotification, updateAutoPay } = useApp();

  // Check for due autopays and create notifications
  useEffect(() => {
    const checkAndExecuteAutopays = () => {
      const now = Date.now();

      autoPays.forEach((autoPay) => {
        if (!autoPay.isActive) return;

        // Check if payment is due (today or overdue)
        if (autoPay.nextDueDate <= now) {
          if (autoPay.isNonConstant) {
            // For non-constant bills, create a notification asking for confirmation
            const notificationId = generateId();
            addNotification({
              id: notificationId,
              type: 'autopay_nonconst',
              autoPayId: autoPay.id,
              accountId: autoPay.accountId,
              title: `Confirm: ${autoPay.name}`,
              message: autoPay.customNotificationMessage || `Please confirm the amount for ${autoPay.name}`,
              dueDate: autoPay.nextDueDate,
              isRead: false,
              isCompleted: false,
              createdAt: now,
            });
          } else {
            // For constant bills, automatically create transaction
            const transaction: Transaction = {
              id: generateId(),
              accountId: autoPay.accountId,
              type: 'expense',
              amount: autoPay.defaultAmount,
              category: autoPay.category,
              description: autoPay.name,
              date: now,
            };

            addTransaction(transaction);

            // Schedule next occurrence
            const nextDueDate = calculateNextDueDate(autoPay.nextDueDate, autoPay.frequency);
            updateAutoPay(autoPay.id, {
              nextDueDate,
              lastExecutedDate: now,
            });
          }
        }
      });
    };

    // Run check on mount and every minute
    checkAndExecuteAutopays();
    const interval = setInterval(checkAndExecuteAutopays, 60000);

    return () => clearInterval(interval);
  }, [autoPays, addTransaction, addNotification, updateAutoPay]);
}
