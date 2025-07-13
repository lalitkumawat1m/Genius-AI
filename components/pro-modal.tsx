"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";
import { tools } from "@/constants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

export const ProModal = () => {
  const proModal = useProModal();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Razorpay integration
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
    document.body.appendChild(script);
  }, []);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      // calling lemonsqueezy checkout
      // const response = await axios.get("/api/checkout");
      // window.location.href = response.data.url;

      // console.log("Calling /api/razorpay/order...");
      // const { data } = await axios.post("/api/razorpay/order");

      console.log("Calling /api/razorpay/subscribe...");
      const { data } = await axios.post("/api/razorpay/subscribe");

      console.log("Razorpay subscription data:", data);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        // amount: data.data.amount, // ✅ Add this for order
        // currency: data.data.currency, // ✅ Add this for order
        name: "Genius Pro",
        description: "Subscription",
        // order_id: data.data.id,
        subscription_id: data.subscription.id, // Use subscription ID for subscription checkout
        notes: {
          userId: user?.id,
        },
        handler: async function (response: any) {
          console.log("Razorpay order data:", data);
          console.log("Payment successful:", response);
          toast.success("Payment successful");
          window.location.reload();
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.emailAddresses?.[0]?.emailAddress || ""
        },
      };

      // ✅ CLOSE THE MODAL BEFORE OPENING Razorpay popup
      proModal.onClose(); // This is KEY to release focus trap


      if (!(window as any).Razorpay) {
        toast.error("Razorpay SDK failed to load. Please try again.");
        return;
      }

      // Wait for modal DOM to fully unmount
      setTimeout(() => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }, 300); // Wait 300ms for Dialog to unmount smoothly

      // // For Online Checkout
      // const rzp = new (window as any).Razorpay(options);
      // rzp.open();

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold text-xl">
              Upgrade to Genius
              <Badge variant="premium" className="uppercase text-sm py-1">
                pro
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            {tools.map((tool) => (
              <Card key={tool.href} className="p-3 border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                  </div>
                  <div className="font-semibold text-sm">
                    {tool.label}
                  </div>
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} onClick={onSubscribe} size="lg" variant="premium" className="w-full">
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};