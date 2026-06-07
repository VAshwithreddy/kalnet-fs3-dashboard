import { successResponse, errorResponse } from "@/lib/api-response";
import { getReport } from "@/services/reports.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as any;
    const from = new Date(searchParams.get("from")!);
    const to = new Date(searchParams.get("to")!);

    const data = await getReport(type, from, to);

    return successResponse(data);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}