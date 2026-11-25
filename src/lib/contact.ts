// The contact form's logic, kept out of the component so it can be run in a test
// with a fake network. Nothing here touches the DOM or imports React.

export const WEB3FORMS_URL = "https://api.web3forms.com/submit";
export const CONTACT_TIMEOUT_MS = 10000;

export type ContactResult =
  | { kind: "sent" }
  /** No relay key is configured: hand the message to the visitor's mail app. */
  | { kind: "mailto"; href: string }
  | { kind: "error"; reason: "http" | "timeout" | "network"; status?: number };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function mailtoHref(to: string, name: string, email: string, message: string): string {
  const body = `${message}\n\n— ${name} (${email})`;
  return `mailto:${to}?subject=${encodeURIComponent("Hello from atishay.tech")}&body=${encodeURIComponent(body)}`;
}

/**
 * Sends the form through Web3Forms when a key is set, otherwise returns a
 * mailto link. A relay that never answers ends in a "timeout" result instead of
 * leaving the button disabled for good.
 */
export async function submitContact(
  data: FormData,
  opts: { key: string; to: string; fetchImpl?: FetchLike; timeoutMs?: number },
): Promise<ContactResult> {
  const name = (data.get("name") as string) || "someone";
  const mail = (data.get("email") as string) || "no email — anonymous";

  if (!opts.key) {
    return { kind: "mailto", href: mailtoHref(opts.to, name, mail, String(data.get("message") ?? "")) };
  }

  const doFetch: FetchLike = opts.fetchImpl ?? ((u, i) => fetch(u, i));
  const ms = opts.timeoutMs ?? CONTACT_TIMEOUT_MS;
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Raced as well as aborted: a fetch that ignores its signal must still lose.
  const timedOut = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => {
      ctrl.abort();
      resolve("timeout");
    }, ms);
  });

  try {
    const res = await Promise.race([
      doFetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: ctrl.signal,
      }),
      timedOut,
    ]);
    if (res === "timeout") return { kind: "error", reason: "timeout" };
    return res.ok ? { kind: "sent" } : { kind: "error", reason: "http", status: res.status };
  } catch {
    return { kind: "error", reason: ctrl.signal.aborted ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

/** True when the text reached the clipboard. False means the caller should leave the text selectable. */
export async function copyText(
  text: string,
  clipboard: { writeText?: (t: string) => Promise<void> } | undefined = typeof navigator === "undefined" ? undefined : navigator.clipboard,
): Promise<boolean> {
  if (!clipboard?.writeText) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
