import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { router } from './routes';
import { SocketProvider } from './context/SocketContext';
import CustomToastContainer from './components/shared/CustomToast';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Suspense fallback={<GlobalLoading />}>
          <RouterProvider router={router} />
        </Suspense>
        <CustomToastContainer />
      </SocketProvider>
    </QueryClientProvider>
  );
}
