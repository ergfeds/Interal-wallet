import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react-native';
import useWalletStore from '@/store/walletStore';
import { SupportTicket } from '@/types/wallet';
import Colors from '@/constants/colors';

export default function SupportScreen() {
  const router = useRouter();
  const { currentUser, supportTickets, createSupportTicket } = useWalletStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to access support</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupportTicket({
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject('');
      setMessage('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (ticket: SupportTicket) => {
    if (ticket.status === 'open') {
      return <Clock size={20} color={Colors.dark.pending} />;
    } else if (ticket.status === 'in_progress') {
      return <MessageSquare size={20} color={Colors.dark.primary} />;
    } else if (ticket.status === 'closed') {
      return <CheckCircle size={20} color={Colors.dark.success} />;
    }
    return null;
  };

  const getStatusText = (ticket: SupportTicket) => {
    if (ticket.status === 'open') {
      return 'Open';
    } else if (ticket.status === 'in_progress') {
      return 'In Progress';
    } else if (ticket.status === 'closed') {
      return 'Closed';
    }
    return '';
  };

  const getLatestMessage = (ticket: SupportTicket) => {
    if (ticket.messages && ticket.messages.length > 0) {
      const latestMessage = ticket.messages[ticket.messages.length - 1];
      return latestMessage.content;
    }
    return '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTicketItem = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => router.push(`/support/${item.id}`)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject}>{item.subject}</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item)}
          <Text
            style={[
              styles.statusText,
              item.status === 'closed'
                ? styles.closedStatus
                : item.status === 'in_progress'
                ? styles.inProgressStatus
                : styles.openStatus,
            ]}
          >
            {getStatusText(item)}
          </Text>
        </View>
      </View>

      <Text style={styles.messagePreview} numberOfLines={2}>
        {getLatestMessage(item)}
      </Text>

      <Text style={styles.ticketDate}>{formatDate(item.timestamp)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Support',
          headerTitleStyle: styles.headerTitle,
        }}
      />

      {!showForm ? (
        <>
          <TouchableOpacity
            style={styles.newTicketButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.newTicketButtonText}>New Support Ticket</Text>
          </TouchableOpacity>

          {supportTickets.length > 0 ? (
            <FlatList
              data={supportTickets.sort((a: SupportTicket, b: SupportTicket) => b.timestamp - a.timestamp)}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.ticketsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No support tickets yet</Text>
              <Text style={styles.emptySubtext}>
                Need help? Create a new support ticket and our team will assist you.
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Support Ticket</Text>

          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Enter subject"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue"
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowForm(false);
                setSubject('');
                setMessage('');
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  newTicketButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
  },
  newTicketButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  ticketsList: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
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
  messagePreview: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  ticketDate: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    marginBottom: 16,
  },
  messageInput: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24,
  },
});