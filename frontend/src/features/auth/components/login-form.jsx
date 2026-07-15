// Formulario de inicio de sesion con validacion zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/auth-context'
import Input from '../../../components/common/input'
import Button from '../../../components/common/button'

const schema = z.object({
  email:    z.string().email('Ingresa un correo valido'),
  password: z.string().min(1, 'La contrasena es obligatoria'),
})

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    setApiError('')
    try {
      const usuario = await login(email, password)
      // Redirige segun el rol del usuario
      if (usuario.rol === 'cajero') navigate('/ventas')
      else navigate('/productos')
    } catch (err) {
      setApiError(err.message || 'Credenciales invalidas')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Correo electronico"
        type="email"
        placeholder="admin@pos.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Contrasena"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        Iniciar sesion
      </Button>
    </form>
  )
}
