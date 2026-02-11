import { NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    )
  }

  let payload: {
    amount?: number
    currency?: string
    name?: string
    email?: string
    message?: string
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }

  const amount = Number(payload.amount)
  const currency = (payload.currency || "usd").toLowerCase()

  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive integer." }, { status: 400 })
  }

  if (currency !== "usd") {
    return NextResponse.json({ error: "Unsupported currency." }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: payload.email?.trim() || undefined,
      metadata: {
        type: "donation",
        name: payload.name?.trim() || "",
        message: payload.message?.trim() || "",
        email: payload.email?.trim() || "",
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Stripe payment intent error:", error)
    return NextResponse.json(
      { error: "Unable to create payment intent." },
      { status: 500 }
    )
  }
}
