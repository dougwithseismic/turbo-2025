import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type SecretKeyProps = {
  value: string
  allowCopy?: boolean
  displayLength?: number
  className?: string
  showByDefault?: boolean
}

const createDisplayMask = (length: number) => '•'.repeat(length)

export const SecretKey = ({
  value,
  allowCopy = true,
  displayLength = 12,
  className,
  showByDefault = false,
}: SecretKeyProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isRevealed, setIsRevealed] = useState(showByDefault)
  const displayValue = isRevealed ? value : createDisplayMask(displayLength)

  const handleCopy = async () => {
    if (!allowCopy) return
    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={cn('flex items-center gap-1.5 max-w-full', className)}>
      <code className="inline-block bg-muted px-3 py-1.5 rounded font-mono truncate">
        {displayValue}
      </code>
      <div className="flex gap-1.5 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsRevealed(!isRevealed)}
              >
                {isRevealed ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRevealed ? 'Hide key' : 'Show key'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {allowCopy && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
