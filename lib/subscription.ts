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
      // lemonSubscriptionId: true,
      // lemonCurrentPeriodEnd: true,
      // lemonCustomerId: true,
      // lemonStatus: true,
      // stripeSubscriptionId: true,
      // stripeCurrentPeriodEnd: true,
      // stripeCustomerId: true,
      // stripePriceId: true,
       // Razorpay fields
  
      razorpayStatus: true,
    },
  })

  // if (!userSubscription) {
  //   return false;
  // }
  //   if (
  //   !userSubscription ||
  //   !userSubscription.lemonSubscriptionId ||
  //   !userSubscription.lemonCurrentPeriodEnd
  // ) {
  //   return false;
  // }
   if (!userSubscription?.razorpayStatus){
    return false;
   }

  
  // const isValid =
  //    ["active", "on_trial", "paused", "captured"].includes(userSubscription.lemonStatus || userSubscription.razorpayStatus ||"") &&
  //   userSubscription.lemonCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()
      const isValid =
     ["active", "on_trial", "paused", "captured"].includes( userSubscription.razorpayStatus ||"") 

  return !!isValid;
};