import { NextResponse } from "next/server";

export function successResponse(data: any, meta?: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: details || [],
      },
    },
    { status }
  );
}