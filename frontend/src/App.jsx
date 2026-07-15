// Componente raiz: proveedores de contexto y rutas
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/auth-context'
import { CajaProvider } from './context/caja-context'
import AppRoutes from './routes/app-routes'
import { ToastContainer } from './components/common/toast'

// Configuracion de React Query: sin reintentos en errores 4xx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (count, error) => {
        if (error?.status >= 400 && error?.status < 500) return false
        return count < 2
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CajaProvider>
            <ToastContainer />
            <AppRoutes />
          </CajaProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
