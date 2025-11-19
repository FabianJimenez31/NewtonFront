<script lang="ts">
    import { cn } from "$lib/utils";
    import { X, MessageSquare } from "lucide-svelte";
    import { Badge } from "$lib/components/ui";
    import type { ActiveConversation } from "$lib/stores/conversations-tabs.store";

    interface Props {
        conversations: ActiveConversation[];
        onTabClick: (id: string) => void;
        onTabClose: (id: string) => void;
        class?: string;
    }

    let {
        conversations,
        onTabClick,
        onTabClose,
        class: className,
    }: Props = $props();

    $effect(() => {
        console.log(
            "[ConversationTabs] Rendering with conversations:",
            conversations,
            "length:",
            conversations.length,
        );
    });
</script>

{#if conversations.length > 0}
    <div
        class={cn(
            "w-full border-t border-border/30 bg-gradient-to-b from-accent/20 to-accent/10",
            className,
        )}
    >
        <!-- Header -->
        <div
            class="px-4 pt-2.5 pb-2 flex items-center gap-2 border-b border-border/20"
        >
            <MessageSquare class="h-3.5 w-3.5 text-primary/70" />
            <h3
                class="text-[11px] font-semibold text-foreground/70 tracking-wide uppercase"
            >
                Conversaciones Activas
            </h3>
            <Badge
                variant="secondary"
                class="h-4 px-1.5 text-[10px] font-medium"
            >
                {conversations.length}
            </Badge>
        </div>

        <!-- Tabs Container (Horizontal Chrome-style) -->
        <div
            class="px-2 py-2 flex items-center gap-1 overflow-x-auto scrollbar-thin"
        >
            {#each conversations as conversation}
                <button
                    class="group relative flex items-center gap-2 px-3 py-2 min-w-[160px] max-w-[200px] bg-background/60 hover:bg-background border border-border/40 hover:border-primary/50 rounded-t-lg transition-all duration-150 hover:shadow-sm flex-shrink-0"
                    onclick={() => onTabClick(conversation.id)}
                    title={conversation.contactName}
                >
                    <!-- Avatar -->
                    <div
                        class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-[10px]"
                    >
                        {conversation.contactName.charAt(0).toUpperCase()}
                    </div>

                    <!-- Contact Name -->
                    <div
                        class="flex-1 min-w-0 font-medium text-xs text-foreground truncate"
                    >
                        {conversation.contactName}
                    </div>

                    <!-- Unread Badge -->
                    {#if conversation.unreadCount > 0}
                        <Badge
                            variant="default"
                            class="h-4 min-w-4 px-1 text-[9px] font-bold flex-shrink-0"
                        >
                            {conversation.unreadCount}
                        </Badge>
                    {/if}

                    <!-- Close Button (Chrome style - appears on hover) -->
                    <div
                        role="button"
                        tabindex="0"
                        class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-sm cursor-pointer -mr-1"
                        onclick={(e) => {
                            e.stopPropagation();
                            onTabClose(conversation.id);
                        }}
                        onkeydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onTabClose(conversation.id);
                            }
                        }}
                        title="Cerrar conversación"
                    >
                        <X
                            class="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors"
                        />
                    </div>
                </button>
            {/each}
        </div>
    </div>
{/if}

<style>
    /* Custom scrollbar for horizontal tabs */
    .scrollbar-thin::-webkit-scrollbar {
        height: 6px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
        background: hsl(var(--accent) / 0.1);
        border-radius: 3px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background: hsl(var(--border));
        border-radius: 3px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--primary) / 0.4);
    }
</style>
