import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BarChart3, Clock3, Leaf, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { getFoodImage } from "@/lib/food-images";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-2xl border border-warm-100 bg-warm-white shadow-warm">
          <div className="relative h-44 overflow-hidden bg-warm-50 sm:h-56">
            <Image
              src={getFoodImage("seasonal produce", "Produce")}
              alt="Fresh produce on a kitchen counter"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/45 via-stone-900/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-warm-white/95 px-3 py-1 text-xs font-semibold text-sage-700 shadow-warm-sm">
                <Leaf className="h-3.5 w-3.5" />
                Kitchen ledger
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              FreshTrack
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              See what needs attention, use it while it is still good, and keep a calmer record of what gets saved.
            </p>

            <div className="mt-6 divide-y divide-warm-100 rounded-xl border border-warm-100">
              {[
                {
                  icon: Clock3,
                  label: "Greek yogurt",
                  detail: "Use within 2 days",
                  tone: "text-amber-700 bg-amber-50",
                },
                {
                  icon: UtensilsCrossed,
                  label: "Spinach",
                  detail: "Try tonight in 18 minutes",
                  tone: "text-sage-700 bg-sage-50",
                },
                {
                  icon: BarChart3,
                  label: "$42 saved",
                  detail: "This month so far",
                  tone: "text-stone-700 bg-warm-50",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                    <div className={`rounded-lg p-2 ${row.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{row.label}</p>
                      <p className="text-xs text-stone-500">{row.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-warm-100 bg-warm-white p-6 shadow-warm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sage-50 p-3 text-sage-600">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Welcome back</h2>
              <p className="text-sm text-stone-500">Your pantry stays synced to your account.</p>
            </div>
          </div>

          <form
            className="mt-8"
            data-analytics-event="sign_in_clicked"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/app" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Continue with Google
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-sage-50 px-3 py-3 text-sm text-sage-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Sign in once, then add items from your phone or desktop without rebuilding the list.</p>
          </div>

          <p className="mt-8 text-xs leading-5 text-stone-500">
            By continuing you agree to our{" "}
            <a href="/terms" className="font-medium text-sage-700 underline underline-offset-2">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-sage-700 underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
