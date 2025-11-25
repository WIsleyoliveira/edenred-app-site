import React, { useState } from "react"
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

export default function Entrar({ aoEntrar }: { aoEntrar: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRegister) {
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Por favor, preencha todos os campos')
        return
      }
      if (password !== confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }
    } else {
      if (!email || !password) {
        toast.error('Por favor, preencha todos os campos')
        return
      }
    }

    setLoading(true)

    try {
      if (isRegister) {
        const response = await apiService.register({ name, email, password, confirmPassword })

        if (response.success) {
          toast.success('Conta criada com sucesso! Faça login para continuar.')
          setIsRegister(false) // Volta para modo login
          // Limpa os campos do formulário
          setName('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        const response = await apiService.login({ email, password })

        if (response.success) {
          toast.success('Login realizado com sucesso!')
          aoEntrar() // libera o acesso ao usuário autenticado
        }
      }
    } catch (error: any) {
      console.error('Erro:', error)

      // Mensagem específica para usuário não encontrado
      if (error.code === 'USER_NOT_FOUND') {
        toast.error('Usuário não encontrado. Crie uma conta para continuar.')
        setIsRegister(true) // Muda para modo cadastro
      } else {
        toast.error(error.message || `Erro ao ${isRegister ? 'cadastrar' : 'fazer login'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-red-600 h-40 flex flex-col items-center justify-center relative">
          <div className="h-12 w-12 rounded-full bg-white text-red-600 flex items-center justify-center font-semibold text-lg shadow-sm">
            T
          </div>
          <h1 className="mt-4 text-white text-2xl font-bold">Território Edenred</h1>
        </div>

        <form className="p-8 space-y-6" onSubmit={lidarComEnvio}>
          {isRegister && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-semibold">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-semibold">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-semibold">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
              required
            />
          </div>

          {isRegister && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 font-semibold">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isRegister ? 'Cadastrando...' : 'Entrando...'}
              </>
            ) : (
              isRegister ? 'Cadastrar' : 'Continuar'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
