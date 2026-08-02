import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-6 pt-12 pb-10">
      {/* Illustration / hero */}
      <section className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            F
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">FreeFinder</span>
        </div>

        <div className="mt-6 w-full max-w-xs">
          <Image
            src="/images/freefinder-items.png"
            alt="A colorful pile of free items including a basketball, a chair, sneakers, a plant, and books"
            width={480}
            height={480}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Form */}
      <section className="flex w-full flex-1 flex-col pt-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Welcome back
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            Sign in to discover free stuff near you and share what you no longer need.
          </p>
        </header>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <a href="/register" className="font-semibold text-primary hover:underline">
            Register
          </a>
        </p>
      </section>
    </main>
  )
}
