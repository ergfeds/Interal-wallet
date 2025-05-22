import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Clock, CheckCircle, MessageCircle } from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import Colors from '@/constants/colors';
import { SupportTicket, SupportMessage } from '@/types/wallet';

export default function SupportTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, supportTickets, respondToSupportTicket, closeSupportTicket } = useWalletStore();
  const [newResponse, setNewResponse] = useState('');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use useEffect to find the ticket after render
  useEffect(() => {
    if (!currentUser || !id) {
      setLoading(false);
      return;
    }
    
    // Find the ticket
    const foundTicket = supportTickets.find(t => t.id === id);
    
    if (!foundTicket) {
      setLoading(false);
      return;
    }
    
    // Check if user is authorized to view this ticket
    const isAuthorized = currentUser.id === foundTicket.userId || (currentUser.isAdmin === true);
    
    if (!isAuthorized) {
      router.back();
      return;
    }
    
    setTicket(foundTicket);
    setLoading(false);
  }, [id, currentUser, supportTickets, router]);
  
  const handleSendResponse = () => {
    if (!ticket || !currentUser) return;
    
    if (newResponse.trim() === "") {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    
    respondToSupportTicket(
      ticket.id,
      newResponse.trim(),
      currentUser.isAdmin === true
    );
    
    setNewResponse("");
  };
  
  const handleCloseTicket = () => {
    if (!ticket) return;
    
    Alert.alert(
      "Close Ticket",
      "Are you sure you want to close this ticket?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Close",
          onPress: () => {
            closeSupportTicket(ticket.id);
            Alert.alert("Success", "Ticket closed successfully");
          },
        },
      ]
    );
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock size={20} color={Colors.dark.pending} />;
      case "in_progress":
        return <MessageCircle size={20} color={Colors.dark.primary} />;
      case "closed":
        return <CheckCircle size={20} color={Colors.dark.success} />;
      default:
        return null;
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Loading ticket...</Text>
      </View>
    );
  }
  
  if (!currentUser || !id) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please log in to view tickets</Text>
      </View>
    );
  }
  
  if (!ticket) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Ticket not found</Text>
      </View>
    );
  }
  
  // Combine ticket message and responses for display
  const messages = [
    {
      id: "initial",
      message: ticket.messages[0]?.content || "",
      timestamp: ticket.timestamp,
      fromAdmin: false,
    },
    ...ticket.messages.slice(1).map((msg: SupportMessage) => ({
      id: msg.id,
      message: msg.content,
      timestamp: msg.timestamp,
      fromAdmin: msg.sender === "admin",
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <View style={styles.statusContainer}>
              {getStatusIcon(ticket.status)}
              <Text style={[
                styles.statusText,
                ticket.status === "open" ? styles.openStatus :
                ticket.status === "in_progress" ? styles.inProgressStatus :
                styles.closedStatus
              ]}>
                {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.ticketDate}>Created: {formatDate(ticket.timestamp)}</Text>
        </View>
        
        <ScrollView style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageItem,
                msg.fromAdmin ? styles.adminMessage : styles.userMessage
              ]}
            >
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>
                  {msg.fromAdmin ? "Support Agent" : "You"}
                </Text>
                <Text style={styles.messageTime}>
                  {formatDate(msg.timestamp)}
                </Text>
              </View>
              <Text style={styles.messageContent}>{msg.message}</Text>
            </View>
          ))}
        </ScrollView>
        
        {ticket.status !== "closed" ? (
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your message..."
              placeholderTextColor={Colors.dark.subtext}
              value={newResponse}
              onChangeText={setNewResponse}
              multiline
            />
            <View style={styles.replyActions}>
              {currentUser.isAdmin === true && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseTicket}
                >
                  <Text style={styles.closeButtonText}>Close Ticket</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendResponse}
              >
                <Send size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.closedMessageContainer}>
            <Text style={styles.closedMessage}>
              This ticket is closed. If you need further assistance, please create a new ticket.
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: Colors.dark.text,
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  ticketInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  openStatus: {
    color: Colors.dark.pending,
  },
  inProgressStatus: {
    color: Colors.dark.primary,
  },
  closedStatus: {
    color: Colors.dark.success,
  },
  ticketDate: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxWidth: "85%",
  },
  userMessage: {
    backgroundColor: Colors.dark.card,
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  adminMessage: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.dark.subtext,
    marginLeft: 8,
  },
  messageContent: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  replyContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  replyInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: Colors.dark.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  closeButtonText: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
  sendButton: {
    backgroundColor: Colors.dark.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closedMessageContainer: {
    padding: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.success,
  },
  closedMessage: {
    color: Colors.dark.text,
    fontSize: 14,
  },
});