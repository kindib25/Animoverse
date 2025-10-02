import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <img src="/logoname.svg" alt="Logo"/>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight">Create a new account</h2>
            <p className="text-pretty text-muted-foreground">To use Animoverse, please enter your details</p>
          </div>

          <SignupForm />
        </div>
      </div>

      <img
            src="/night-bg2.gif"
            alt="side image"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat bg-gray-600"
          />
    </div>
  )
}
