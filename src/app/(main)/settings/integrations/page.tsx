import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGoogleConfigured } from "@/lib/google";
import { isWhatsAppConfigured, getWebhookUrl } from "@/lib/whatsapp";
import { canManageUsers } from "@/lib/permissions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { CalendarIcon, MessageIcon } from "@/components/icons";
import { disconnectGoogle } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Google integration isn't configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
  invalid_state: "The Google sign-in request expired or was invalid. Please try connecting again.",
  no_refresh_token: "Google didn't return offline access. Disconnect any prior grant at myaccount.google.com/permissions and try again.",
  exchange_failed: "Something went wrong completing the Google connection. Please try again.",
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const session = await auth();

  if (!session?.user || !canManageUsers(session.user.role)) {
    return (
      <div>
        <PageHeader title="Integrations" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            You don&apos;t have permission to manage integrations. This is restricted to Super Admin,
            Managing Director, Sales Director, CRM Admin and HR/Operations roles.
          </p>
        </Card>
      </div>
    );
  }

  const configured = isGoogleConfigured();

  const connection = session?.user
    ? await prisma.googleConnection.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Integrations" />

      {connected && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Google Calendar connected successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarIcon size={18} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Google Calendar</p>
              <p className="mt-1 text-sm text-slate-500">
                Sync meetings and property viewings to your Google Calendar.
              </p>
              {connection && (
                <p className="mt-2 text-xs text-slate-400">Connected as {connection.googleEmail}</p>
              )}
            </div>
          </div>

          <div>
            {connection ? (
              <div className="flex items-center gap-3">
                <Badge color="green">Connected</Badge>
                <form action={disconnectGoogle}>
                  <button className="text-sm font-medium text-rose-600 hover:underline">
                    Disconnect
                  </button>
                </form>
              </div>
            ) : configured ? (
              <a
                href="/api/integrations/google/connect"
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Connect Google Calendar
              </a>
            ) : (
              <Badge color="amber">Not configured</Badge>
            )}
          </div>
        </div>

        {!configured && (
          <p className="mt-4 text-xs text-slate-400">
            Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file to enable this.
          </p>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MessageIcon size={18} />
            </div>
            <div>
              <p className="font-medium text-slate-900">WhatsApp Business</p>
              <p className="mt-1 text-sm text-slate-500">
                Shared team inbox for WhatsApp leads and client conversations.
              </p>
            </div>
          </div>
          {isWhatsAppConfigured() ? <Badge color="green">Configured</Badge> : <Badge color="amber">Not configured</Badge>}
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-500">
          <p>Set these in your .env file (see README for the full Meta setup steps):</p>
          <code className="block rounded bg-slate-50 p-2 text-slate-700">
            WHATSAPP_PHONE_NUMBER_ID=&quot;...&quot;<br />
            WHATSAPP_ACCESS_TOKEN=&quot;...&quot;<br />
            WHATSAPP_VERIFY_TOKEN=&quot;choose-any-string&quot;<br />
            WHATSAPP_APP_SECRET=&quot;...&quot;
          </code>
          <p>
            Webhook callback URL to register in the Meta App dashboard:{" "}
            <code className="rounded bg-slate-50 px-1 py-0.5 text-slate-700">{getWebhookUrl()}</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
