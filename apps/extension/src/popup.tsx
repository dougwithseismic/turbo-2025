import { motion } from "framer-motion"
import { useState } from "react"
import { z } from "zod"

import "./style.css"

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type ValidationErrors = {
  email?: string
  password?: string
}

function IndexPopup() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password })
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: ValidationErrors = {}
        err.errors.forEach((error) => {
          const path = error.path[0] as keyof ValidationErrors
          newErrors[path] = error.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Signing in with:", email, password)
    } catch (err) {
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Signing in with Google")
    } catch (err) {
      console.error("Google sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-80 min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="flex flex-col gap-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Turbo Extension
        </motion.h1>

        <div className="space-y-4">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-red-400 text-xs pl-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs pl-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all disabled:opacity-50 relative">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              "Sign In"
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 bg-white text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full"
              />
            ) : (
              <>
                <img
                  src="https://www.google.com/favicon.ico"
                  className="w-4 h-4"
                  alt="Google"
                />
                Sign in with Google
              </>
            )}
          </motion.button>
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="text-sm text-gray-400 hover:text-white transition-colors">
            Need Help?
          </button>
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="text-sm text-gray-400 hover:text-white transition-colors">
            About
          </button>
        </div>

        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm bg-gray-800/50 p-4 rounded-lg">
            For help, please visit our support page or email help@turbo2025.com
          </motion.div>
        )}

        {isInfoOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm bg-gray-800/50 p-4 rounded-lg">
            Turbo-2025 Extension v1.0.0
            <br />
            Built with passion, and Seismic
          </motion.div>
        )}
      </div>

      <footer className="text-center text-gray-400 text-xs mt-8">
        Doug Silkstone - withSeismic.com
      </footer>
    </div>
  )
}

export default IndexPopup
