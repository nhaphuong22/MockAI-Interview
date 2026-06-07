import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes/index.jsx';
import { SocketProvider } from './context/SocketContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </QueryClientProvider>
  );
}