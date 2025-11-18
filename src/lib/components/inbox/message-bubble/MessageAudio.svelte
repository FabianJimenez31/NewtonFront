<script lang="ts">
    import { cn } from "$lib/utils";
    import { Check, CheckCheck, Play, Pause } from "lucide-svelte";

    interface Props {
        fileUrl?: string;
        timestamp: string;
        sender: "customer" | "agent" | "ai" | "system";
        status?: "sending" | "sent" | "delivered" | "read" | "failed";
    }

    let { fileUrl, timestamp, sender, status = "sent" }: Props = $props();

    // Audio player state
    let isPlaying = $state(false);
    let audioElement: HTMLAudioElement | undefined = $state();

    function toggleAudio() {
        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
            } else {
                audioElement.play();
            }
            isPlaying = !isPlaying;
        }
    }

    // Format time
    const formattedTime = $derived(
        new Date(timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    );

    const isFromCustomer = $derived(sender === "customer");

    // Status icons
    const statusIcons = {
        sending: null,
        sent: Check,
        delivered: CheckCheck,
        read: CheckCheck,
        failed: null,
    };

    const StatusIcon = $derived(statusIcons[status]);
</script>

<div class="px-4 py-3">
    <!-- Sender indicator -->
    {#if sender === "customer"}
        <div class="flex items-center gap-1.5 mb-2 opacity-70">
            <div class="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <span class="text-[10px] font-medium uppercase tracking-wide"
                >Cliente</span
            >
        </div>
    {:else if sender === "agent"}
        <div class="flex items-center gap-1.5 mb-2 opacity-90">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span class="text-[10px] font-semibold uppercase tracking-wide"
                >Agente</span
            >
        </div>
    {:else if sender === "ai"}
        <div class="flex items-center gap-1.5 mb-2 opacity-90">
            <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span class="text-[10px] font-semibold uppercase tracking-wide"
                >IA Asistente</span
            >
        </div>
    {/if}

    <div class="flex items-center gap-3 min-w-[200px]">
        <button
            onclick={toggleAudio}
            class="flex-shrink-0 w-9 h-9 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-all hover:scale-105"
        >
            {#if isPlaying}
                <Pause class="h-4 w-4" />
            {:else}
                <Play class="h-4 w-4 ml-0.5" />
            {/if}
        </button>

        {#if fileUrl}
            <audio
                bind:this={audioElement}
                src={fileUrl}
                onended={() => (isPlaying = false)}
            ></audio>
        {/if}

        <div class="flex-1">
            <div class="h-1.5 bg-background/20 rounded-full overflow-hidden">
                <div
                    class="h-full bg-background/50 rounded-full"
                    style="width: 0%"
                ></div>
            </div>
        </div>

        <div class="flex items-center gap-1">
            <span class="text-xs opacity-70">{formattedTime}</span>
            {#if !isFromCustomer && StatusIcon}
                <StatusIcon
                    class={cn("h-3 w-3", status === "read" && "text-blue-400")}
                />
            {/if}
        </div>
    </div>
</div>
