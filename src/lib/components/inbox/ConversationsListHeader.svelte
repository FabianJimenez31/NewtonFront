<script lang="ts">
    import { cn } from "$lib/utils";
    import { Search } from "lucide-svelte";
    import { Input, Badge } from "$lib/components/ui";
    import type { Snippet } from "svelte";

    interface Props {
        activeTab: "all" | "mine" | "unassigned";
        searchQuery: string;
        totalUnread: number;
        counts: { all: number; mine: number; unassigned: number };
        onTabChange: (tab: "all" | "mine" | "unassigned") => void;
        onSearchChange: (query: string) => void;
        filters?: Snippet;
        class?: string;
    }

    let {
        activeTab,
        searchQuery,
        totalUnread,
        counts,
        onTabChange,
        onSearchChange,
        filters,
        class: className,
    }: Props = $props();

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }
</script>

<div class={cn("flex flex-col border-b border-border", className)}>
    <!-- Header & Search -->
    <div class="p-4 pb-2">
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-foreground">
                Conversaciones
            </h2>
            {#if totalUnread > 0}
                <Badge variant="default">{totalUnread}</Badge>
            {/if}
        </div>

        <div class="relative">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                oninput={handleSearchInput}
                class="pl-9"
            />
        </div>
    </div>

    <!-- Tabs -->
    <div class="px-4 pb-3">
        <div
            class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full"
        >
            <button
                type="button"
                class={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1",
                    activeTab === "all"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/50",
                )}
                onclick={() => onTabChange("all")}
            >
                Todas
                {#if counts.all > 0}
                    <Badge variant="secondary" class="ml-2">{counts.all}</Badge>
                {/if}
            </button>
            <button
                type="button"
                class={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1",
                    activeTab === "mine"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/50",
                )}
                onclick={() => onTabChange("mine")}
            >
                Mías
                {#if counts.mine > 0}
                    <Badge variant="secondary" class="ml-2">{counts.mine}</Badge
                    >
                {/if}
            </button>
            <button
                type="button"
                class={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all flex-1",
                    activeTab === "unassigned"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/50",
                )}
                onclick={() => onTabChange("unassigned")}
            >
                Sin asignar
                {#if counts.unassigned > 0}
                    <Badge variant="secondary" class="ml-2"
                        >{counts.unassigned}</Badge
                    >
                {/if}
            </button>
        </div>
    </div>

    <!-- Filters Slot -->
    {#if filters}
        <div class="px-4 py-2 border-t border-border">
            {@render filters()}
        </div>
    {/if}
</div>
