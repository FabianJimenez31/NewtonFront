<script lang="ts">
    import { cn } from "$lib/utils";
    import { Inbox, User, HelpCircle, Layers, Calendar } from "lucide-svelte";
    import { Badge } from "$lib/components/ui";
    import type { Stage } from "$lib/types/kanban";

    import {
        stageStatsStore,
        type DateFilter,
    } from "$lib/stores/stage-stats.store";
    import { sortedStages } from "$lib/stores/kanban.core.store";

    interface Props {
        activeView: string;
        counts: { all: number; mine: number; unassigned: number };
        onSelect: (view: string) => void;
        onDateFilterChange: (
            filter: DateFilter,
            customRange?: { start: Date | null; end: Date | null },
        ) => void;
        collapsed?: boolean;
        class?: string;
    }

    let props: Props = $props();

    let collapsed = $derived(props.collapsed ?? false);
    let activeView = $derived(props.activeView);
    let counts = $derived(props.counts);
    let className = $derived(props.class);

    // Functions
    const onSelect = (view: string) => props.onSelect(view);

    // Subscribe to stage stats
    let stats = $derived($stageStatsStore);

    function handleDateFilterChange(value: DateFilter) {
        console.log("[SIDEBAR] Date filter changed to:", value);
        if (value === "custom") {
            stageStatsStore.setFilter("custom");
            // Don't trigger load yet, wait for dates
        } else {
            props.onDateFilterChange(value);
        }
    }

    function handleCustomDateChange(type: "start" | "end", value: string) {
        const date = value ? new Date(value) : null;
        const currentRange = stats.customRange || { start: null, end: null };
        const newRange = { ...currentRange, [type]: date };

        stageStatsStore.setCustomRange(newRange.start, newRange.end);

        if (newRange.start && newRange.end) {
            props.onDateFilterChange("custom", newRange);
        }
    }

    // Date filter options
    const dateFilterOptions = [
        { value: "all", label: "Todas" },
        { value: "2days", label: "2 días" },
        { value: "3days", label: "3 días" },
        { value: "1week", label: "1 semana" },
        { value: "custom", label: "Personalizado" },
    ] as const;

    // Combine stages with counts from store
    let stagesWithLeads = $derived(
        $sortedStages
            .map((stage) => ({
                ...stage,
                leadCount: stats.counts[stage.id] || 0,
            }))
            .filter((stage) => stage.leadCount > 0),
    );

    // Calculate total leads across all stages
    let totalStageLeads = $derived(
        stagesWithLeads.reduce((sum, stage) => sum + stage.leadCount, 0),
    );

    // Calculate percentage for each stage
    function getStagePercentage(leadCount: number): number {
        if (totalStageLeads === 0) return 0;
        return Math.round((leadCount / totalStageLeads) * 100);
    }

    // Get emoji for stage based on name keywords
    function getStageEmoji(stageName: string): string {
        const name = stageName.toLowerCase();

        // Mapeo de palabras clave a emojis
        if (
            name.includes("exploración") ||
            name.includes("exploracion") ||
            name.includes("prospecto")
        )
            return "🔍";
        if (name.includes("calificad") || name.includes("cualificad"))
            return "✅";
        if (
            name.includes("propuesta") ||
            name.includes("cotización") ||
            name.includes("cotizacion")
        )
            return "📋";
        if (name.includes("negociación") || name.includes("negociacion"))
            return "🤝";
        if (
            name.includes("cerrad") ||
            name.includes("ganado") ||
            name.includes("éxito") ||
            name.includes("exito")
        )
            return "🎉";
        if (name.includes("perdid") || name.includes("descartad")) return "❌";
        if (name.includes("contacto") || name.includes("inicial")) return "👋";
        if (name.includes("seguimiento")) return "📞";
        if (
            name.includes("demo") ||
            name.includes("presentación") ||
            name.includes("presentacion")
        )
            return "🎯";

        // Default emoji
        return "📌";
    }

    // Get badge color based on percentage
    function getPercentageBadgeClass(percentage: number): string {
        if (percentage >= 30) {
            // High percentage - Green/Success
            return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
        } else if (percentage >= 15) {
            // Medium percentage - Yellow/Warning
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        } else {
            // Low percentage - Blue/Info
            return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
        }
    }

    let mainViews = $derived([
        { id: "all", label: "Todas", icon: Inbox, count: counts.all },
        { id: "mine", label: "Mías", icon: User, count: counts.mine },
        {
            id: "unassigned",
            label: "Sin asignar",
            icon: HelpCircle,
            count: counts.unassigned,
        },
    ]);
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
            <!-- Date Filter -->
            <div class="px-2 mb-3">
                <div class="flex items-center gap-1.5 mb-2">
                    <Calendar class="h-3 w-3 text-muted-foreground" />
                    <span
                        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                        Período
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-1 mb-2">
                    {#each dateFilterOptions as option}
                        <button
                            class={cn(
                                "px-2 py-1 text-[10px] font-medium rounded border-2 transition-colors",
                                stats.activeFilter === option.value
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-background text-foreground hover:bg-muted",
                            )}
                            style="border-color: #602B5D;"
                            onclick={() =>
                                handleDateFilterChange(
                                    option.value as DateFilter,
                                )}
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>

                {#if stats.activeFilter === "custom"}
                    <div
                        class="rounded-md border border-border/60 p-2 bg-background/50 mb-2 animate-in slide-in-from-top-1 duration-200"
                    >
                        <div class="grid grid-cols-2 gap-2">
                            <div class="flex flex-col gap-1">
                                <label
                                    for="start-date"
                                    class="text-[9px] text-muted-foreground font-medium"
                                    >Desde</label
                                >
                                <input
                                    type="date"
                                    id="start-date"
                                    class="h-6 w-full rounded border border-border bg-background px-1 text-[10px]"
                                    onchange={(e) =>
                                        handleCustomDateChange(
                                            "start",
                                            e.currentTarget.value,
                                        )}
                                />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label
                                    for="end-date"
                                    class="text-[9px] text-muted-foreground font-medium"
                                    >Hasta</label
                                >
                                <input
                                    type="date"
                                    id="end-date"
                                    class="h-6 w-full rounded border border-border bg-background px-1 text-[10px]"
                                    onchange={(e) =>
                                        handleCustomDateChange(
                                            "end",
                                            e.currentTarget.value,
                                        )}
                                />
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Stages Header -->
            <div
                class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2 flex items-center gap-2"
            >
                <Layers class="h-3.5 w-3.5" />
                <span>Etapas</span>
                {#if totalStageLeads > 0}
                    <span class="ml-auto font-mono text-[10px] opacity-60"
                        >{totalStageLeads}</span
                    >
                {/if}
            </div>
        {:else}
            <div class="w-full h-px bg-border/50 mb-4"></div>
        {/if}

        <nav class="space-y-1">
            {#if stats.isLoading}
                {#each Array(8) as _}
                    <div
                        class={cn(
                            "w-full grid gap-2 px-2.5 py-2 rounded-md animate-pulse",
                            collapsed
                                ? "grid-cols-1 place-items-center px-0 py-3"
                                : "grid-cols-[1fr_40px_60px]",
                        )}
                    >
                        <!-- Left: Icon + Name Skeleton -->
                        <div class="flex items-center gap-2 min-w-0 w-full">
                            <div
                                class="h-4 w-4 rounded bg-muted/50 flex-shrink-0"
                            ></div>
                            <div
                                class="h-2 w-2 rounded-full bg-muted/50 flex-shrink-0"
                            ></div>
                            {#if !collapsed}
                                <div class="h-3 bg-muted/50 rounded w-24"></div>
                            {/if}
                        </div>

                        <!-- Center: Count Skeleton -->
                        {#if !collapsed}
                            <div class="flex justify-end">
                                <div class="h-3 bg-muted/50 rounded w-6"></div>
                            </div>
                        {/if}

                        <!-- Right: Percentage Skeleton -->
                        {#if !collapsed}
                            <div class="flex justify-end">
                                <div class="h-5 bg-muted/50 rounded w-10"></div>
                            </div>
                        {/if}
                    </div>
                {/each}
                {#if !collapsed}
                    <div
                        class="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground animate-pulse"
                    >
                        <div
                            class="h-2 w-2 bg-primary/50 rounded-full animate-bounce"
                        ></div>
                        <div
                            class="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]"
                        ></div>
                        <div
                            class="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]"
                        ></div>
                        <span class="ml-1">Actualizando datos...</span>
                    </div>
                {/if}
            {:else}
                {#each stagesWithLeads as stage}
                    {@const leadCount = stage.leadCount || 0}
                    {@const percentage = getStagePercentage(leadCount)}
                    {@const emoji = getStageEmoji(stage.name)}
                    <button
                        class={cn(
                            "w-full grid gap-2 px-2.5 py-2 text-sm rounded-md transition-colors",
                            collapsed
                                ? "grid-cols-1 place-items-center px-0 py-3"
                                : "grid-cols-[1fr_40px_60px]",
                            activeView === stage.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted hover:text-foreground",
                        )}
                        onclick={() => onSelect(stage.id)}
                        title={collapsed
                            ? `${emoji} ${stage.name} (${leadCount})`
                            : undefined}
                    >
                        <!-- Left: Emoji + Color + Name -->
                        <div class="flex items-start gap-2 min-w-0">
                            <span
                                class="text-sm flex-shrink-0 leading-tight mt-0.5"
                                >{emoji}</span
                            >
                            <div
                                class={cn(
                                    "rounded-full flex-shrink-0 mt-1.5",
                                    collapsed ? "h-3 w-3" : "h-2 w-2",
                                )}
                                style="background-color: {stage.color}"
                            ></div>
                            {#if !collapsed}
                                <span
                                    class="text-sm font-normal leading-tight break-words text-left"
                                    >{stage.name}</span
                                >
                            {/if}
                        </div>

                        <!-- Center: Lead Count (fixed width, right-aligned) -->
                        {#if !collapsed && leadCount > 0}
                            <div class="flex items-start justify-end mt-0.5">
                                <span
                                    class="text-xs font-medium text-foreground tabular-nums"
                                    >{leadCount}</span
                                >
                            </div>
                        {:else if !collapsed}
                            <div></div>
                        {/if}

                        <!-- Right: Percentage Badge (fixed width) -->
                        {#if !collapsed && leadCount > 0}
                            <div class="flex items-start justify-end mt-0.5">
                                <Badge
                                    variant="outline"
                                    class={cn(
                                        "text-[10px] font-medium px-1.5 py-0 h-5 border tabular-nums w-full justify-center",
                                        getPercentageBadgeClass(percentage),
                                    )}
                                >
                                    {percentage}%
                                </Badge>
                            </div>
                        {:else if !collapsed}
                            <div></div>
                        {/if}
                    </button>
                {/each}
            {/if}
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
