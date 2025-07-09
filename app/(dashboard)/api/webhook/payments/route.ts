"use server";

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    return new NextResponse("LEMONSQUEEZY_WEBHOOK_SECRET not set", { status: 500 });
  }

  // Verify LemonSqueezy signature
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(request.headers.get("X-Signature") || "", "utf8");

  const valid = crypto.timingSafeEqual(digest, signature);
  if (!valid) {
    console.error("[LEMONSQUEEZY_WEBHOOK] Invalid signature");
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Parse webhook payload
  const payload = JSON.parse(rawBody);
  // console.log(payload);
  const eventName = payload.meta?.event_name;
  const attributes = payload.data?.attributes;

  // const userId = attributes?.custom_data?.user_id; // Clerk user ID
  const userId = payload.meta?.custom_data?.user_id
  const email = attributes?.user_email;
  const customerId = attributes?.customer_id;
  const subscriptionId = attributes?.first_subscription_item?.subscription_id;

  if (!userId) {
    console.error("[LEMONSQUEEZY_WEBHOOK] Missing Clerk user ID in custom_data");
    return new NextResponse("Missing user ID", { status: 400 });
  }

  if (!attributes) {
    return new NextResponse("Missing subscription attributes", { status: 400 });
  }

  // Handle order_created and subscription_created
  if (eventName === "subscription_created") {

    const data = {
      userId,
      lemonCustomerId: customerId?.toString(),
      lemonSubscriptionId: subscriptionId?.toString(),
      lemonProductId: attributes.product_id?.toString(),
      lemonVariantId: attributes.variant_id?.toString(),
      lemonStatus: attributes.status,
      lemonCurrentPeriodEnd: new Date(attributes.renews_at),
    };

    if (attributes.renews_at) {
      const renewDate = new Date(attributes.renews_at);
      if (!isNaN(renewDate.getTime())) {
        data.lemonCurrentPeriodEnd = renewDate;
      }
    }


    await prismadb.userSubscription.upsert({
      where: { userId },
      create: data,
      update: data,
    });

    return new NextResponse("Subscription created", { status: 200 });
  }

  // Handle subscription_updated
  if (eventName === "subscription_updated") {
    const subscription = await prismadb.userSubscription.findFirst({
      where: { lemonSubscriptionId: subscriptionId.toString() },
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    await prismadb.userSubscription.update({
      where: { userId: subscription.userId },
      data: {
        lemonStatus: attributes.status,
        lemonCurrentPeriodEnd: new Date(attributes.renews_at),
      },
    });

    return new NextResponse("Subscription updated", { status: 200 });
  }

  return new NextResponse("Event ignored", { status: 200 });
}
