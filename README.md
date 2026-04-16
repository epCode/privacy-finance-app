# Privacy Finance App

A privacy-focused, offline-first personal finance application built with Electron, React, and TypeScript. All your financial data is stored locally on your device—nothing is sent to external servers.

## Features

**Account Management**: Create and manage multiple accounts (checking, savings, credit cards, investments, cash) with real-time balance tracking.

**Transaction Tracking**: Record income and expenses with detailed categorization, notes, and timestamps. Full transaction history is maintained locally.

**Transaction Templates**: Create reusable transaction templates to quickly record recurring types of transactions. Use templates to pre-fill transaction forms for faster data entry.

**Recurring Payments**: Set up automatic or manual recurring payments with flexible scheduling (daily, weekly, bi-weekly, monthly, quarterly, yearly). Configure "non-constant" payments that require manual confirmation when the bill amount varies month to month.

**Custom Notifications**: For non-constant recurring payments, set custom notification messages to remind you to verify and update the actual amount before processing.

**Budgeting**: Define spending limits by category on a monthly or yearly basis. Track spending against budgets with visual progress indicators and overspend alerts.

**Dashboard**: Get an at-a-glance overview of your financial status, including total balance, monthly income/expenses, recent transactions, and upcoming payments.

**Offline-First**: The entire application runs locally with Dexie.js (IndexedDB). No internet connection required. All data is stored in your browser's local database.

**Cross-Platform**: Available for Windows, macOS, Linux, and Android through Electron and Capacitor.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Desktop**: Electron 41
- **Local Storage**: Dexie.js (IndexedDB wrapper)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: React Context + Hooks
- **Scheduling**: node-schedule for recurring payment processing
- **Date Handling**: date-fns
- **Mobile**: Capacitor (for Android builds)

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- Node.js 18 or higher
- pnpm 10.4.1 or higher (package manager)

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/privacy-finance-app.git
cd privacy-finance-app
pnpm install
```

## Running the Application

### Development Mode (Web)

Start the development server with hot module reloading:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Development Mode (Electron)

Run the Electron application in development mode:

```bash
pnpm dev:electron
```

This will start both the Vite development server and the Electron application window. Changes to the code will trigger hot reloads.

### Production Build

Build the application for production:

```bash
pnpm build
```

This creates an optimized build in the `dist/` directory.

## Building for Desktop

### Build for All Platforms

To build Electron packages for your current platform:

```bash
pnpm build:electron
```

### Platform-Specific Builds

Build for Linux:

```bash
pnpm build:electron:linux
```

Build for Windows:

```bash
pnpm build:electron:windows
```

Build for macOS:

```bash
pnpm build:electron:mac
```

The built applications will be available in the `dist/` directory with platform-specific installers and portable executables.

## Building for Android

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Android SDK
- Android Studio (optional but recommended)

### Build Steps

1. Build the web application:

```bash
pnpm build
```

2. Initialize Capacitor (if not already done):

```bash
pnpm add -D @capacitor/core @capacitor/cli @capacitor/android
npx cap init --web-dir dist --app-name "Privacy Finance" --app-id "com.privacyfinance.app"
```

3. Add Android platform:

```bash
npx cap add android
npx cap sync
```

4. Build the Android APK:

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.

## Testing

### Type Checking

Verify TypeScript types without building:

```bash
pnpm check
```

### Running Tests

The project is configured with Vitest. To run tests:

```bash
pnpm test
```

### Manual Testing Checklist

- **Accounts**: Create, edit, and delete accounts. Verify balance updates.
- **Transactions**: Add income and expense transactions. Verify balance changes.
- **Templates**: Create templates and use them to pre-fill transactions.
- **Recurring Payments**: Set up constant and non-constant recurring payments. Verify notifications.
- **Budgets**: Create budgets and verify spending tracking and alerts.
- **Offline**: Disconnect from the internet and verify the app continues to function.
- **Data Persistence**: Close and reopen the app to verify data is persisted.

## Editing and Customization

### Project Structure

```
privacy-finance-app/
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (FinanceContext)
│   │   ├── lib/             # Utility functions (db.ts, scheduler.ts)
│   │   ├── App.tsx          # Main app component with routing
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles and Tailwind config
│   ├── public/              # Static assets (favicon, robots.txt)
│   └── index.html           # HTML template
├── electron/
│   ├── main.ts              # Electron main process
│   └── preload.ts           # Electron preload script for IPC
├── .github/
│   └── workflows/
│       └── build.yml        # GitHub Actions CI/CD workflow
├── package.json             # Project configuration and scripts
└── tsconfig.json            # TypeScript configuration
```

### Adding New Pages

1. Create a new file in `client/src/pages/` (e.g., `MyNewPage.tsx`)
2. Implement the page component using React hooks and the `useFinance()` context
3. Add a route in `client/src/App.tsx` under the `Router` function
4. Add a navigation link in the `Sidebar` component

### Adding New Features to the Database

1. Define the interface in `client/src/lib/db.ts`
2. Add a table to the `FinanceDB` class with appropriate indexes
3. Add CRUD operations to `client/src/contexts/FinanceContext.tsx`
4. Create UI components to interact with the new feature

### Styling

The application uses Tailwind CSS 4 with custom design tokens defined in `client/src/index.css`. Modify the CSS variables to change the color scheme and spacing system globally. Use shadcn/ui components for consistent, accessible UI elements.

### Modifying Recurring Payment Logic

The scheduling logic is in `client/src/lib/scheduler.ts`. Key functions include:

- `getNextDueDate()`: Calculate when a payment is next due
- `isPaymentDue()`: Check if a payment is due today
- `processRecurringPayment()`: Process a payment and update the account balance
- `getPaymentsDueToday()`: Get all payments due today
- `getUpcomingPayments()`: Get payments due in the next N days

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds the application for Windows, macOS, Linux, and Android on every push and pull request.

### Workflow Features

- **Multi-platform builds**: Automatically builds for Windows, macOS, and Linux
- **Android builds**: Compiles APK for Android devices
- **Artifact storage**: Build artifacts are uploaded and available for download
- **Release automation**: Tags pushed to the repository trigger automatic releases with built artifacts

### Setting Up CI/CD

1. Push the repository to GitHub
2. The workflow will automatically trigger on pushes to `main` or `develop` branches
3. Create a git tag to trigger a release: `git tag v1.0.0 && git push origin v1.0.0`
4. Built artifacts will be automatically uploaded to the GitHub Release

## Data Storage and Privacy

All financial data is stored locally using Dexie.js (IndexedDB). The application does not:

- Send data to external servers
- Require an internet connection
- Collect or track user behavior
- Store credentials or sensitive information in the cloud

Your data remains entirely on your device. If you want to back up your data, export your browser's IndexedDB database or use your operating system's file backup tools.

## Troubleshooting

### Application won't start

- Ensure Node.js 18+ is installed: `node --version`
- Clear the node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Try clearing the Electron cache: `rm -rf ~/.config/Privacy\ Finance` (Linux/macOS) or `%APPDATA%\Privacy Finance` (Windows)

### Transactions not appearing

- Verify you've selected an account before adding transactions
- Check the browser console for errors: Press `F12` in the Electron window
- Ensure IndexedDB is enabled in your browser settings

### Build fails on Windows

- Install Visual Studio Build Tools or Visual Studio Community with C++ support
- Ensure you're using PowerShell or Command Prompt as Administrator

### Android build fails

- Verify Java 17+ is installed: `java -version`
- Update Android SDK: `sdkmanager --update`
- Clear Gradle cache: `cd android && ./gradlew clean`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the maintainers.

## Roadmap

Future enhancements planned for the application include:

- Data export/import in CSV and JSON formats
- Advanced reporting and analytics
- Multi-currency support
- Recurring payment automation with webhook integration
- Cloud backup and sync (optional, encrypted)
- Mobile app refinements
- Dark mode theme
- Custom categories and tags
- Transaction search and filtering
- Bill splitting and expense sharing features

## Acknowledgments

This application is built with open-source technologies including Electron, React, Tailwind CSS, Dexie.js, and many other excellent libraries. Thank you to all the maintainers and contributors of these projects.
