import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { SocketProvider } from './context/SocketContext';
import CustomToastContainer from './components/shared/CustomToast';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <RouterProvider router={router} />
        <CustomToastContainer />
      </SocketProvider>
    </QueryClientProvider>
  );
}
