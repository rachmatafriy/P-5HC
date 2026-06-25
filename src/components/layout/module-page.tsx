import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

/**
 * Reusable scaffold for a feature module. Renders the module title, a short
 * description, the planned capabilities, and a "roadmap" badge. As modules are
 * implemented, their page replaces this scaffold with real UI.
 */
export function ModulePage({
  title,
  description,
  capabilities,
  status = "Scaffolded",
}: {
  title: string;
  description: string;
  capabilities: string[];
  status?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary">{status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {capabilities.map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2 text-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
