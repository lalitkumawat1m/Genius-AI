import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      lemonSubscriptionId: true,
      lemonCurrentPeriodEnd: true,
      lemonCustomerId: true,
      lemonStatus: true,
      // stripeSubscriptionId: true,
      // stripeCurrentPeriodEnd: true,
      // stripeCustomerId: true,
      // stripePriceId: true,
    },
  })

  // if (!userSubscription) {
  //   return false;
  // }
    if (
    !userSubscription ||
    !userSubscription.lemonSubscriptionId ||
    !userSubscription.lemonCurrentPeriodEnd
  ) {
    return false;
  }

  
  const isValid =
     ["active", "on_trial", "paused"].includes(userSubscription.lemonStatus || "") &&
    userSubscription.lemonCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

  return !!isValid;
};