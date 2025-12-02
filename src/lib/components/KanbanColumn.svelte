<script lang="ts">
    import ConversationCard from "./ConversationCard.svelte";
    import { cn } from "$lib/utils";

    interface Conversation {
        id: string;
        contactName: string;
        lastMessage: string;
        timestamp: string;
        unreadCount?: number;
    }

    interface Props {
        title: string;
        color: string;
        conversations: Conversation[];
        class?: string;
    }

    let { title, color, conversations, class: className }: Props = $props();
</script>

<div
    class={cn(
        "flex flex-col h-full min-w-[280px] w-[280px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200",
        className,
    )}
>
    <!-- Header -->
    <div
        class="p-3 text-center text-white font-semibold text-sm flex justify-between items-center px-4"
        style="background-color: {color};"
    >
        <span>{title}</span>
        <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {conversations.length}
        </span>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3">
        {#if conversations.length > 0}
            {#each conversations as conversation (conversation.id)}
                <ConversationCard
                    contactName={conversation.contactName}
                    lastMessage={conversation.lastMessage}
                    timestamp={conversation.timestamp}
                    unreadCount={conversation.unreadCount}
                />
            {/each}
        {:else}
            <div
                class="h-full flex items-center justify-center text-center p-4"
            >
                <p class="text-gray-400 text-sm italic">
                    No hay conversaciones en esta etapa
                </p>
            </div>
        {/if}
    </div>
</div>
