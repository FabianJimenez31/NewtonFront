#!/bin/bash

# Add debugging logs to conversations.service.ts

FILE="/home/debian/newton/src/lib/services/conversations.service.ts"

# Backup original
cp "$FILE" "$FILE.backup"

# Insert debug logs
sed -i '152a\    console.log(`[CONVERSATION] Looking for conversation ID: ${conversationId}`);' "$FILE"
sed -i '154a\    console.log(`[CONVERSATION] Inbox has ${inbox.length} conversations`);' "$FILE"
sed -i '155a\    console.log(`[CONVERSATION] Inbox IDs:`, inbox.map(c => c.id));' "$FILE"

sed -i '/const conversation = inbox.find/a\    \
    if (!conversation) {\
      console.warn(`[CONVERSATION] Conversation ${conversationId} not found in inbox`);\
      throw new Error("Conversation not found in inbox");\
    }\
    \
    console.log(`[CONVERSATION] Found conversation:`, {\
      id: conversation.id,\
      name: conversation.contact_name,\
      phone: conversation.contact_phone\
    });' "$FILE"

sed -i '/if (conversation.contact_phone) {/a\      console.log(`[CONVERSATION] Fetching lead for phone: ${conversation.contact_phone}`);' "$FILE"

sed -i '/const leads = await authenticatedFetchJSON/a\      \
      console.log(`[CONVERSATION] Lead API returned ${leads?.length || 0} results`);' "$FILE"

echo "Debugging logs added successfully"
