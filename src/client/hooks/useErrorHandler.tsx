import React, { useCallback, useState } from 'react';
import ErrorBoundary from '@client/components/error/ErrorBoundary';

/**
 * Custom hook to throw errors that can be caught by ErrorBoundary
 * This is useful for functional components that need to trigger error boundaries
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  // This will cause a re-render and throw during rendering
  if (error) {
    throw error;
  }

  const throwError = useCallback((errorMessage: string | Error) => {
    const errorToThrow = errorMessage instanceof Error ? errorMessage : new Error(errorMessage);
    setError(errorToThrow);
  }, []);

  return { throwError };
};

/**
 * Higher-order component to wrap components with error boundary functionality
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
