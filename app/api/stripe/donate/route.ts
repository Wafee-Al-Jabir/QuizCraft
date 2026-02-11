import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

export const runtime = "nodejs"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const donatePriceId = process.env.STRIPE_DONATE_PRICE_ID

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null

export async function POST() {
  if (!stripe || !donatePriceId) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    )
  }

  try {
    const origin = headers().get("origin") || "http://localhost:3000"
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      allow_promotion_codes: true,
      line_items: [
        {
          price: donatePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/?donate=success`,
      cancel_url: `${origin}/?donate=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe donate session error:", error)
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 }
    )
  }
}
