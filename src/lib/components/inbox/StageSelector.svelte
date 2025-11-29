<script lang="ts">
    import { Badge } from "$lib/components/ui";
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
    } from "$lib/components/ui";
    import { ChevronDown } from "lucide-svelte";
    import { cn } from "$lib/utils";

    interface Stage {
        id: string;
        name: string;
        color?: string;
    }

    interface Props {
        currentStageId?: string;
        stages: Stage[];
        onSelect: (stageId: string) => void;
        class?: string;
    }

    let {
        currentStageId,
        stages = [],
        onSelect,
        class: className,
    }: Props = $props();

    const currentStage = $derived(
        stages.find((s) => s.id === currentStageId) ||
            stages.find((s) => s.name === currentStageId),
    );
</script>

<DropdownMenu>
    <DropdownMenuTrigger>
        <Badge
            variant="outline"
            class={cn(
                "cursor-pointer hover:bg-accent transition-colors flex items-center gap-1 pr-1",
                className,
            )}
            style={currentStage?.color
                ? `border-color: ${currentStage.color}; color: ${currentStage.color}`
                : ""}
        >
            <span
                class="w-2 h-2 rounded-full mr-1"
                style="background-color: {currentStage?.color || 'gray'}"
            ></span>
            {currentStage?.name || "Sin etapa"}
            <ChevronDown class="h-3 w-3 opacity-50 ml-1" />
        </Badge>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
        {#each stages as stage}
            <DropdownMenuItem
                onclick={() => onSelect(stage.id)}
                class="flex items-center gap-2"
            >
                <div
                    class="w-2 h-2 rounded-full"
                    style="background-color: {stage.color || 'gray'}"
                ></div>
                {stage.name}
            </DropdownMenuItem>
        {/each}
    </DropdownMenuContent>
</DropdownMenu>
