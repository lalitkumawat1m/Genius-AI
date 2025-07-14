import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const fileUrl = req.nextUrl.searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return new NextResponse("Failed to fetch audio file", { status: 500 });
    }

    const contentType = response.headers.get("content-type") || "audio/wav";

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
