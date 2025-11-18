<script lang="ts">
    import { Loader2 } from "lucide-svelte";
    import { Button } from "$lib/components/ui";

    interface PaginationSummary {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
        from: number;
        to: number;
        hasPrevious: boolean;
        hasNext: boolean;
    }

    interface Props {
        pagination: PaginationSummary;
        isPaginating: boolean;
        onPageChange: (page: number) => void;
    }

    let { pagination, isPaginating, onPageChange }: Props = $props();

    const summary = $derived(() => {
        if (!pagination || pagination.total === 0) {
            return { label: "", hasControls: false };
        }

        const from = Math.max(1, pagination.from || 1);
        const to = Math.max(from, pagination.to || from);
        const label =
            from === to
                ? `Mostrando ${from} de ${pagination.total}`
                : `Mostrando ${from}-${to} de ${pagination.total}`;

        return {
            label,
            hasControls: pagination.pages > 1,
        };
    });

    const visiblePages = $derived(() => {
        if (!pagination) return [];

        const totalPages = Math.max(1, pagination.pages);
        const currentPage = Math.min(Math.max(1, pagination.page), totalPages);
        const windowSize = Math.min(5, totalPages);
        let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
        let end = start + windowSize - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - windowSize + 1);
        }

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index,
        );
    });

    function changePage(page: number) {
        if (isPaginating) return;
        if (page < 1 || page > pagination.pages) return;
        if (page === pagination.page) return;
        onPageChange(page);
    }
</script>

{#if pagination && summary().hasControls}
    <div
        class="border-t border-border px-4 py-3 text-xs text-muted-foreground mt-auto bg-background"
    >
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 justify-between">
                <div class="flex items-center gap-2">
                    {#if isPaginating}
                        <Loader2 class="h-3 w-3 animate-spin" />
                    {/if}
                    <span>{summary().label}</span>
                </div>
            </div>

            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrevious || isPaginating}
                        onclick={() => changePage(pagination.page - 1)}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext || isPaginating}
                        onclick={() => changePage(pagination.page + 1)}
                    >
                        Siguiente
                    </Button>
                </div>

                <div class="flex items-center gap-1">
                    {#each visiblePages() as pageNumber}
                        <Button
                            variant={pageNumber === pagination.page
                                ? "default"
                                : "ghost"}
                            size="sm"
                            class="w-8 h-8 p-0"
                            disabled={isPaginating}
                            onclick={() => changePage(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}
