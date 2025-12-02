<script lang="ts">
    import { User, MessageSquare, Clock } from "lucide-svelte";
    import { cn } from "$lib/utils";

    interface Props {
        contactName: string;
        lastMessage: string;
        timestamp: string;
        unreadCount?: number;
        class?: string;
    }

    let {
        contactName,
        lastMessage,
        timestamp,
        unreadCount = 0,
        class: className,
    }: Props = $props();
</script>

<div
    class={cn(
        "bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300",
        "hover:shadow-md hover:cursor-pointer hover:-translate-y-1",
        className,
    )}
>
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
            <div class="bg-gray-100 p-1.5 rounded-full">
                <User size={16} class="text-gray-600" />
            </div>
            <span
                class="text-sm font-semibold text-gray-900 truncate max-w-[140px]"
                >{contactName}</span
            >
        </div>
        {#if unreadCount > 0}
            <span
                class="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full"
            >
                {unreadCount}
            </span>
        {/if}
    </div>

    <!-- Body -->
    <div class="flex items-start gap-2 mb-3">
        <MessageSquare size={14} class="text-gray-400 mt-0.5 shrink-0" />
        <p class="text-sm text-gray-600 line-clamp-2 leading-snug">
            {lastMessage}
        </p>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock size={12} />
        <span>{timestamp}</span>
    </div>
</div>
