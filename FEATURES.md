# Features Documentation

This document provides a comprehensive overview of all features in the Privacy Finance App.

## Dashboard

The Dashboard provides a comprehensive overview of your financial status at a glance.

**Key Metrics**: Display total balance across all accounts, monthly income, monthly expenses, and net monthly cash flow. These metrics update automatically as transactions are added or modified.

**Account Overview**: Quick view of all your accounts with current balances and account types. Click on an account to select it for transaction filtering.

**Recent Transactions**: Shows the five most recent transactions with date, category, and amount. Provides quick access to your latest financial activity.

**Recurring Payments**: Lists your scheduled recurring payments with frequency and default amounts. Helps you stay aware of upcoming obligations.

**Notifications**: Displays pending actions requiring your attention, such as non-constant recurring payments that need manual confirmation.

## Accounts

The Accounts page allows you to manage multiple financial accounts.

**Account Types**: Supported account types include Checking, Savings, Credit Card, Investment, and Cash. Each type can be customized with a name and starting balance.

**Balance Tracking**: Account balances update automatically when transactions are added, edited, or deleted. Balances are calculated in real-time based on all transactions.

**Account Selection**: Click on an account to select it. Selected accounts are highlighted with a blue ring and used as the default for new transactions.

**Account Management**: Edit account details or delete accounts. Deleting an account also removes all associated transactions and recurring payments.

**Multi-Currency Support**: Each account can have its own currency (USD, EUR, GBP, etc.). Currencies are displayed alongside balances.

## Transactions

The Transactions page is where you record all income and expense transactions.

**Transaction Types**: Record both income (deposits, salary) and expense (purchases, bills) transactions.

**Categorization**: Assign each transaction to a category for better organization and budget tracking. Categories are free-form text fields.

**Transaction Details**: Include the date, amount, category, and optional notes for each transaction.

**Transaction History**: View all transactions sorted by date (newest first). Filter by account to see transactions for a specific account.

**Transaction Editing**: Edit any transaction to correct amounts, dates, or categories. Balance updates are recalculated automatically.

**Transaction Deletion**: Remove transactions and have the account balance automatically adjusted.

**Template Integration**: Use the "Use Template" button to quickly create transactions from saved templates. Templates pre-fill category, amount, and notes.

## Templates

Transaction Templates allow you to quickly create recurring types of transactions without re-entering the same information.

**Template Creation**: Create templates with a name, category, default amount, and optional notes.

**Template Usage**: In the Transactions page, click "Use Template" to select a template. The transaction form will be pre-filled with template data, which you can edit before confirming.

**Template Management**: Edit or delete templates as needed. Deleting a template does not affect existing transactions.

**Common Use Cases**: Templates are ideal for frequent transactions like:
- Weekly grocery shopping
- Monthly utility bills
- Regular salary deposits
- Subscription services

## Recurring Payments

Recurring Payments automate the process of recording regular, scheduled payments.

**Payment Frequency**: Supported frequencies include Daily, Weekly, Bi-weekly, Monthly, Quarterly, and Yearly.

**Constant vs. Non-Constant**: 

- **Constant Payments**: Automatically processed on their due date without user confirmation. Ideal for bills with fixed amounts.
- **Non-Constant Payments**: Require manual confirmation when due. Perfect for bills that vary month to month (utilities, phone bills).

**Custom Notifications**: For non-constant payments, set a custom notification message to remind you to verify the actual amount. For example: "Check your electric bill and confirm the amount."

**Scheduling**: Set a specific start date and time for recurring payments. Optionally set an end date to stop the payment after a certain date.

**Payment Processing**: 

- Constant payments are automatically processed at their due date
- Non-constant payments trigger a notification asking you to confirm the amount
- Manual processing is available for all payments through the UI

**Payment History**: Each payment creates a transaction in your account, maintaining a complete history of all payments.

## Budgets

Budgets help you track spending against limits and identify areas where you might be overspending.

**Budget Creation**: Define a spending limit for a specific category on a monthly or yearly basis.

**Spending Tracking**: The app automatically calculates spending in each budget category for the current period and compares it against the limit.

**Visual Indicators**: Progress bars show spending as a percentage of the budget limit. The bar changes color to red when spending exceeds the limit.

**Overspend Alerts**: When spending exceeds a budget limit, a warning message displays the amount over budget.

**Budget Management**: Edit budget limits or delete budgets as needed. Changing a budget limit immediately updates the spending calculation.

**Multiple Budgets**: Create separate budgets for different categories to manage spending across multiple areas of your finances.

## Notifications

The notification system keeps you informed of important financial events and actions requiring your attention.

**Notification Types**:

- **Recurring Payment Reminders**: Non-constant recurring payments trigger notifications when due
- **Custom Messages**: Non-constant payments can include custom notification messages
- **Overspend Alerts**: Budgets generate notifications when limits are exceeded

**Notification Management**: Notifications appear in the Dashboard and can be marked as read. Unread notifications are highlighted for visibility.

**Persistent Storage**: Notifications are stored locally and persist across app sessions.

## Offline Functionality

The entire application is designed to work offline without any internet connection.

**Local Storage**: All data is stored in IndexedDB on your device. No data is sent to external servers.

**No Sync Required**: Changes are immediately saved to your local database without requiring internet connectivity.

**Offline-First Architecture**: The app functions identically whether online or offline. No features are disabled when offline.

**Data Privacy**: Your financial data never leaves your device. All processing happens locally on your computer or mobile device.

## Data Management

**Data Persistence**: All data is automatically saved to IndexedDB. Changes are persisted immediately and survive app restarts.

**Data Export**: (Future feature) Export your financial data in CSV or JSON format for backup or analysis in other tools.

**Data Import**: (Future feature) Import previously exported data to restore or migrate your financial records.

**Backup Recommendations**: Regularly back up your device to ensure your financial data is protected.

## Cross-Platform Support

**Desktop**: Available for Windows, macOS, and Linux through Electron. Native installers and portable executables are provided.

**Mobile**: Android support through Capacitor allows the app to run on mobile devices with the same offline-first architecture.

**Web**: The underlying React application can be deployed as a web app, though the desktop and mobile versions are recommended for better integration with your device.

## Security and Privacy

**No External Connections**: The app does not connect to external services or APIs. All processing is local.

**No Authentication Required**: You don't need to create an account or log in. Your data is yours alone.

**Encrypted Storage**: Data is stored in IndexedDB with your browser's built-in security mechanisms.

**No Telemetry**: The app does not collect usage data, analytics, or any information about your financial activity.

## Accessibility

**Keyboard Navigation**: All features are accessible via keyboard. Use Tab to navigate and Enter to confirm actions.

**Screen Reader Support**: The app uses semantic HTML and ARIA labels for screen reader compatibility.

**Color Contrast**: The interface maintains sufficient color contrast for readability.

**Responsive Design**: The app works on devices of all sizes, from small phones to large desktop monitors.

## Performance

**Fast Load Times**: The app loads quickly even on slower devices or connections.

**Efficient Queries**: Database queries are optimized with proper indexing for fast data retrieval.

**Low Memory Usage**: The app uses minimal memory and doesn't slow down your device.

**Smooth Animations**: Transitions and animations are smooth and responsive.

## Future Features

Planned enhancements for future releases include:

- Advanced reporting and analytics
- Data export/import in multiple formats
- Multi-currency conversion
- Cloud backup and sync (optional, encrypted)
- Bill splitting and expense sharing
- Receipt attachment and OCR
- Mobile app refinements
- Dark mode theme
- Custom categories and tags
- Transaction search and advanced filtering
- Webhook integration for automatic payment processing
- Investment tracking and portfolio management
