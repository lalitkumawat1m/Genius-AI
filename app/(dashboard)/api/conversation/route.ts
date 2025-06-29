import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
// import  OpenAI from "openai";
import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY!});

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//  maxRetries:10
// });
export const runtime = "nodejs";
export const maxDuration = 60; 

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages  } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }


    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages,
    // },
    // {
    //   maxRetries:5
    // }
    // );

    // Prepare prompt for Gemini (concatenate messages)
    const prompt = messages.map((msg: any) => msg.content).join('\n');

     // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
     
    if (!isPro) {
      await incrementApiLimit();
    }

    // return NextResponse.json(response.choices[0].message);
        return NextResponse.json({content:response.text});
  //  added comment for redeployment on vercel

} catch (error) {
    console.log('[CONVERSATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};