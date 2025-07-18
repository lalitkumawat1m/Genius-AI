import Replicate from "replicate";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { client } from "@gradio/client";

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN!,
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
    const { prompt  } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }
     

    // const response = await replicate.run(
    //   "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
    //   {
    //     input: {
    //       prompt_a: prompt
    //     }
    //   }
    // );

    	
						
	const app = await client("https://facebook-musicgen.hf.space/");
	const response = await app.predict(0, [		
				prompt, // string  in 'Describe your music' Textbox component
	]);


    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.log('[MUSIC_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};