import { customFileRouter } from "@/services/uploadthing/router";
import { createRouteHandler } from "uploadthing/next";
import { rateLimit, rateLimitConfigs } from "@/lib/rateLimiting";
import { NextRequest, NextResponse } from "next/server";

const uploadRateLimit = rateLimit(rateLimitConfigs.moderate);

const handlers = createRouteHandler({
  router: customFileRouter,
});

export async function GET(request: NextRequest) {
  const rateLimitResult = await uploadRateLimit(request);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    );
  }

  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await uploadRateLimit(request);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    );
  }

  return handlers.POST(request);
}
