<script lang="ts">
    import { cn } from "$lib/utils";
    import { Inbox, User, HelpCircle, Layers } from "lucide-svelte";
    import type { Stage } from "$lib/types/kanban";

    interface Props {
        activeView: string; // 'all', 'mine', 'unassigned', or stageId
        counts: { all: number; mine: number; unassigned: number };
        stages: Stage[];
        onSelect: (view: string) => void;
        collapsed?: boolean;
        class?: string;
    }

    let {
        activeView,
        counts,
        stages,
        onSelect,
        collapsed = false,
        class: className,
    }: Props = $props();

    const mainViews = [
        { id: "all", label: "Todas", icon: Inbox, count: counts.all },
        { id: "mine", label: "Mías", icon: User, count: counts.mine },
        {
            id: "unassigned",
            label: "Sin asignar",
            icon: HelpCircle,
            count: counts.unassigned,
        },
    ];
</script>

<div
    class={cn(
        "flex flex-col h-full bg-muted/10 border-r border-border/60 flex-shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px] items-center" : "w-64",
        className,
    )}
>
    <div class={cn("p-4", collapsed && "px-2")}>
        {#if !collapsed}
            <h2 class="text-lg font-semibold px-2 mb-4 flex items-center gap-2">
                <div
                    class="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center"
                >
                    <Inbox class="h-4 w-4" />
                </div>
                Inbox
            </h2>
        {:else}
            <div class="mb-4 flex justify-center">
                <div
                    class="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center"
                >
                    <Inbox class="h-5 w-5" />
                </div>
            </div>
        {/if}

        <nav class="space-y-1">
            {#each mainViews as view}
                {@const Icon = view.icon}
                <button
                    class={cn(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        collapsed
                            ? "justify-center px-0 py-3"
                            : "justify-between",
                        activeView === view.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onclick={() => onSelect(view.id)}
                    title={collapsed ? view.label : undefined}
                >
                    <div
                        class={cn(
                            "flex items-center gap-3",
                            collapsed && "gap-0",
                        )}
                    >
                        <Icon class={cn("h-4 w-4", collapsed && "h-5 w-5")} />
                        {#if !collapsed}
                            {view.label}
                        {/if}
                    </div>
                    {#if !collapsed && view.count > 0}
                        <span class="text-xs font-mono opacity-70"
                            >{view.count}</span
                        >
                    {/if}
                </button>
            {/each}
        </nav>
    </div>

    <div
        class={cn("p-4 pt-0 mt-2 overflow-y-auto flex-1", collapsed && "px-2")}
    >
        {#if !collapsed}
            <h3
                class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-2"
            >
                <Layers class="h-3 w-3" />
                Ciclo de Vida
            </h3>
        {:else}
            <div class="w-full h-px bg-border/50 mb-4"></div>
        {/if}

        <nav class="space-y-1">
            {#each stages as stage}
                <button
                    class={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        collapsed ? "justify-center px-0 py-3" : "",
                        activeView === stage.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onclick={() => onSelect(stage.id)}
                    title={collapsed ? stage.name : undefined}
                >
                    <div
                        class={cn(
                            "rounded-full flex-shrink-0",
                            collapsed ? "h-3 w-3" : "h-2 w-2",
                        )}
                        style="background-color: {stage.color}"
                    ></div>
                    {#if !collapsed}
                        <span class="truncate">{stage.name}</span>
                    {/if}
                </button>
            {/each}
        </nav>
    </div>

    <!-- Bottom User Section (Optional, can be added later) -->
    <div class="p-4 border-t border-border/60">
        <div
            class={cn(
                "flex items-center gap-3 px-2",
                collapsed && "justify-center px-0",
            )}
        >
            <div
                class="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
            >
                <User class="h-4 w-4 text-muted-foreground" />
            </div>
            {#if !collapsed}
                <div class="flex flex-col">
                    <span class="text-sm font-medium">Mi Cuenta</span>
                    <span class="text-xs text-muted-foreground"
                        >Configuración</span
                    >
                </div>
            {/if}
        </div>
    </div>
</div>
