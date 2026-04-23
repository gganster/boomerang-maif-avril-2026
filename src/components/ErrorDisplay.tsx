
import type { FallbackProps } from "react-error-boundary";

const ErrorDisplay = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="text-red-500 p-4 border-red m-4 rounded">
      <h2>Something went wrong.</h2>
      <p>Please try again later.</p>
      <p>{JSON.stringify(error)}</p>
      <button onClick={resetErrorBoundary} className="bg-red-500 text-white px-4 py-2 rounded">
        Try Again
      </button>
    </div>
  );
}

export {ErrorDisplay};