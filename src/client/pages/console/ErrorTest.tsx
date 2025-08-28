import { Button } from '@client/components/ui/button';
import { useErrorHandler } from '@client/hooks/useErrorHandler';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ErrorTest = () => {
  const { throwError } = useErrorHandler();
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // This will be caught by ErrorBoundary during rendering
  if (shouldThrowError) {
    throw new Error('Rendering error for testing ErrorBoundary!');
  }

  const handleClickAsync = () => {
    // Use throwError for async errors (setTimeout approach)
    throwError('Intentional error for testing ErrorBoundary!');
  };

  const handleClickRender = () => {
    // Trigger a render-time error
    setShouldThrowError(true);
  };

  useEffect(() => {
    // Simulate an async error after 1 second
    // const timer = setTimeout(() => {
    //   throwError('Async error after 1 second');
    // }, 1000);

    // return () => clearTimeout(timer);

    axios.get('/api/system/permission')
      .then(response => {
        console.log('API response:', response.data);
      })
      .catch(error => {
        throwError(error);
      });

  }, [throwError]);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4" >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Error Test</h1>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-2 py-2 md:gap-6">
          <div className="flex gap-2">
            <Button onClick={handleClickAsync}>
              Trigger Async Error
            </Button>
            <Button onClick={handleClickRender} variant="destructive">
              Trigger Render Error
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ErrorTest