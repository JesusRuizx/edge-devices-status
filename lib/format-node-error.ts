/** Short, URL-safe message for `?auth_error=` redirects and API error bodies. */
export function formatErrorForAuthRedirect(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim().slice(0, 200);
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim().slice(0, 200);
  }
  return "auth_failed";
}
