<script lang="ts">
    interface Props {
        hasSearch: boolean;
    }

    let { hasSearch }: Props = $props();
</script>

<div
    class="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground"
>
    <div class="mb-4 text-4xl">📭</div>
    <p class="text-sm font-medium">
        {#if hasSearch}
            No se encontraron conversaciones
        {:else}
            No hay conversaciones en esta vista
        {/if}
    </p>
    {#if hasSearch}
        <p class="text-xs mt-2 opacity-70">
            Intenta con otros términos de búsqueda
        </p>
    {/if}
</div>
