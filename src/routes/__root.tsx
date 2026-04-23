import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorDisplay } from '../components/ErrorDisplay'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
    hello worm _root
      <ErrorBoundary fallbackRender={ErrorDisplay}>
        <React.Fragment>
          <div className="bg-blue-200">
            <Outlet />
          </div>
        </React.Fragment>
      </ErrorBoundary>
    </>
  )
}
