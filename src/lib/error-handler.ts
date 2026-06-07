export function handleApiError(error: any) {
  console.error("API Error:", error);

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: error.message || "Something went wrong",
  };
}