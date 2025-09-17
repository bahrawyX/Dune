import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Search, Zap, Building2 } from "lucide-react"
import TopOvalNavbar from "@/components/navigation/TopOvalNavbar"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { auth } from "@clerk/nextjs/server"
import { SignOutButton } from "@clerk/nextjs"
import SiteFooter from "@/components/navigation/SiteFooter"

export default async function HomePage() {
  const { userId } = await auth()
  
  return (
    <div className="min-h-screen bg-[#030303]">
      <TopOvalNavbar
        leftSlot={
          <div className="flex items-center gap-2 pl-1">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
        }
        rightSlot={
          <div className="flex items-center gap-2">
            {userId ? (
              <>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
                  <Link href="/job-seeker">Dashboard</Link>
                </Button>
                <SignOutButton>
                  <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:text-white hover:bg-white/10">
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/job-seeker">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        }
      />
      
      <main className="pt-20">
        <HeroGeometric 
        />


        <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-[#030303] to-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Dune</span>?
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                The most advanced job board platform connecting talented professionals with innovative companies
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm h-full hover:bg-white/[0.05] transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">AI-Powered Matching</CardTitle>
                  <CardDescription className="text-white/60">
                    Our advanced AI algorithms match you with the perfect job opportunities based on your skills and preferences
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm h-full hover:bg-white/[0.05] transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Top Companies</CardTitle>
                  <CardDescription className="text-white/60">
                    Connect with leading companies across various industries looking for talented professionals like you
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm h-full hover:bg-white/[0.05] transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Instant Applications</CardTitle>
                  <CardDescription className="text-white/60">
                    Apply to jobs with one click using your optimized profile and get faster responses from employers
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>


        {/* Stats Section */}
        <section className="py-20 px-4 md:px-6 bg-zinc-900">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/60">Active Jobs</div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">5K+</div>
                <div className="text-white/60">Companies</div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/60">Job Seekers</div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
                <div className="text-white/60">Success Rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

    </div>
  )
}
