// The one place a component asks for the network, so tests and local dev can
// swap it. Production never sets the flag, so this is plain `fetch`.
//
//   NEXT_PUBLIC_MOCK_API=1 npm run dev   -> every call below is answered by src/lib/mocks/http.ts

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (process.env.NEXT_PUBLIC_MOCK_API === "1") {
    return import("./mocks/http").then((m) => m.mockFetch(input, init));
  }
  return fetch(input, init);
}
