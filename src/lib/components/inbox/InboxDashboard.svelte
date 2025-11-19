<script lang="ts">
    import {
        MessageSquare,
        AlertCircle,
        Clock,
        TrendingUp,
        Activity,
    } from "lucide-svelte";
    import { onMount } from "svelte";

    interface Props {
        stats?: {
            unread: number;
            highPriority: number;
            open: number;
        };
        userName?: string;
        onQuickFilter?: (type: string) => void;
    }

    let {
        stats = { unread: 0, highPriority: 0, open: 0 },
        userName = "Usuario",
        onQuickFilter,
    }: Props = $props();

    const metrics = [
        {
            label: "Sin leer",
            value: stats.unread,
            icon: MessageSquare,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            filter: "unread",
        },
        {
            label: "Alta prioridad",
            value: stats.highPriority,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            filter: "priority",
        },
        {
            label: "Seguimiento",
            value: stats.open,
            icon: Clock,
            color: "text-violet-600",
            bgColor: "bg-violet-50",
            filter: "all",
        },
    ];
</script>

<div class="h-full w-full overflow-y-auto">
    <div class="max-w-4xl mx-auto px-8 py-16 space-y-12">
        <!-- Welcome -->
        <div class="space-y-3">
            <h1 class="text-2xl text-foreground/90 tracking-tight">
                Hola, {userName}
            </h1>
            <p class="text-[15px] text-muted-foreground leading-relaxed">
                Tu bandeja de entrada está lista. Selecciona una conversación
                para comenzar.
            </p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-3 gap-6">
            {#each metrics as metric}
                {@const Icon = metric.icon}
                <button
                    class="group text-left p-5 rounded-lg border border-border/40 hover:border-border/60 bg-background hover:bg-accent/30 transition-all duration-200"
                    onclick={() => onQuickFilter?.(metric.filter)}
                >
                    <div class="flex items-start gap-3">
                        <div
                            class="p-2 rounded-md {metric.bgColor} flex-shrink-0"
                        >
                            <Icon class="h-4 w-4 {metric.color}" />
                        </div>
                        <div class="flex-1 min-w-0 space-y-1">
                            <div class="text-2xl tabular-nums tracking-tight">
                                {metric.value.toLocaleString()}
                            </div>
                            <div
                                class="text-[13px] text-muted-foreground truncate"
                            >
                                {metric.label}
                            </div>
                        </div>
                    </div>
                </button>
            {/each}
        </div>

        <!-- Insights (Optional) -->
        <div class="pt-4">
            <div
                class="flex items-center gap-2 text-[13px] text-muted-foreground mb-4"
            >
                <Activity class="h-3.5 w-3.5" />
                <span>Actividad reciente</span>
            </div>
            <div class="space-y-3">
                <div
                    class="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                    <div class="space-y-1">
                        <div class="text-[13px] text-muted-foreground">
                            Conversaciones totales
                        </div>
                        <div class="text-lg tabular-nums tracking-tight">
                            {stats.open.toLocaleString()}
                        </div>
                    </div>
                    <TrendingUp class="h-5 w-5 text-muted-foreground/30" />
                </div>
            </div>
        </div>

        <!-- Help Text -->
        <div class="pt-8 border-t border-border/40">
            <p class="text-[13px] text-muted-foreground/70 text-center">
                Usa la barra lateral para filtrar por etapa del ciclo de vida o
                tipo de conversación
            </p>
        </div>
    </div>
</div>
