# TanStack Query - React

> Source: Context7 documentation (`/tanstack/query`)
> Library: `@tanstack/react-query`

## Overview

TanStack Query (formerly React Query) is a powerful asynchronous state management and data-fetching library for React. It handles fetching, caching, synchronizing, and updating server state with zero-config defaults: automatic background refetching, request deduplication, stale-while-revalidate caching, and optimistic updates.

## Setup

Wrap your app with `QueryClientProvider` and a single `QueryClient` instance.

```tsx
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}
```

## Core Hooks

### `useQuery` — fetch and cache data

```tsx
import { useQuery } from '@tanstack/react-query'
import { getTodos } from '../my-api'

function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  if (query.isPending) return <span>Loading…</span>
  if (query.isError) return <span>Error: {query.error.message}</span>

  return (
    <ul>
      {query.data?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

Key returned fields: `data`, `error`, `isPending`, `isFetching`, `isError`, `isSuccess`, `refetch`.

### `useMutation` — write data

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postTodo } from '../my-api'

function AddTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // Invalidate and refetch the todos list
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <button
      disabled={mutation.isPending}
      onClick={() =>
        mutation.mutate({ id: Date.now(), title: 'Do Laundry' })
      }
    >
      {mutation.isPending ? 'Adding…' : 'Add Todo'}
    </button>
  )
}
```

Key returned fields: `mutate`, `mutateAsync`, `data`, `error`, `isPending`, `isError`, `isSuccess`, `variables`, `reset`.

## Query Invalidation

Invalidating a query marks it stale; if mounted, it refetches immediately.

```ts
// Invalidate every query in the cache
queryClient.invalidateQueries()

// Invalidate every query whose key starts with ['todos']
queryClient.invalidateQueries({ queryKey: ['todos'] })

// Invalidate multiple distinct keys
queryClient.invalidateQueries({ queryKey: ['todos'] })
queryClient.invalidateQueries({ queryKey: ['reminders'] })
```

Query keys are matched by **prefix**: invalidating `['todos']` also invalidates `['todos', 1]`, `['todos', { page: 2 }]`, etc.

## Optimistic Updates

### Approach 1 — update the cache directly (with rollback)

Use when you need the optimistic value to be visible everywhere the cached data is read.

```tsx
const updateTodoMutation = useMutation({
  mutationFn: async (updatedTodo) => {
    const r = await fetch(`/api/todos/${updatedTodo.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTodo),
    })
    return r.json()
  },
  onMutate: async (newTodo) => {
    // Cancel any in-flight refetches so they don't overwrite our optimistic write
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // Snapshot the previous value for rollback
    const previousTodos = queryClient.getQueryData(['todos'])

    // Optimistically write
    queryClient.setQueryData(['todos'], (old) =>
      old.map((t) => (t.id === newTodo.id ? newTodo : t))
    )

    // Return context for onError
    return { previousTodos }
  },
  onError: (_err, _newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### Approach 2 — read pending state from the mutation (simpler)

Use `mutation.variables` while `isPending` to render the optimistic row inline. No cache writes, no rollback needed — when the mutation settles, the row disappears and the invalidated query brings in the real value.

```tsx
const addTodoMutation = useMutation({
  mutationFn: (newTodo) =>
    fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodo),
    }).then((r) => r.json()),
  mutationKey: ['addTodo'],
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

return (
  <ul>
    {todos?.map((todo) => <li key={todo.id}>{todo.title}</li>)}
    {addTodoMutation.isPending && (
      <li style={{ opacity: 0.5 }}>{addTodoMutation.variables?.title}</li>
    )}
  </ul>
)
```

### `useMutationState` — read mutation variables from anywhere

```tsx
import { useMutationState } from '@tanstack/react-query'

const pendingTodos = useMutationState({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

## Query Keys

- Always an array. The first element is conventionally a string identifying the resource.
- Include every variable the query depends on. Different keys → different cache entries.
- Stable serialization: `['todos', { status: 'done', page: 2 }]` matches regardless of object key order.

```ts
useQuery({ queryKey: ['todo', todoId], queryFn: () => fetchTodo(todoId) })
useQuery({ queryKey: ['todos', { status, page }], queryFn: fetchTodos })
```

## Cache Manipulation API (on `queryClient`)

| Method | Purpose |
|---|---|
| `getQueryData(key)` | Read current cached data synchronously |
| `setQueryData(key, updater)` | Write cached data (function or value) |
| `invalidateQueries({ queryKey })` | Mark stale + refetch active queries |
| `cancelQueries({ queryKey })` | Cancel in-flight fetches (use before optimistic writes) |
| `refetchQueries({ queryKey })` | Force refetch regardless of stale state |
| `removeQueries({ queryKey })` | Drop entries from the cache |
| `prefetchQuery({ queryKey, queryFn })` | Warm the cache without subscribing |

## Common `useQuery` Options

| Option | Default | Notes |
|---|---|---|
| `staleTime` | `0` | How long data is considered fresh (no background refetch) |
| `gcTime` | `5 * 60 * 1000` | How long inactive cache entries are kept (was `cacheTime` in v4) |
| `enabled` | `true` | Set `false` to disable the query (dependent queries) |
| `refetchOnWindowFocus` | `true` | Refetch when the window regains focus |
| `refetchOnMount` | `true` | Refetch when a new subscriber mounts and data is stale |
| `retry` | `3` | Retry count or a function `(failureCount, error) => boolean` |
| `select` | — | Transform data without re-rendering when untransformed value is unchanged |

## Common `useMutation` Options

| Option | Notes |
|---|---|
| `mutationFn` | The async function that performs the write |
| `mutationKey` | Optional key for `useMutationState` lookups |
| `onMutate` | Runs before `mutationFn`. Return value becomes `context` in later callbacks. Best place for optimistic writes |
| `onError(err, vars, context)` | Rollback here using `context` |
| `onSuccess(data, vars, context)` | Side-effects on success |
| `onSettled` | Runs after success OR error — typical place to invalidate |
| `retry` | Default is `0` for mutations |

## End-to-end Pattern

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <div>
      <ul>
        {query.data?.map((todo) => <li key={todo.id}>{todo.title}</li>)}
      </ul>
      <button
        onClick={() =>
          mutation.mutate({ id: Date.now(), title: 'Do Laundry' })
        }
      >
        Add Todo
      </button>
    </div>
  )
}
```
