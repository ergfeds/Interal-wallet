import { SupportTicket } from '@/types/wallet';

// Mock support tickets for demonstration purposes
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket_1',
    userId: 'user_1',
    subject: 'Transaction not showing up',
    status: 'open',
    timestamp: Date.now() - 86400000, // 1 day ago
    messages: [
      {
        id: 'msg1',
        sender: 'user',
        content: "I sent some BTC yesterday but it's not showing up in my wallet. The transaction ID is tx_123456.",
        timestamp: Date.now() - 86400000 // 1 day ago
      }
    ]
  },
  {
    id: 'ticket_2',
    userId: 'user_2',
    subject: 'KYC verification issue',
    status: 'in_progress',
    timestamp: Date.now() - 259200000, // 3 days ago
    messages: [
      {
        id: 'msg1',
        sender: 'user',
        content: "I submitted my KYC documents 3 days ago but my status is still pending. Can you please check?",
        timestamp: Date.now() - 259200000 // 3 days ago
      },
      {
        id: 'msg2',
        sender: 'admin',
        content: "We're reviewing your documents. There seems to be an issue with the image quality of your ID. Could you please resubmit a clearer image?",
        timestamp: Date.now() - 172800000 // 2 days ago
      }
    ]
  },
  {
    id: 'ticket_3',
    userId: 'user_1',
    subject: 'Pending ETH transaction',
    status: 'in_progress',
    timestamp: Date.now() - 172800000, // 2 days ago
    messages: [
      {
        id: 'msg1',
        sender: 'user',
        content: "I sent some ETH 2 days ago and it is still pending. What is happening?",
        timestamp: Date.now() - 172800000 // 2 days ago
      },
      {
        id: 'msg2',
        sender: 'admin',
        content: "Thank you for reaching out. The Ethereum network is experiencing high congestion right now, which is causing delays. Your transaction should be processed within the next 24 hours.",
        timestamp: Date.now() - 86400000 // 1 day ago
      },
      {
        id: 'msg3',
        sender: 'user',
        content: "Thank you for the explanation. I will wait for it to be processed.",
        timestamp: Date.now() - 43200000 // 12 hours ago
      }
    ]
  },
  {
    id: 'ticket_4',
    userId: 'user_3',
    subject: 'Account security concerns',
    status: 'closed',
    timestamp: Date.now() - 604800000, // 7 days ago
    messages: [
      {
        id: 'msg1',
        sender: 'user',
        content: "I received an email asking for my wallet password. Is this from your company?",
        timestamp: Date.now() - 604800000 // 7 days ago
      },
      {
        id: 'msg2',
        sender: 'admin',
        content: "This is definitely a phishing attempt. We would never ask for your password via email. Please ignore and delete that email. I recommend enabling 2FA for additional security.",
        timestamp: Date.now() - 518400000 // 6 days ago
      },
      {
        id: 'msg3',
        sender: 'user',
        content: "Thank you for confirming. I have deleted the email and enabled 2FA as suggested.",
        timestamp: Date.now() - 432000000 // 5 days ago
      },
      {
        id: 'msg4',
        sender: 'admin',
        content: "You are welcome. Your account is now more secure. Let us know if you have any other concerns.",
        timestamp: Date.now() - 345600000 // 4 days ago
      }
    ]
  }
];