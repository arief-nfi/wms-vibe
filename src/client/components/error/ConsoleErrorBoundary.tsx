import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Button } from '@client/components/ui/button';
import { useNavigate } from 'react-router';

interface ConsoleErrorBoundaryProps {
  children: React.ReactNode;
  resetOnLocationChange?: boolean;
}

const ConsoleErrorBoundary: React.FC<ConsoleErrorBoundaryProps> = ({ children, resetOnLocationChange = true }) => {
  const navigate = useNavigate();
  const fallbackUI = (error: Error | undefined, errorInfo: any, reset: () => void) => (
    <div className="container mx-auto flex justify-center px-4 py-8">
      <div className="w-full">
        <div className="mx-auto flex flex-col items-center text-center">
          <div className="text-3xl">⚠️</div>
          <h1 className="mt-3 text-2xl font-semibold text-destructive md:text-2xl">
            Oops! Something went wrong.
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            An unexpected error has occurred. <br/>
            Please try again or contact support if the problem persists.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 w-full ">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 rounded border bg-gray-50 p-4 text-left text-xs dark:bg-gray-800">
                <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Button 
              variant="outline" 
              className="w-40"
              onClick={() => {
                //reset(); // Reset the error boundary state
                navigate('/console/dashboard', { replace: true });
              }}
            >
              Back to Dashboard
            </Button>
            <Button variant="default" onClick={() => window.location.reload()} className="w-32">
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} resetOnLocationChange={resetOnLocationChange}>
      {children}
    </ErrorBoundary>
  );
};

export default ConsoleErrorBoundary;
