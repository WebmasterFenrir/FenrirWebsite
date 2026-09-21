import type { ElementType } from "react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface IconCardProps {
  icon: ElementType;
  title: string;
  description: string;
  variant?: "default" | "subtle";
}

export function IconCard({
  icon: Icon,
  title,
  description,
  variant = "default",
}: IconCardProps) {
  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-border text-foreground transition-all duration-300 hover:border-primary/30",
        variant === "subtle"
          ? "bg-card/50 hover:bg-card/80"
          : "bg-card hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          variant === "subtle" && "bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_60%)]"
        )}
      />
      <CardContent className="relative flex h-full flex-col gap-4 p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-hover:text-primary/80">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
