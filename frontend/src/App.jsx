import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< HEAD
import { router } from './routes/index.jsx';
=======
import { router } from './routes';
import { SocketProvider } from './context/SocketContext';
>>>>>>> 6c76fc9 (add apply job logic)

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