"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const initial = useMemo(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    // username: user?.username ?? "",
  }), [user])

  const [firstName, setFirstName] = useState(initial.firstName)
  const [lastName, setLastName] = useState(initial.lastName)
  // const [username, setUsername] = useState(initial.username)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Keep local state in sync when user becomes available
    setFirstName(initial.firstName)
    setLastName(initial.lastName)
    // setUsername(initial.username)
  }, [initial.firstName, initial.lastName])

  const onboarded = Boolean((user?.unsafeMetadata as Record<string, unknown>)?.onboarded)

  useEffect(() => {
    if (!isLoaded) return
    // Only skip onboarding if we've explicitly marked the user as onboarded
    if (onboarded) {
      router.replace("/")
    }
  }, [isLoaded, onboarded, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">Loading…</div>
    )
  }

  function extractError(err: unknown): string {
    try {
      const anyErr = err as Record<string, unknown>
      if (anyErr?.errors && Array.isArray(anyErr.errors) && anyErr.errors.length) {
        const first = anyErr.errors[0] as Record<string, unknown>
        return (first?.longMessage as string) || (first?.message as string) || JSON.stringify(first)
      }
      return (anyErr?.message as string) || JSON.stringify(anyErr)
    } catch {
      return "Failed to save (unknown error)"
    }
  }

  async function onSave() {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      // 1) Update names first
      await user.update({ firstName, lastName })

      // 2) Update username separately so we can surface precise errors
      // let usernameUpdated = true
      // if ((username || "").trim().length > 0 && user.username !== username) {
      //   try {
      //     await user.update({ username })
      //   } catch (e) {
      //     usernameUpdated = false
      //     const message = extractError(e)
      //     // Common case: usernames feature is disabled in Clerk Dashboard
      //     if (message.toLowerCase().includes("username is not a valid parameter") || message.toLowerCase().includes("username")) {
      //       setError(
      //         "Username cannot be set. Enable Usernames in Clerk Dashboard (User & authentication → Username), Publish changes for the active environment, then try again.\n\nDetails: " +
      //           message
      //       )
      //     } else {
      //       setError(message)
      //     }
      //   }
      // }

      // 3) Only mark onboarded if username update succeeded
      // if (usernameUpdated) {
      await user.update({
        unsafeMetadata: { ...(user?.unsafeMetadata as Record<string, unknown>), onboarded: true },
      })
      router.replace("/")
      // }
    } catch (e: unknown) {
      console.error("Onboarding update failed:", e)
      setError(extractError(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full p-6">
      <h1 className="text-2xl font-semibold mb-2">Complete your profile</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Please confirm or provide your first name and last name.
      </p>

      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">First name</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Last name</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
        </div>
        {/* <div className="grid gap-2">
          <label className="text-sm font-medium">Username</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" />
        </div> */}

        {error && (
          <div className="text-sm text-red-500 whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button onClick={onSave} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save and continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
