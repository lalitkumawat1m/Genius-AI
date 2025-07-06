import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { Client } from "@gradio/client";

// for vercel deployment
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const formData = await req.formData();
    const prompt = formData.get("prompt")?.toString() ?? "";
    const imageFile = formData.get("image") as File | null;

    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    if (!imageFile) return NextResponse.json({ error: "Image is required" }, { status: 400 });

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");

    const result = await client.predict("/infer", {
      input_image: imageFile,
      prompt: prompt,
      seed: 0,
      randomize_seed: true,
      guidance_scale: 2.5,
      steps: 14,
    });
    // Explicitly type result.data as an array of objects with a url property
    const data = result.data as { url: string }[];
    const outputUrl = data[0]?.url;

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json({ url: outputUrl });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
