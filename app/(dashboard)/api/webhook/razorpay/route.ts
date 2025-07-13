import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";


export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const razorpaySignature = request.headers.get("x-razorpay-signature");

  if (!razorpaySignature) {
    console.log("Missing signature header");
    return new NextResponse("Signature header missing", { status: 400 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new NextResponse("Webhook secret not set", { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(razorpaySignature, "utf8");

  const expectedUint8 = new Uint8Array(expected.buffer, expected.byteOffset, expected.length);
  const receivedUint8 = new Uint8Array(received.buffer, received.byteOffset, received.length);

  if (expectedUint8.length !== receivedUint8.length || !crypto.timingSafeEqual(expectedUint8, receivedUint8)) {
    console.error("Webhook signature mismatch");
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Now safely parse the JSON since signature is valid
  const body = JSON.parse(rawBody);
  // console.log("✅ Verified Webhook Body:", body);
  // console.log("✅ Verified Webhook Body:", body.payload.payment);

  // Example: Access payment details
  const payment = body.payload?.payment?.entity;
  const eventType = body.event;

  if (!payment) {
    return NextResponse.json({ message: "Payment object missing" }, { status: 400 });
  }

  const userId = payment.notes?.userId ; // Use email as fallback if notes.userId is not set
  if (!userId) {
    console.error("User ID not found in payment notes or email");
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }
  // console.log("User ID from payment notes:", userId);
  // console.log("Payment details:", payment);
  // console.log("Webhook called");


  // Handle order_created and subscription_created
  if (eventType === "payment.captured") {
    try {

      const data = {
        userId: userId,
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        razorpayInvoiceId: payment.invoice_id,
        razorpayTokenId: payment.token_id,
        razorpayEmail: payment.email,
        razorpayContact: payment.contact,
        razorpayStatus: payment.status,
        razorpayMethod: payment.method,
        razorpayAmount: payment.amount,
        razorpayCurrency: payment.currency,
        razorpayCapturedAt: new Date(payment.created_at * 1000),
        isActive: true,
      };

      await prismadb.userSubscription.upsert({
        where: { userId },
        create: data,
        update: data,
      });

      // console.log("Payment recorded successfully:", data);
      return new NextResponse("Subscription created", { status: 200 });
    } catch (error: any) {
      console.error("Error processing payment:", error);
      return NextResponse.json(
        { message: "Error processing payment", isOk: false },
        { status: 500 }
      );

    }

  }

  if (eventType === "subscription.updated") {
     try {
      const subscriptionId = payment.subscription_id;
      if (!subscriptionId) {
        console.error("Subscription ID not found in payment");
        return NextResponse.json({ error: "Subscription ID not found" }, { status: 400 });
      }

       await prismadb.userSubscription.update({
        where: { userId },
        data: {
          razorpayStatus: payment.status,
        },
      });

      // console.log("Subscription updated successfully:", updatedSubscription);
      return new NextResponse("Subscription updated", { status: 200 });
      
     } catch (error: any) {
      console.error("Error processing event:", error);
      return NextResponse.json(
        { message: "Error processing event", isOk: false },
        { status: 500 }
      );
      
     }

  }


  

  // Handle subscription_updated
  // if (eventName === "subscription_updated") {
  //   const subscription = await prismadb.userSubscription.findFirst({
  //     where: { lemonSubscriptionId: subscriptionId.toString() },
  //   });

  //   if (!subscription) {
  //     return new NextResponse("Subscription not found", { status: 404 });
  //   }

  //   await prismadb.userSubscription.update({
  //     where: { userId: subscription.userId },
  //     data: {
  //       lemonStatus: attributes.status,
  //       lemonCurrentPeriodEnd: new Date(attributes.renews_at),
  //     },
  //   });

  //   return new NextResponse("Subscription updated", { status: 200 });
  // }

  return NextResponse.json(
    {
      message: "Payment verified and purchase recorded successfully!",
      isOk: true,
    },
    { status: 200 }
  );
}