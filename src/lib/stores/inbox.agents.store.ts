import { writable, get } from 'svelte/store';
import { getAgents } from '$lib/services/conversations.service';
import { updateLead } from '$lib/services/leads.service';
import { conversations } from './inbox.store';
import { currentConversation } from './messaging.store';
import type { Agent } from '$lib/types/inbox.types';

// State
export const agents = writable<Agent[]>([]);
export const isLoadingAgents = writable(false);

// Actions
export const agentActions = {
    /**
     * Load all available agents
     */
    async loadAgents(token: string) {
        if (get(agents).length > 0) return; // Cache check

        isLoadingAgents.set(true);
        try {
            const list = await getAgents(token);
            console.log('[AGENTS] Loaded agents:', list);
            agents.set(list);
        } catch (error) {
            console.error('[AGENTS] Failed to load agents:', error);
        } finally {
            isLoadingAgents.set(false);
        }
    },

    /**
     * Assign a conversation to an agent
     */
    async assignAgent(token: string, conversationId: string, leadId: string, agentId: string | null) {
        try {
            const agent = get(agents).find(a => a.id === agentId);

            // 1. Update current conversation (Detail View) - Independent of list
            const current = get(currentConversation);
            if (current && current.id === conversationId) {
                currentConversation.update(curr => curr ? ({ ...curr, assigned_agent: agent }) : null);
            }

            // 2. Update list (List View)
            conversations.update(all => {
                return all.map(c => {
                    if (c.id === conversationId) {
                        return { ...c, assigned_agent: agent };
                    }
                    return c;
                });
            });

            // API Call - using updateLead as fallback for assign endpoint
            await updateLead(token, leadId, { assigned_agent_id: agentId } as any);

            return true;
        } catch (error) {
            console.error("Failed to assign agent:", error);
            // Revert on error would go here (omitted for brevity)
            return false;
        }
    }
};
