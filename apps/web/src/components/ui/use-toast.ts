import toast from 'react-hot-toast';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export const useToast = () => {
  const showToast = ({
    title = 'Notification',
    description,
    variant = 'default',
  }: ToastProps) => {
    const message = description ? `${title}\n${description}` : title;

    if (variant === 'destructive') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  return { toast: showToast };
};
