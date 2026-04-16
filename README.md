# Personal Finance Tracker

A privacy-focused, offline-capable personal finance web application that runs entirely in your browser using local storage. Track spending, manage recurring bills, and maintain accurate financial records without any data leaving your device.

## Features

### Core Functionality

**Accounts Management** — Create and manage multiple bank accounts with different types (checking, savings, credit, investment). Track balances across all accounts with real-time calculations based on your transactions.

**Transaction Tracking** — Record one-time income and expense transactions with detailed categorization. Transactions are organized by account and date, with full history available for review and analysis.

**Scheduled Payments (AutoPay)** — Set up recurring bills and payments with flexible scheduling (daily, weekly, bi-weekly, monthly, quarterly, yearly). Choose between constant bills that execute automatically or non-constant bills that require manual confirmation.

**Non-Constant Bills** — For variable expenses like utilities, enable the non-constant flag to receive notifications when bills are due. Confirm the actual amount before the transaction is recorded, ensuring accuracy against your real bank statements. Add custom reminder messages for context.

**Transaction Templates** — Create reusable transaction patterns for quick entry. Save common transactions like "Weekly Groceries" or "Monthly Rent" and apply them with a single click to instantly create transactions.

**Dashboard Overview** — View your total balance, monthly income and expenses at a glance. See upcoming bills for the next 7 days with alerts for non-constant bills requiring action.

**Data Management** — Export your complete financial data as a JSON backup file. Import previously exported backups to restore your data. All data is stored locally in your browser with no cloud synchronization.

## Privacy & Security

All data is stored exclusively in your browser's local storage. No information is transmitted to external servers, ensuring complete privacy and control over your financial data. The application works entirely offline—no internet connection required after initial load.

## Getting Started

### Creating Your First Account

Navigate to the **Accounts** section and click "New Account". Provide an account name, select the type (checking, savings, etc.), enter the initial balance, and choose your currency. Your account is now ready to track transactions.

### Adding Transactions

Go to **Transactions** and click "New Transaction". Select the account, transaction type (income or expense), amount, category, and date. Optionally add a description for context. Transactions are immediately reflected in your account balance.

### Setting Up Recurring Bills

Visit **Scheduled Payments** and click "New Payment". Enter the payment name, default amount, frequency, and category. For variable bills, enable "Amount varies (non-constant)" and optionally add a custom reminder message. The system will notify you when bills are due.

### Using Templates

Create templates in the **Templates** section for frequently repeated transactions. Templates save the transaction type, amount, category, and description. When you need to record the transaction, click "Use Template" to instantly create it.

### Monitoring Your Finances

The **Dashboard** provides an at-a-glance view of your financial status. Monitor your total balance across all accounts, track monthly income and expenses, and review upcoming bills. Non-constant bills due soon are highlighted with action alerts.

## Data Management

### Exporting Your Data

Visit **Settings** and click "Export Backup". Your complete financial data will be downloaded as a JSON file with the current date in the filename. Keep this file safe for backup purposes.

### Importing Data

To restore from a backup, go to **Settings**, click "Import Backup", and select your previously exported JSON file. The application will restore all your accounts, transactions, bills, and templates.

### Clearing Data

The "Clear All Data" option in Settings permanently deletes all your financial records. Use this only when you want to start fresh. This action cannot be undone.

## Design Philosophy

The application follows a **Minimalist Functional** design approach emphasizing clarity and efficiency. The interface uses an off-white background with charcoal text for comfortable reading, a teal accent color for important actions, and a clean sidebar navigation. All financial amounts are displayed in monospace font for easy scanning and comparison.

## Technical Details

**Technology Stack** — Built with React 19, TypeScript, Tailwind CSS 4, and shadcn/ui components. Uses Wouter for lightweight client-side routing.

**Storage** — All data persists in browser localStorage with automatic serialization and deserialization. Data survives browser restarts and remains available offline.

**Offline Capability** — The application is fully functional without internet connectivity. All features work offline, and data is never transmitted to external services.

**Browser Compatibility** — Works on all modern browsers supporting ES2020 and localStorage (Chrome, Firefox, Safari, Edge).

## Keyboard Navigation

The application supports keyboard-first navigation. Use Tab to move between form fields and buttons, Enter to submit forms or activate buttons, and Escape to close dialogs.

## Tips for Effective Use

**Regular Reconciliation** — For non-constant bills, compare the amounts you confirm in the app with your actual bank statements to maintain accuracy.

**Template Organization** — Create templates for your most frequent transactions to speed up data entry and reduce errors.

**Monthly Reviews** — Check the Dashboard monthly to review your income, expenses, and upcoming bills. This helps identify spending patterns and budget adjustments.

**Backup Regularly** — Export your data regularly, especially before making major changes or after significant transactions.

**Category Consistency** — Use consistent category names across transactions to make analysis and filtering more meaningful.

## Limitations & Considerations

The application stores data in browser localStorage, which has typical browser storage limits (usually 5-10MB per domain). For most personal finance use cases, this is more than sufficient. However, if you accumulate many years of transaction history, consider archiving old data by exporting and clearing periodically.

Data is tied to your browser profile. If you clear browser data or use a different browser, your financial records will not be available. Always maintain regular backups.

## Support & Feedback

This is a privacy-first personal project designed for individual use. For feature requests or bug reports, review the application code or consider contributing improvements.

## License

This application is provided as-is for personal use.

---

**Remember:** All your financial data stays on your device. No tracking, no cloud storage, no third parties. Your privacy is protected.
