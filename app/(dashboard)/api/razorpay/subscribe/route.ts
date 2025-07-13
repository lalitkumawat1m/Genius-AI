// /api/razorpay/subscribe
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {

    try {
        // console.log("Starting POST request for subscription checkout");
        const { userId } = auth();
        if (!userId) {
            console.error("Unauthorized: User not logged in or missing email");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // console.log("User fetched:", userId);

        // Initialize Razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
        // console.log("Razorpay instance initialized");


        // const plan = await razorpay.plans.create({
        //     period: "monthly",
        //     interval: 1,
        //     item: {
        //         name: "Genius Pro Monthly",
        //         amount: 49900,
        //         currency: "INR",
        //         description: "Monthly subscription for Genius Pro",
        //     },
        // });


        const subscription = await razorpay.subscriptions.create({
            plan_id: "plan_QrfGEwM3B5hPMK",
            customer_notify: true,
            total_count: 12, 
            notes: {
                userId,
            }
        });
        // console.log("Razorpay subscription options created:", subscription);

        return NextResponse.json({ subscription });
    } catch (error: any) {
        console.error("Razorpay Error creating subscription:", error);
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }


}
