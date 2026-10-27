import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGoogleConfigured } from "@/lib/google";
import { Badge, Card, PageHeader } from "@/components/ui";
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
  const configured = isGoogleConfigured();

  const connection = session?.user
    ? await prisma.googleConnection.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Integrations" />

      {connected && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Google Calendar connected successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Google Calendar</p>
            <p className="mt-1 text-sm text-slate-500">
              Sync meetings and property viewings to your Google Calendar.
            </p>
            {connection && (
              <p className="mt-2 text-xs text-slate-400">Connected as {connection.googleEmail}</p>
            )}
          </div>

          <div>
            {connection ? (
              <div className="flex items-center gap-3">
                <Badge color="green">Connected</Badge>
                <form action={disconnectGoogle}>
                  <button className="text-sm font-medium text-red-600 hover:underline">
                    Disconnect
                  </button>
                </form>
              </div>
            ) : configured ? (
              <a
                href="/api/integrations/google/connect"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
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
    </div>
  );
}
