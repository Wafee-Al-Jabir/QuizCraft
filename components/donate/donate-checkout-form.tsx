"use client"

import { useState } from "react"
import { useElements, useStripe, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DonateCheckoutFormProps {
  amountInCents: number
  donorName?: string
  donorEmail?: string
  onSuccess?: () => void
}

const formatAmount = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GDP",
  }).format(cents / 100)

export function DonateCheckoutForm({
  amountInCents,
  donorName,
  donorEmail,
  onSuccess,
}: DonateCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate?status=success`,
        payment_method_data: {
          billing_details: {
            name: donorName || undefined,
            email: donorEmail || undefined,
          },
        },
      },
      redirect: "if_required",
    })

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.")
      setIsSubmitting(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      setSuccessMessage("Thank you! Your donation was successful.")
      onSuccess?.()
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="border border-indigo-200/60 dark:border-indigo-800/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Payment Details</CardTitle>
        <CardDescription>Securely complete your donation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          )}
          <Button type="submit" disabled={!stripe || isSubmitting} className="w-full">
            {isSubmitting ? "Processing..." : `Donate ${formatAmount(amountInCents)}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Payments are processed securely by Stripe.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
