
type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Input = (props: InputProps) => (
  <input {...props} className={`border rounded px-1 py-0.5 ${props.className ?? ""}`} />
)

export {Input};