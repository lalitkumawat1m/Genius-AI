'use server';
import { createCustomer, lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export async function configureLemonSqueezy() {
    const requiredVars = [
        "LEMONSQUEEZY_API_KEY",
        "LEMONSQUEEZY_STORE_ID",
        "LEMONSQUEEZY_WEBHOOK_SECRET",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        return {
            error: `Missing required LEMONSQUEEZY env variables: ${missingVars.join(", ")
                }. Please, set them in your .env file.`,
        };
    }

    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });
    return { error: null };
}

export async function createNewCustomer(email: string) {
    const { error } = await configureLemonSqueezy();
    if (error) {
        console.error(error);
        return null;
    }

    return createCustomer(process.env.LEMONSQUEEZY_STORE_ID!, {
        name: "userq",
        email: email,

    });
}
export async function createCheckoutUrl(
    { variantId, userEmail = "", userId = "", embed = false }: {
        variantId: string;
        userEmail?: string;
        userId?: string;
        embed?: boolean;
    },
) {
    const { error } = await configureLemonSqueezy();
    if (error) {
        console.error(error);
        return null;
    }


    if (!process.env.NEXT_PUBLIC_APP_URL) {
        console.warn(
            "NEXT_PUBLIC_APP_URL is not defined, using default redirect URL",
        );
        return null;
    }

    const checkoutData: any = {
        custom: {
            user_id: userId, // ✅ This is what goes to LemonSqueezy and returns in webhook under `custom_data`
        },
    };
    if (userEmail) checkoutData.email = userEmail;
    if (userId) checkoutData.custom = { user_id: userId };

    const redirectBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const redirectUrl = userId
        ? `${redirectBaseUrl}/dashboard`
        : `${redirectBaseUrl}/`;

    const checkout = await createCheckout(
        process.env.LEMONSQUEEZY_STORE_ID!,
        variantId,
        {
            checkoutOptions: {
                embed,
                media: true,
                logo: !embed,
            },
            checkoutData,
            productOptions: {
                enabledVariants: [parseInt(variantId)],
                redirectUrl: redirectUrl,
                receiptButtonText: "Go to Dashboard",
                receiptThankYouNote: "Thank you for subscribing genius ai!",
            },
        },
    );

    if (!checkout.data?.data?.attributes?.url) {
        console.error("Failed to create checkout URL");
        return null;
    }

    return checkout.data?.data?.attributes?.url;
}