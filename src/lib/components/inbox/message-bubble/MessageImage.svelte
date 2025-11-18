<script lang="ts">
    import { cn } from "$lib/utils";
    import { Check, CheckCheck, Image as ImageIcon } from "lucide-svelte";

    interface Props {
        content?: string;
        fileUrl?: string;
        timestamp: string;
        sender: "customer" | "agent" | "ai" | "system";
        status?: "sending" | "sent" | "delivered" | "read" | "failed";
    }

    let {
        content,
        fileUrl,
        timestamp,
        sender,
        status = "sent",
    }: Props = $props();

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

<div>
    <!-- Sender indicator -->
    <div class="px-4 pt-3">
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
                <div
                    class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                ></div>
                <span class="text-[10px] font-semibold uppercase tracking-wide"
                    >IA Asistente</span
                >
            </div>
        {/if}
    </div>

    {#if fileUrl}
        <img src={fileUrl} alt="Imagen" class="max-w-full h-auto" />
    {:else}
        <div class="flex items-center justify-center h-48 bg-muted/30">
            <ImageIcon class="h-12 w-12 opacity-30" />
        </div>
    {/if}

    {#if content}
        <div class="px-4 py-2">
            <p class="text-sm leading-relaxed">{content}</p>
        </div>
    {/if}

    <div class="px-4 pb-3 flex items-center justify-end gap-1">
        <span class="text-xs opacity-70">{formattedTime}</span>
        {#if !isFromCustomer && StatusIcon}
            <StatusIcon
                class={cn("h-3 w-3", status === "read" && "text-blue-400")}
            />
        {/if}
    </div>
</div>
