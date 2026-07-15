// Pagina de inicio de sesion
import LoginForm from '../features/auth/components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">POS Cafetería</h1>
          <p className="text-sm text-gray-400 mt-1">ITH Sistemas y Computacion</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
