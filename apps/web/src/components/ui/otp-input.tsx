import { Input } from '@/components/ui/input'
import { useRef, useState } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const OtpInput = ({ value, onChange, disabled }: OtpInputProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const createRefs = (index: number) => (element: HTMLInputElement | null) => {
    inputRefs.current[index] = element
  }

  const handleInputChange = (index: number, inputValue: string) => {
    const newValue = value.split('')
    newValue[index] = inputValue.slice(-1)
    const combinedValue = newValue.join('')
    onChange(combinedValue)

    if (inputValue && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    onChange(pastedData)

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus()
    } else if (pastedData.length > 0) {
      inputRefs.current[pastedData.length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <Input
          key={i}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleInputChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => setFocusedIndex(i)}
          onPaste={handlePaste}
          ref={createRefs(i)}
          disabled={disabled}
          className={`w-12 h-12 text-center text-lg font-semibold ${
            focusedIndex === i ? 'border-primary' : ''
          }`}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      ))}
    </div>
  )
}
