import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SecretKeyProps = {
  value: string;
  allowCopy?: boolean;
  displayLength?: number;
};

const createDisplayMask = (length: number) => '•'.repeat(length);

export const SecretKey = ({
  value,
  allowCopy = true,
  displayLength = 12,
}: SecretKeyProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const displayValue = createDisplayMask(displayLength);

  const handleCopy = () => {
    if (!allowCopy) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <code
            className="inline-block bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors min-w-[120px] text-center"
            onClick={handleCopy}
          >
            <span className="inline-block font-mono">
              {isCopied ? (
                <span className="text-green-500 font-medium">copied!</span>
              ) : (
                displayValue
              )}
            </span>
          </code>
        </TooltipTrigger>
        <TooltipContent>
          <p>{allowCopy ? 'Click to copy' : 'Copying disabled'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
