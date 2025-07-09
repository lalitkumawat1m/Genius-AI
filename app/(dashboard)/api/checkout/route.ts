// /app/api/checkout/route.ts
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { createCheckoutUrl } from "@/lib/lemon-squeezy/server";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings"); // 

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return new NextResponse("User email not found", { status: 400 });
    }

       // ✅ Check if already subscribed
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    const isActive =
      userSubscription &&
      userSubscription.lemonStatus === "active"; // Use your own field

    if (isActive) {
      // ✅ User already subscribed, redirect to dashboard
      return new NextResponse(JSON.stringify({ url: settingsUrl }));
    }

    const checkoutUrl = await createCheckoutUrl({
        variantId: "889191",
        embed: true,
        userId: userId,
        userEmail: email,
    });

    if (!checkoutUrl) {
      return new NextResponse("Failed to create checkout", { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[LEMON_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
