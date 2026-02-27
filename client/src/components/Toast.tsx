type ToastProps = {
  message: string;
};

const Toast = ({ message }: ToastProps) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-4 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  );
};

export default Toast;
