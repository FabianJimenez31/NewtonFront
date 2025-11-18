<script lang="ts">
    import { cn } from "$lib/utils";
    import { Info } from "lucide-svelte";

    interface Props {
        content: string;
        timestamp?: string;
        icon?: any; // Lucide icon component
    }

    let { content, timestamp, icon: Icon = Info }: Props = $props();

    // Format time if provided
    const formattedTime = $derived(
        timestamp
            ? new Date(timestamp).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              })
            : "",
    );
</script>

<div class="flex flex-col items-center justify-center py-4 space-y-1">
    {#if timestamp}
        <span
            class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-background px-2 relative z-10"
        >
            {formattedTime}
        </span>
    {/if}

    <div
        class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full"
    >
        <Icon class="h-3 w-3 opacity-70" />
        <span>{content}</span>
    </div>
</div>
