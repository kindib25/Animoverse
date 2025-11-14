import { ForgotPasswordForm } from "@/components/admin/forgot-password-form"
import Link from "next/link"
export const metadata = {
  title: "Forgot Password - Animoverse",
  description: "Reset your Animoverse password",
}

export default function ForgotPasswordPage() {
  return (
     <div className="relative flex min-h-screen bg-[#087830]">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Link href="/">
                <img src="/logoname.svg" alt="Logo" />
              </Link>
            </div>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
      <img
        src="/night-bg1.gif"
        alt="side image"
        className="hidden lg:block h-screen w-1/2 object-cover bg-no-repeat bg-gray-600"
      />
    </div>
  )
}
