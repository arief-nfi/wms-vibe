import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@client/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error | undefined, errorInfo: ErrorInfo | undefined, reset: () => void) => ReactNode);
  resetOnLocationChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  previousLocation?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    previousLocation: typeof window !== 'undefined' ? window.location.pathname : undefined
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidMount() {
    // Add event listener for popstate (browser back/forward buttons)
    if (this.props.resetOnLocationChange !== false) {
      window.addEventListener('popstate', this.handleLocationChange);
    }
  }

  public componentDidUpdate() {
    // Check for location changes (programmatic navigation)
    if (this.props.resetOnLocationChange !== false) {
      const currentLocation = window.location.pathname;
      if (this.state.previousLocation && this.state.previousLocation !== currentLocation) {
        if (this.state.hasError) {
          // Reset error state on location change
          this.setState({ 
            hasError: false, 
            error: undefined, 
            errorInfo: undefined,
            previousLocation: currentLocation
          });
        } else {
          // Just update the location
          this.setState({ previousLocation: currentLocation });
        }
      }
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  public componentWillUnmount() {
    // Reset error state on unmount to prevent memory leaks
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Remove event listener
    if (this.props.resetOnLocationChange !== false) {
      window.removeEventListener('popstate', this.handleLocationChange);
    }
  }

  private handleLocationChange = () => {
    // Reset error state when browser navigation occurs
    if (this.state.hasError) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        previousLocation: window.location.pathname
      });
    }
  };

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      previousLocation: window.location.pathname
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset);
        }
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto flex min-h-screen justify-center px-6 py-12">
          <div className="w-full">
            <div className="mx-auto flex flex-col items-center text-center">
              <div className="text-6xl">⚠️</div>
              <h1 className="mt-3 text-2xl font-semibold text-destructive md:text-3xl">
                Something went wrong
              </h1>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                An unexpected error has occurred in the application. Please try reloading the page or contact support if the problem persists.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 w-full">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 rounded border bg-gray-50 p-4 text-left text-xs dark:bg-gray-800">
                    <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
                <Button variant="outline" onClick={this.handleReset} className="w-32">
                  Try Again
                </Button>
                <Button variant="default" onClick={this.handleReload} className="w-32">
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
