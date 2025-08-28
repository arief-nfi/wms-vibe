import { Button } from '@client/components/ui/button';
import e from 'express';
import React from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);
  let errorMessage: string;
  let errorStatus: number;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || 'Unknown error';
  } else if (error instanceof Error) {
    errorStatus = 500;
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorStatus = 500;
    errorMessage = error;
  } else {
    errorStatus = 500;
    errorMessage = 'An unexpected error occurred.';
  }

  return (
    <div className="container mx-auto flex min-h-screen  justify-center px-6 py-12">
      <div className="w-full">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <h1 className="mt-3 text-2xl font-semibold text-destructive md:text-3xl">
            {errorStatus} - {errorMessage}
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            An unexpected error has occurred. Please try again later or contact support if the problem persists.
            <br/>
            Meanwhile, you may return to dashboard.
          </p>
          <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Button variant="default" className="w-40"><Link to="/console/dashboard">Back to Dashboard</Link></Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage