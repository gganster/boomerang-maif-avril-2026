
type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

const Button = ({children, ...rest}: ButtonProps) => {
  return (
    <button {...rest} className={`bg-blue-500 text-white rounded px-2 py-1 ${rest.className ?? ""}`}>
      {children}
    </button>
  )
}

export {Button}