<script lang="ts">
    import { cn } from "$lib/utils";
    import { Check, CheckCheck, FileText, Download } from "lucide-svelte";

    interface Props {
        content?: string;
        fileUrl?: string;
        fileName?: string;
        timestamp: string;
        sender: "customer" | "agent" | "ai" | "system";
        status?: "sending" | "sent" | "delivered" | "read" | "failed";
    }

    let {
        content,
        fileUrl,
        fileName,
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

    <div class="flex items-center gap-3">
        <div
            class="flex-shrink-0 w-11 h-11 rounded-xl bg-background/20 flex items-center justify-center"
        >
            <FileText class="h-5 w-5" />
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">
                {fileName || "Archivo adjunto"}
            </p>
            {#if content}
                <p class="text-xs opacity-70 truncate mt-0.5">{content}</p>
            {/if}
        </div>
        {#if fileUrl}
            <a
                href={fileUrl}
                download={fileName}
                class="flex-shrink-0 w-9 h-9 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-all hover:scale-105"
                title="Descargar archivo"
            >
                <Download class="h-4 w-4" />
            </a>
        {/if}
    </div>

    <div class="flex items-center justify-end gap-1 mt-2">
        <span class="text-xs opacity-70">{formattedTime}</span>
        {#if !isFromCustomer && StatusIcon}
            <StatusIcon
                class={cn("h-3 w-3", status === "read" && "text-blue-400")}
            />
        {/if}
    </div>
</div>
