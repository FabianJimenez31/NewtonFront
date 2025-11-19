<script lang="ts">
    import { cn } from "$lib/utils";
    import { Search } from "lucide-svelte";
    import { Input } from "$lib/components/ui";
    import type { Snippet } from "svelte";

    interface Props {
        searchQuery: string;
        onSearchChange: (query: string) => void;
        filters?: Snippet;
        class?: string;
    }

    let {
        searchQuery,
        onSearchChange,
        filters,
        class: className,
    }: Props = $props();

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }
</script>

<div
    class={cn(
        "flex flex-col gap-2 p-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
    )}
>
    <!-- Top Row: Search + Filter -->
    <div class="flex items-center gap-2">
        <div class="relative flex-1">
            <Search
                class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                oninput={handleSearchInput}
                class="pl-8 h-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
            />
        </div>
        {#if filters}
            {@render filters()}
        {/if}
    </div>
</div>
