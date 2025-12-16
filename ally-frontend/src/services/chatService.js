import { 
    ref, 
    push, 
    child, 
    update, 
    get, 
    remove, 
    onValue, 
    off,
    serverTimestamp as rtdbTimestamp 
} from 'firebase/database';
import { database } from '../firebase/config';
import { fetchUserDetails } from '../utils/auth';

// Helper to get current timestamp
const getTimestamp = () => Date.now(); 

export const fetchActiveConversations = async (userId) => {
    try {
        if (!userId) throw new Error('Invalid userId provided.');

        // 1. Get the list of room IDs for this user from the 'userChatrooms' index
        const userChatsRef = ref(database, `userChatrooms/${userId}`);
        const snapshot = await get(userChatsRef);

        if (!snapshot.exists()) {
            return []; // No conversations yet
        }

        const roomIds = Object.keys(snapshot.val());
        const conversationPromises = roomIds.map(async (roomId) => {
            // 2. Fetch metadata for each room from 'chatrooms' node
            const roomSnapshot = await get(ref(database, `chatrooms/${roomId}`));
            if (!roomSnapshot.exists()) return null;

            const data = roomSnapshot.val();

            // Find the "other" participant
            const participantIds = Object.keys(data.participants || {});
            const otherParticipantId = participantIds.find(id => String(id) !== String(userId));

            if (!otherParticipantId) return null;

            try {
                // Fetch user details (assuming this still works from your auth utility)
                const otherUser = await fetchUserDetails(otherParticipantId);
                
                if (!otherUser) return null;

                return {
                    id: otherUser.id,
                    name: otherUser.fullName || `${otherUser.firstName} ${otherUser.lastName}`,
                    role: otherUser.accountType,
                    chatroomId: roomId,
                    lastMessage: data.lastMessage || '',
                    lastMessageTimestamp: data.lastMessageTimestamp,
                    // Check if current user has read the last message
                    isRead: data.participantDetails?.[userId]?.lastRead >= data.lastMessageTimestamp
                };
            } catch (error) {
                console.error(`Error fetching user details for ${otherParticipantId}:`, error);
                return null;
            }
        });

        const conversations = (await Promise.all(conversationPromises)).filter(Boolean);

        // Sort by newest message first
        conversations.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

        return conversations;

    } catch (error) {
        console.error('Error fetching active conversations:', error);
        throw error;
    }
};

export const sendMessage = async (senderId, receiverId, content, senderRole) => {
    try {
        senderId = String(senderId);
        receiverId = String(receiverId);

        // 1. Generate a consistent Chat Room ID (e.g., "userA_userB")
        // This ensures two users always share the same room ID
        const participants = [senderId, receiverId].sort();
        const chatroomId = `${participants[0]}_${participants[1]}`;

        const timestamp = getTimestamp();

        // 2. Prepare the new message data
        const newMessageKey = push(child(ref(database), 'messages')).key;
        const messageData = {
            senderId,
            receiverId,
            content,
            timestamp,
            isEdited: false,
            senderRole
        };

        // 3. Prepare atomic updates (update multiple nodes at once)
        const updates = {};

        // Add message to history
        updates[`messages/${chatroomId}/${newMessageKey}`] = messageData;

        // Update Room Metadata
        updates[`chatrooms/${chatroomId}/lastMessage`] = content;
        updates[`chatrooms/${chatroomId}/lastMessageTimestamp`] = timestamp;
        updates[`chatrooms/${chatroomId}/participants/${senderId}`] = true;
        updates[`chatrooms/${chatroomId}/participants/${receiverId}`] = true;
        
        // Update Read Status (Sender has read it, Receiver hasn't)
        updates[`chatrooms/${chatroomId}/participantDetails/${senderId}`] = { 
            role: senderRole, 
            lastRead: timestamp 
        };
        // We only update the receiver's role if it doesn't exist to avoid overwriting metadata, 
        // but for simplicity in this structure, we can set it safely or leave it.
        // If you need to set the receiver's role strictly:
        // updates[`chatrooms/${chatroomId}/participantDetails/${receiverId}/role`] = (senderRole === 'lawyer' ? 'client' : 'lawyer');

        // Link users to this room (Index)
        updates[`userChatrooms/${senderId}/${chatroomId}`] = true;
        updates[`userChatrooms/${receiverId}/${chatroomId}`] = true;

        // 4. Send to Firebase
        await update(ref(database), updates);

        console.log(`Message sent to room ${chatroomId}`);
        return { success: true, chatroomId };

    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const subscribeToMessages = (senderId, receiverId, callback) => {
    // Reconstruct the ID so we know which room to listen to
    const participants = [String(senderId), String(receiverId)].sort();
    const chatroomId = `${participants[0]}_${participants[1]}`;

    const messagesRef = ref(database, `messages/${chatroomId}`);

    // Listen for value changes
    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const messages = [];

        if (data) {
            Object.keys(data).forEach((key) => {
                const msg = data[key];
                messages.push({
                    id: key,
                    ...msg,
                    // Convert timestamp to Date object for UI compatibility
                    timestamp: new Date(msg.timestamp) 
                });
            });
        }
        
        // Ensure sorted by time
        messages.sort((a, b) => a.timestamp - b.timestamp);

        callback({ messages, chatroomId });
    }, (error) => {
        console.error('Error subscribing to messages:', error);
    });

    // Return the cleanup function
    return () => off(messagesRef);
};

export const markChatAsRead = async (chatroomId, userId) => {
    try {
        const updates = {};
        updates[`chatrooms/${chatroomId}/participantDetails/${userId}/lastRead`] = getTimestamp();
        await update(ref(database), updates);
    } catch (error) {
        console.error('Error marking chat as read:', error);
    }
};

export const deleteMessage = async (chatroomId, messageId) => {
    try {
        const messageRef = ref(database, `messages/${chatroomId}/${messageId}`);
        await remove(messageRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};

export const editMessage = async (chatroomId, messageId, newContent) => {
    try {
        const messageRef = ref(database, `messages/${chatroomId}/${messageId}`);
        await update(messageRef, {
            content: newContent,
            isEdited: true,
            editedAt: getTimestamp()
        });
    } catch (error) {
        console.error('Error editing message:', error);
        throw error;
    }
};