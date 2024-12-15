interface GreetingProps {
  name: string
}

export const Greeting = ({ name }: GreetingProps): JSX.Element => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Hello, {name}!</h1>
    </div>
  )
}
