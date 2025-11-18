<script lang="ts">
    import { cn } from "$lib/utils";
    import {
        Avatar,
        AvatarImage,
        AvatarFallback,
        Button,
    } from "$lib/components/ui";
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
    } from "$lib/components/ui";
    import {
        ChevronDown,
        User,
        UserPlus,
        Tag,
        MoreVertical,
        Phone,
        Video,
    } from "lucide-svelte";
    import type { Agent } from "$lib/types/inbox.types";

    interface Contact {
        id: string;
        name: string;
        avatarUrl?: string;
        status?: "online" | "offline";
        stage?: string;
        assignedAgent?: Agent;
    }

    interface Stage {
        id: string;
        name: string;
        color?: string;
    }

    interface Props {
        contact: Contact;
        agents?: Agent[];
        stages?: Stage[];
        onAssign?: (agentId: string) => void;
        onStageChange?: (stageId: string) => void;
        class?: string;
    }

    let {
        contact,
        agents = [],
        stages = [],
        onAssign,
        onStageChange,
        class: className,
    }: Props = $props();

    const displayName = $derived(
        contact.name === "Sin nombre" && contact.assignedAgent
            ? contact.assignedAgent.name
            : contact.name,
    );

    const initials = $derived(
        displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2),
    );

    const currentStage = $derived(
        stages.find((s) => s.name === contact.stage) || {
            name: contact.stage,
            color: "#71276f",
        },
    );
</script>

<div
    class={cn(
        "flex items-center justify-between px-6 py-3 border-b border-border bg-background",
        className,
    )}
>
    <!-- Left: Contact Info -->
    <div class="flex items-center gap-3">
        <Avatar class="h-10 w-10 border border-border">
            {#if contact.avatarUrl}
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
            {/if}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div class="flex flex-col">
            <h3
                class="text-sm font-semibold text-foreground flex items-center gap-2"
            >
                {displayName}
                {#if contact.stage}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div
                                class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                                style="background-color: {currentStage.color}20; color: {currentStage.color}; border: 1px solid {currentStage.color}40;"
                            >
                                {contact.stage}
                                <ChevronDown class="h-3 w-3 opacity-50" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Cambiar etapa</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {#each stages as stage}
                                <DropdownMenuItem
                                    onclick={() => onStageChange?.(stage.id)}
                                >
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-2 h-2 rounded-full"
                                            style="background-color: {stage.color}"
                                        ></div>
                                        <span>{stage.name}</span>
                                    </div>
                                </DropdownMenuItem>
                            {/each}
                        </DropdownMenuContent>
                    </DropdownMenu>
                {/if}
            </h3>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                    {#if contact.assignedAgent}
                        <User class="h-3 w-3" />
                        Asignado a
                        <span class="font-medium text-foreground"
                            >{contact.assignedAgent.name}</span
                        >
                    {:else}
                        <UserPlus class="h-3 w-3" />
                        Sin asignar
                    {/if}
                </span>

                <!-- Assignee Dropdown -->
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <button
                            class="text-xs text-primary hover:underline ml-1"
                        >
                            Cambiar
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Asignar agente</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onclick={() => onAssign?.("")}>
                            <span class="text-muted-foreground"
                                >Sin asignar</span
                            >
                        </DropdownMenuItem>
                        {#each agents as agent}
                            <DropdownMenuItem
                                onclick={() => onAssign?.(agent.id)}
                            >
                                <div class="flex items-center gap-2">
                                    <Avatar class="h-6 w-6">
                                        {#if agent.avatar}
                                            <AvatarImage src={agent.avatar} />
                                        {/if}
                                        <AvatarFallback
                                            >{agent.name[0]}</AvatarFallback
                                        >
                                    </Avatar>
                                    <span>{agent.name}</span>
                                </div>
                            </DropdownMenuItem>
                        {/each}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-1">
        <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:text-foreground"
        >
            <Phone class="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:text-foreground"
        >
            <Video class="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:text-foreground"
        >
            <MoreVertical class="h-4 w-4" />
        </Button>
    </div>
</div>
