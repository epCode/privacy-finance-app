# Development Guide

This guide provides detailed instructions for developing, testing, and extending the Privacy Finance App.

## Development Environment Setup

### Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/epCode/privacy-finance-app.git
cd privacy-finance-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### IDE Setup

We recommend using Visual Studio Code with the following extensions:

- **ES7+ React/Redux/React-Native snippets**: dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense**: bradlc.vscode-tailwindcss
- **TypeScript Vue Plugin**: Vue.volartech.volar
- **Prettier - Code formatter**: esbenp.prettier-vscode

### Environment Variables

Create a `.env.local` file in the project root for local development settings:

```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

## Code Structure

### Pages (`client/src/pages/`)

Each page is a top-level route component. Pages should:

- Import and use the `useFinance()` hook for data access
- Manage local component state with `useState`
- Delegate data mutations to context functions
- Display loading and error states

Example structure:

```tsx
import { useFinance } from '@/contexts/FinanceContext';

export default function MyPage() {
  const { data, loading, error, addData } = useFinance();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* Page content */}
    </div>
  );
}
```

### Components (`client/src/components/`)

Reusable UI components should:

- Be small and focused on a single responsibility
- Accept props for customization
- Use shadcn/ui components as building blocks
- Include TypeScript interfaces for props

### Contexts (`client/src/contexts/`)

The `FinanceContext` provides centralized state management:

- **Data access**: Query and mutation functions
- **Loading states**: Track async operations
- **Error handling**: Centralized error management
- **Data persistence**: Automatic IndexedDB synchronization

To use the context in a component:

```tsx
import { useFinance } from '@/contexts/FinanceContext';

function MyComponent() {
  const { accounts, addAccount } = useFinance();
  // Use the context
}
```

### Database (`client/src/lib/db.ts`)

The database layer uses Dexie.js for IndexedDB access:

- **Tables**: Define data schemas with indexes
- **Queries**: Use Dexie's fluent API for querying
- **Transactions**: Atomic operations across multiple tables

Example query:

```tsx
const transactions = await db.transactions
  .where('accountId')
  .equals(accountId)
  .toArray();
```

### Utilities (`client/src/lib/`)

Helper functions for common operations:

- `scheduler.ts`: Recurring payment scheduling logic
- `db.ts`: Database schema and initialization
- Other utility functions as needed

## Working with Recurring Payments

### Understanding the Scheduling System

Recurring payments are processed based on their frequency and start date. The system supports:

- **Constant payments**: Automatically processed without user confirmation
- **Non-constant payments**: Require manual confirmation and custom notification messages

### Processing Payments

The `processRecurringPayment()` function:

1. Creates a transaction for the payment
2. Updates the account balance
3. Records the last processed date
4. Triggers notifications for non-constant payments

### Adding Payment Processing to the UI

To manually process a payment:

```tsx
const { processPayment } = useFinance();

// Process with default amount
await processPayment(paymentId);

// Process with custom amount (for non-constant payments)
await processPayment(paymentId, customAmount);
```

## Working with Transactions

### Creating Transactions

Transactions automatically update account balances:

```tsx
const { addTransaction } = useFinance();

await addTransaction({
  accountId: 'account-123',
  amount: 50.00,
  type: 'expense',
  category: 'Groceries',
  date: new Date(),
  note: 'Weekly shopping',
});
```

### Using Templates

Templates are pre-filled transaction data:

1. Create a template with default values
2. Load the template in the transaction form
3. Allow users to edit before confirming

## Working with Budgets

### Budget Calculation

Budgets are calculated based on the current period (month or year):

```tsx
const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(new Date());

const spending = transactions
  .filter(t => 
    t.type === 'expense' &&
    t.category === 'Groceries' &&
    t.date >= monthStart &&
    t.date <= monthEnd
  )
  .reduce((sum, t) => sum + t.amount, 0);
```

### Budget Alerts

Budgets display warnings when spending exceeds the limit. Customize alert behavior in the Budgets page component.

## Testing

### Manual Testing Workflow

1. **Create test accounts**: Set up checking, savings, and credit card accounts
2. **Add test transactions**: Record various income and expense transactions
3. **Create templates**: Set up templates for common transactions
4. **Configure recurring payments**: Test both constant and non-constant payments
5. **Set budgets**: Create budgets and verify tracking
6. **Test offline**: Disconnect internet and verify functionality
7. **Verify persistence**: Close and reopen the app to check data integrity

### Debugging

Enable the Electron DevTools:

```bash
pnpm dev:electron
```

Then press `F12` in the Electron window to open the developer console.

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Data not persisting | Check IndexedDB in DevTools → Application → IndexedDB |
| Transactions not appearing | Verify account is selected; check browser console for errors |
| Recurring payments not processing | Check `lastProcessed` date in database; verify frequency calculation |
| Styles not applying | Clear Tailwind cache: `rm -rf node_modules/.vite` |

## Building and Packaging

### Development Build

Create an unoptimized build for testing:

```bash
pnpm build
```

### Production Build with Electron

Package the application for distribution:

```bash
pnpm build:electron
```

This creates platform-specific installers in the `dist/` directory.

### Signing and Notarization (macOS)

For macOS distribution, sign and notarize the app:

1. Set up code signing certificates in Keychain
2. Configure `electron-builder` with signing credentials
3. Run: `pnpm build:electron:mac`

See [electron-builder documentation](https://www.electron.build/code-signing) for details.

## Performance Optimization

### Database Queries

Optimize Dexie queries with proper indexing:

```tsx
// Good: Uses index
const transactions = await db.transactions
  .where('accountId')
  .equals(accountId)
  .toArray();

// Avoid: Full table scan
const transactions = await db.transactions
  .toArray()
  .then(all => all.filter(t => t.accountId === accountId));
```

### React Performance

Use React DevTools Profiler to identify slow renders:

1. Open DevTools in Electron
2. Go to Profiler tab
3. Record interactions and analyze flame graphs

### Bundle Size

Check bundle size with:

```bash
pnpm build
# Analyze dist/ directory
```

## Adding New Features

### Feature Checklist

1. **Design**: Plan the data model and UI
2. **Database**: Add tables and indexes to `db.ts`
3. **Context**: Add data operations to `FinanceContext.tsx`
4. **UI**: Create pages and components
5. **Testing**: Manually test all workflows
6. **Documentation**: Update README and this guide

### Example: Adding a New Feature

Let's add an "Expense Categories" feature:

1. **Define the data model** in `db.ts`:

```tsx
export interface ExpenseCategory {
  id?: string;
  name: string;
  color: string;
  createdAt: Date;
}
```

2. **Add to database schema**:

```tsx
expenseCategories!: Table<ExpenseCategory>;

// In version() method:
this.version(2).stores({
  // ... existing tables
  expenseCategories: '++id, name, createdAt',
});
```

3. **Add context operations** in `FinanceContext.tsx`:

```tsx
const [categories, setCategories] = useState<ExpenseCategory[]>([]);

const loadCategories = useCallback(async () => {
  const data = await db.expenseCategories.toArray();
  setCategories(data);
}, []);

const addCategory = useCallback(async (category: Omit<ExpenseCategory, 'id' | 'createdAt'>) => {
  await db.expenseCategories.add({
    ...category,
    createdAt: new Date(),
  });
  await loadCategories();
}, [loadCategories]);

// Add to context value
```

4. **Create UI component** in `pages/Categories.tsx`:

```tsx
export default function Categories() {
  const { categories, addCategory } = useFinance();
  // Implement UI
}
```

5. **Add route** in `App.tsx`:

```tsx
<Route path="/categories" component={Categories} />
```

## Git Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Messages

Use conventional commits:

```
feat: Add expense categories feature
fix: Correct recurring payment calculation
docs: Update development guide
style: Format code with Prettier
refactor: Simplify transaction filtering
test: Add budget calculation tests
```

### Pull Requests

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make commits with clear messages
3. Push to GitHub: `git push origin feature/my-feature`
4. Open a pull request with a description
5. Address review comments
6. Merge when approved

## Deployment

### GitHub Actions

The project includes a GitHub Actions workflow that:

- Builds for Windows, macOS, and Linux
- Builds Android APK
- Uploads artifacts
- Creates releases for tags

### Manual Deployment

To manually build and distribute:

1. Build for all platforms: `pnpm build:electron`
2. Sign and notarize (if needed)
3. Upload to distribution channels
4. Create GitHub release with artifacts

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Dexie.js Documentation](https://dexie.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For questions or issues during development, please open an issue on GitHub or contact the maintainers.
