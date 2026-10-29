import { auth } from "@/auth";
import { isAIConfigured } from "@/lib/ai";
import { Card, PageHeader } from "@/components/ui";
import { AssistantChat } from "./chat";

export default async function AssistantPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "You";

  return (
    <div>
      <PageHeader title="AI Assistant" subtitle="Ask questions about leads, deals, properties and developers" />

      {isAIConfigured() ? (
        <AssistantChat userName={userName} />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            The AI assistant isn&apos;t configured yet. Add{" "}
            <code className="rounded bg-slate-50 px-1 py-0.5">ANTHROPIC_API_KEY</code> to your .env file to enable it.
          </p>
        </Card>
      )}
    </div>
  );
}
