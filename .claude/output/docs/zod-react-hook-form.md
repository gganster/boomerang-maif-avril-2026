# Zod + React Hook Form

> Source: Context7 documentation
> Libraries: `zod`, `react-hook-form`, `@hookform/resolvers`

## Overview

[Zod](https://zod.dev) is a TypeScript-first schema validation library with static type inference. [React Hook Form](https://react-hook-form.com) is a performant, uncontrolled-by-default form library. Together — via `@hookform/resolvers/zod` — they let you declare a single schema that drives both runtime validation and the static `FormData` type.

## Installation

```bash
npm install react-hook-form zod @hookform/resolvers
```

## The Minimal Pattern

One schema → one inferred type → one form.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  age: z.number().min(10, { message: 'Must be at least 10' }),
})

type FormData = z.infer<typeof schema>

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <p>{errors.age.message}</p>}

      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  )
}
```

Note `valueAsNumber: true` on the number input — without it, the value comes through as a string and Zod's `z.number()` will reject it.

## Typing the Resolver

When the schema *transforms* values (e.g. `z.string().transform(s => s.length)`), the input and output types differ. Force both:

```tsx
useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
  resolver: zodResolver(schema),
})
```

For non-transforming schemas, the simpler `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })` is fine.

## Zod Schema Building Blocks

### Primitives

```ts
import { z } from 'zod'

z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.undefined()
z.null()
```

Invalid input throws `z.ZodError`:

```ts
try {
  z.string().parse(123)
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(err.issues)
    // [{ code: 'invalid_type', expected: 'string', path: [], message: '...' }]
  }
}
```

### Objects

```ts
const Person = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
})

// Strip unknown keys (default)
Person.parse({ name: 'Alice', email: 'a@b.com', extra: 1 })
// => { name: 'Alice', email: 'a@b.com' }

// Reject unknown keys
const Strict = z.strictObject({ name: z.string() })

// Pass-through unknown keys
const Loose = z.looseObject({ name: z.string() })

// Schema transformations
Person.extend({ role: z.string() })
Person.pick({ name: true, email: true })
Person.omit({ age: true })
Person.partial()   // all fields optional
Person.required()  // all fields required
```

### Arrays & Tuples

```ts
const Tags = z.array(z.string()).min(1).max(10)

const Point = z.tuple([z.number(), z.number()])
const NamedPoint = z.tuple([z.string()], z.number())  // [string, ...number[]]
```

### String/Number Constraints (with custom messages)

```ts
z.string()
  .min(3, { message: 'Too short' })
  .max(50, { message: 'Too long' })
  .email({ message: 'Invalid email' })
  .url()
  .regex(/^[a-z0-9_]+$/i, { message: 'Letters, digits, underscores only' })

z.number()
  .int()
  .positive()
  .min(0)
  .max(100)
```

### Refinements & Custom Validation

```ts
const Password = z.object({
  password: z.string().min(8),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'], // attach error to the confirm field
})
```

### Type Inference

```ts
const Player = z.object({
  username: z.string(),
  xp: z.number(),
})

type Player = z.infer<typeof Player>
// { username: string; xp: number }
```

## React Hook Form — Core API

### `useForm` Options

| Option | Notes |
|---|---|
| `resolver` | Plug in `zodResolver(schema)` to validate via Zod |
| `defaultValues` | Initial values. Required for full type-safety |
| `values` | Reactive values that override `defaultValues` when changed |
| `mode` | When validation runs: `'onSubmit'` (default), `'onBlur'`, `'onChange'`, `'onTouched'`, `'all'` |
| `reValidateMode` | After first error, when to re-validate |
| `shouldUnregister` | Unmount unregisters the field |
| `criteriaMode` | `'firstError'` (default) or `'all'` |

### `UseFormReturn` — what you destructure

```ts
const {
  register,        // bind native inputs
  control,         // pass to <Controller> / useController
  handleSubmit,    // wraps your submit handler
  watch,           // subscribe to a field's value
  getValues,       // read current values (no subscription)
  setValue,        // imperatively set a field
  reset,           // reset entire form
  resetField,      // reset one field
  trigger,         // manually run validation
  setError,        // set a server-side error
  clearErrors,
  setFocus,
  formState: {
    errors, isDirty, dirtyFields, touchedFields,
    isSubmitting, isSubmitted, isSubmitSuccessful,
    isValid, isValidating, submitCount,
  },
} = useForm<FormData>({ resolver: zodResolver(schema) })
```

### `register` for Native Inputs

```tsx
<input {...register('email')} />
<input type="number" {...register('age', { valueAsNumber: true })} />
<input type="date" {...register('birthday', { valueAsDate: true })} />
<input type="checkbox" {...register('agree')} />
```

When using `zodResolver`, prefer Zod for validation rules — but `valueAsNumber`/`valueAsDate` still belong on `register` so the value reaches Zod in the right shape.

### `Controller` / `useController` for Controlled Inputs

For UI-library inputs (shadcn/ui, MUI, React Select, date pickers) that don't expose a ref-able native input.

```tsx
import { useForm, useController, UseControllerProps } from 'react-hook-form'

type FormValues = { firstName: string }

function TextInput(props: UseControllerProps<FormValues> & { label: string }) {
  const { field, fieldState } = useController(props)

  return (
    <div>
      <label>{props.label}</label>
      <input
        {...field}
        style={{ borderColor: fieldState.error ? 'red' : 'gray' }}
      />
      {fieldState.error && <span>{fieldState.error.message}</span>}
    </div>
  )
}

function App() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { firstName: '' },
  })

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <TextInput name="firstName" control={control} label="First Name" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Granular Subscriptions with `useFormState`

Sub-components subscribed via `useFormState({ control })` re-render only on the slice of state they read — keeps the form-wide tree from re-rendering on every keystroke.

```tsx
function SubmitButton({ control }: { control: Control<FormValues> }) {
  const { isSubmitting, isValid } = useFormState({ control })
  return (
    <button type="submit" disabled={isSubmitting || !isValid}>
      {isSubmitting ? 'Submitting…' : 'Submit'}
    </button>
  )
}
```

## End-to-end Example (production pattern)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const RegistrationSchema = z.object({
  username: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

type RegistrationData = z.infer<typeof RegistrationSchema>

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationData>({
    resolver: zodResolver(RegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      age: 18,
      password: '',
      confirm: '',
    },
  })

  const onSubmit = async (data: RegistrationData) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const { field, message } = await res.json()
      setError(field, { type: 'server', message })
      return
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <p>{errors.username.message}</p>}

      <input type="email" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <p>{errors.age.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <input type="password" {...register('confirm')} />
      {errors.confirm && <p>{errors.confirm.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}
```

## Gotchas

- **Number/date inputs**: native inputs always emit strings. Use `register('field', { valueAsNumber: true })` or `valueAsDate: true`, otherwise `z.number()` / `z.date()` will fail validation.
- **`defaultValues` is required for typing**: omit it and TypeScript widens fields to `string | undefined`. Always provide `defaultValues` matching your `FormData` type.
- **Cross-field validation goes in `.refine`** with `path: [...]` so the error attaches to the right field (and shows up in `formState.errors`).
- **Server errors**: use `setError('fieldName', { type: 'server', message })` after the submit returns. They persist until the user edits the field.
- **Optional fields**: `z.string().optional()` accepts `undefined` but not empty string. For typical text inputs, prefer `z.string().min(0)` or `.optional().or(z.literal(''))` depending on intent.
