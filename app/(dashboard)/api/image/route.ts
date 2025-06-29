import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
// import OpenAI from "openai";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { GoogleGenAI, Modality } from "@google/genai"

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});


// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// for vercel deployment
export const runtime = "nodejs";
export const maxDuration = 60; 

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // const response = await openai.images.generate({
    //   model: "dall-e-3",
    //   prompt,
    //   n: parseInt(amount, 10),
    //   size: resolution,
    // });

    const responses = [];

    for (let i = 0; i < amount; i++) {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          console.warn("No candidates returned.");
          continue;
        }

        const candidate = candidates[0];
        const parts = candidate?.content?.parts;

        if (!parts || parts.length === 0) {
          console.warn("No parts in the response.");
          continue;
        }

        const imagePart = parts.find((p) => p.inlineData?.data);

        if (imagePart && imagePart.inlineData?.data) {
          responses.push({
            base64Image: imagePart.inlineData.data,
          });
        } else {
          console.warn("No image data found in parts.");
        }
    }

    if (!isPro) {
      await incrementApiLimit();
    }

    // return NextResponse.json(response.data);
    return NextResponse.json({ data: responses });
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};