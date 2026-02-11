"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DonateCheckoutForm } from "@/components/donate/donate-checkout-form"

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

const formatAmount = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GDP",
  }).format(cents / 100)

const parseAmountToCents = (value: string) => {
  const normalized = value.replace(/[^0-9.]/g, "")
  if (!normalized) return null
  const amount = Number.parseFloat(normalized)
  if (Number.isNaN(amount)) return null
  return Math.round(amount * 100)
}

export default function DonatePage() {
  const searchParams = useSearchParams()
  const [amount, setAmount] = useState("10")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const amountInCents = useMemo(() => parseAmountToCents(amount), [amount])
  const status = searchParams.get("status")

  useEffect(() => {
    if (status === "success") {
      setStatusMessage("Thank you for supporting QuizCraft!")
    } else if (status === "cancel") {
      setStatusMessage("Donation canceled. You can try again anytime.")
    }
  }, [status])

  const handleCreatePaymentIntent = async () => {
    setErrorMessage(null)
    setStatusMessage(null)

    if (!amountInCents || amountInCents <= 0) {
      setErrorMessage("Enter a valid donation amount.")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "gdp",
          name: donorName,
          email: donorEmail,
          message,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || "Unable to create payment.")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error("Payment intent error:", error)
      setErrorMessage("Stripe is not configured yet. Please try again later.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (clientSecret) {
      setClientSecret(null)
    }
  }

  const resetPayment = (keepStatus = false) => {
    setClientSecret(null)
    if (!keepStatus) {
      setStatusMessage(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-background dark:via-background/95 dark:to-background/90">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
              Support QuizCraft
            </h1>
            <p className="text-sm text-muted-foreground">
              Your donation helps us stay afloat.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back Home</Button>
          </Link>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>Choose your amount and add a message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donation-amount">Amount (GDP)</Label>
                <Input
                  id="donation-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donor-name">Name (optional)</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donor-email">Email (optional)</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donorEmail}
                  onChange={(event) => setDonorEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donor-message">Message (optional)</Label>
                <Textarea
                  id="donor-message"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              )}
              <Button
                type="button"
                onClick={handleCreatePaymentIntent}
                disabled={isCreating || !stripePromise}
                className="w-full"
              >
                {isCreating ? "Preparing payment..." : "Continue to Payment"}
              </Button>
              {!stripePromise && (
                <p className="text-xs text-muted-foreground">
                  Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to enable payments.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {clientSecret && stripePromise && amountInCents ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <DonateCheckoutForm
                  amountInCents={amountInCents}
                  donorName={donorName}
                  donorEmail={donorEmail}
                  onSuccess={() => {
                    setStatusMessage("Thank you! Your donation is complete.")
                    resetPayment(true)
                  }}
                />
              </Elements>
            ) : (
              <Card className="border-dashed border-2 bg-white/60 dark:bg-card/40">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter an amount to unlock payment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We accept major cards through Stripe.
                  </p>
                </CardContent>
              </Card>
            )}

            {clientSecret && (
              <Button variant="outline" onClick={() => resetPayment()} className="w-full">
                Edit Donation Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
