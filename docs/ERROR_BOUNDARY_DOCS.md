# ErrorBoundary Implementation

This project includes a comprehensive ErrorBoundary implementation that helps catch and handle JavaScript errors in React components gracefully.

## Components

### 1. ErrorBoundary
- **Location**: `src/client/components/ErrorBoundary.tsx`
- **Purpose**: Main error boundary component that catches JavaScript errors in any child component tree
- **Features**:
  - Displays a user-friendly error page when errors occur
  - Shows detailed error information in development mode
  - Provides "Try Again" and "Reload Page" buttons for recovery
  - Accepts a custom fallback UI via props
  - **NEW**: Automatic reset on route navigation
  - **NEW**: Memory leak prevention with cleanup on unmount
  - **NEW**: Enhanced location tracking for navigation detection

### 2. ConsoleErrorBoundary
- **Location**: `src/client/components/ConsoleErrorBoundary.tsx`
- **Purpose**: Specialized error boundary for console/admin pages
- **Features**:
  - Console-specific error messaging
  - Provides navigation back to dashboard
  - Wraps the main ErrorBoundary with custom fallback UI
  - **NEW**: Development-only error details display
  - **NEW**: Configurable route reset functionality

### 3. BuggyComponent (Development/Testing)
- **Location**: `src/client/components/BuggyComponent.tsx`
- **Purpose**: Test component to demonstrate ErrorBoundary functionality
- **Usage**: Can be temporarily added to pages to test error boundary behavior

### 4. useErrorHandler Hook
- **Location**: `src/client/hooks/useErrorHandler.tsx`
- **Purpose**: Custom hook for triggering ErrorBoundaries from event handlers and async code
- **Features**:
  - **NEW**: State-based error throwing for proper ErrorBoundary catching
  - Works with functional components
  - Handles async errors that ErrorBoundaries normally can't catch

## New Features

### 🔄 **Automatic Route Reset**
ErrorBoundaries now automatically reset their error state when users navigate to different routes:

- **Browser Navigation**: Detects back/forward button usage
- **Programmatic Navigation**: Catches React Router link navigation
- **Configurable**: Can be enabled/disabled via props
- **Memory Efficient**: Prevents error state accumulation

### 🧹 **Enhanced Cleanup**
- Automatic state reset on component unmount
- Event listener cleanup to prevent memory leaks
- Location tracking state management

### 🐛 **Better Error Handling**
- Fixed async error handling in `useErrorHandler`
- Proper render-time error throwing
- Enhanced development debugging

## Usage Examples

### Basic Usage
```tsx
import ErrorBoundary from '@client/components/ErrorBoundary';

function MyApp() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Route Reset (Recommended)
```tsx
import ErrorBoundary from '@client/components/ErrorBoundary';

function MyApp() {
  return (
    <ErrorBoundary resetOnLocationChange={true}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback
```tsx
import ErrorBoundary from '@client/components/ErrorBoundary';

const customFallback = (error, errorInfo, reset) => (
  <div>
    <h1>Something went wrong!</h1>
    <button onClick={reset}>Try Again</button>
  </div>
);

function MyApp() {
  return (
    <ErrorBoundary fallback={customFallback}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Using Console Error Boundary with Route Reset
```tsx
import ConsoleErrorBoundary from '@client/components/ConsoleErrorBoundary';

function ConsoleLayout() {
  return (
    <ConsoleErrorBoundary resetOnLocationChange={true}>
      <Outlet />
    </ConsoleErrorBoundary>
  );
}
```

### Using the Enhanced Error Handler Hook
```tsx
import { useErrorHandler } from '@client/hooks/useErrorHandler';

function MyComponent() {
  const { throwError } = useErrorHandler();

  const handleAsyncError = async () => {
    try {
      await riskyAsyncOperation();
    } catch (error) {
      throwError(error); // This will be caught by the nearest ErrorBoundary
    }
  };

  const handleEventError = () => {
    // For event handlers that need to trigger ErrorBoundary
    throwError('Something went wrong in event handler!');
  };

  return (
    <div>
      <button onClick={handleAsyncError}>Risky Async Operation</button>
      <button onClick={handleEventError}>Trigger Event Error</button>
    </div>
  );
}
```

### Using Higher-Order Component
```tsx
import { withErrorBoundary } from '@client/hooks/useErrorHandler';

const MyComponent = () => {
  // Component implementation
  return <div>My Component</div>;
};

// Wrap with error boundary
export default withErrorBoundary(MyComponent);
```

## Current Implementation

The ErrorBoundary is currently integrated in:

1. **App.tsx**: Main application wrapper
   - Catches all unhandled errors in the application
   - Provides top-level error handling
   - **NEW**: Enabled with `resetOnLocationChange={true}` for automatic route reset

2. **ConsoleLayout.tsx**: Console pages wrapper
   - Provides specialized error handling for admin/console pages
   - Offers navigation back to dashboard
   - **NEW**: Uses ConsoleErrorBoundary with route reset functionality

## Configuration Options

### ErrorBoundary Props
```tsx
interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error, errorInfo, reset) => ReactNode);
  resetOnLocationChange?: boolean; // Default: undefined (no reset)
}
```

### ConsoleErrorBoundary Props
```tsx
interface ConsoleErrorBoundaryProps {
  children: React.ReactNode;
  resetOnLocationChange?: boolean; // Default: true
}
```

## Route Reset Feature

### How It Works
- **Detection Methods**:
  - `popstate` events for browser navigation (back/forward)
  - Location comparison in `componentDidUpdate` for programmatic navigation
- **Automatic Reset**: Clears error state when route changes
- **Configurable**: Use `resetOnLocationChange` prop to control behavior

### Benefits
- ✅ Users aren't stuck on error pages when navigating
- ✅ Fresh start on each route
- ✅ Better user experience
- ✅ Prevents error state accumulation

## Best Practices

1. **Place ErrorBoundaries Strategically**:
   - At the app level for global error handling with route reset
   - Around major feature sections
   - Around potentially unstable components

2. **Use Route Reset**:
   - Enable `resetOnLocationChange={true}` for better UX
   - Particularly important for SPAs with client-side routing

3. **Error Logging**:
   - The ErrorBoundary logs errors to console
   - Consider integrating with error tracking services (Sentry, Bugsnag, etc.)

4. **User Experience**:
   - Provide clear, actionable error messages
   - Offer recovery options (retry, reload, navigate away)
   - Show minimal technical details to end users

5. **Development vs Production**:
   - Error details are shown in development mode only
   - Production builds show user-friendly messages

6. **Memory Management**:
   - ErrorBoundaries now automatically clean up on unmount
   - Event listeners are properly removed
   - State is reset to prevent memory leaks

## Error Boundary Limitations

ErrorBoundaries do NOT catch errors in:
- Event handlers (use `useErrorHandler` hook instead)
- Asynchronous code (use `useErrorHandler` hook instead)
- Server-side rendering
- Errors thrown in the error boundary itself

**Solution**: Use the enhanced `useErrorHandler` hook for these scenarios.

## Testing Error Boundaries

### Using BuggyComponent
```tsx
import BuggyComponent from '@client/components/BuggyComponent';

// Add to any page temporarily for testing
<BuggyComponent shouldThrow={true} />
```

### Using Test Buttons (Development)
In your Permission component (or create similar):
```tsx
import { useErrorHandler } from '@client/hooks/useErrorHandler';

function TestComponent() {
  const { throwError } = useErrorHandler();
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Render-time error (caught immediately)
  if (shouldThrowError) {
    throw new Error('Test render error!');
  }

  return (
    <div>
      <button onClick={() => throwError('Test async error!')}>
        Test Async Error
      </button>
      <button onClick={() => setShouldThrowError(true)}>
        Test Render Error
      </button>
    </div>
  );
}
```

Both methods will trigger the ErrorBoundary and allow you to test:
- Error display and styling
- Route reset functionality
- Recovery options
- Development error details

