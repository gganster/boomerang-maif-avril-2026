import { forwardRef } from "react"

const Textarea = forwardRef<HTMLTextAreaElement>((_, ref) => {
  return (
    <textarea 
      ref={ref} 
      className="h-12 w-full border"
    >
    </textarea>
  )
})

export { Textarea };