export function getPagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}