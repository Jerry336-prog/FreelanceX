import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search, Send, Loader2, AlertCircle, MessageSquare,
  CheckCheck, Check, ArrowLeft, Plus, X, UserPlus, Briefcase, Trash2, Paperclip, ShieldCheck,
  FileText, Download, Image as ImageIcon, CheckCircle, ExternalLink, Eye
} from 'lucide-react';
import { messageService, contractService, jobService, proposalService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getOtherParticipant = (conv, myId) => {
  if (!conv || !Array.isArray(conv.participants)) return {};
  const myStr = (myId || '').toString();

  const found = conv.participants.find((p) => {
    if (!p) return false;
    const pId = typeof p === 'object' ? (p._id || p.id) : p;
    return pId && pId.toString() !== myStr;
  });

  if (!found) {
    // If self-conversation or single-participant thread
    const selfObj = conv.participants[0];
    if (typeof selfObj === 'object' && selfObj) return selfObj;
    return selfObj ? { _id: selfObj, id: selfObj } : {};
  }
  if (typeof found === 'object') return found;
  return { _id: found, id: found };
};

const dedupeConversationsByParticipant = (list, myId) => {
  const byParticipant = new Map();
  (list || []).forEach((conversation) => {
    if (!conversation) return;
    const other = getOtherParticipant(conversation, myId);
    const key = other._id || other.id || conversation._id || conversation.id;
    const current = byParticipant.get(key);
    const conversationDate = new Date(conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt || 0);
    const currentDate = new Date(current?.lastMessageAt || current?.updatedAt || current?.createdAt || 0);
    if (!current || conversationDate > currentDate) byParticipant.set(key, conversation);
  });
  return [...byParticipant.values()];
};

const avatarInitials = (p) =>
  `${(p.firstname || '?')[0]}${(p.lastname || '')[0] || ''}`.toUpperCase();

const isImageAttachment = (attObj) => {
  if (!attObj) return false;
  if (typeof attObj === 'object') {
    if (attObj.isImage) return true;
    if (attObj.type && attObj.type.startsWith('image/')) return true;
    if (attObj.resource_type === 'image') return true;
    if (attObj.url && isImageAttachment(attObj.url)) return true;
    if (attObj.name && isImageAttachment(attObj.name)) return true;
  }
  if (typeof attObj === 'string') {
    const s = attObj.toLowerCase();
    if (s.startsWith('data:image/')) return true;
    if (s.startsWith('blob:')) return true;
    if (s.includes('/image/upload/')) return true;
    if (s.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|bmp|tiff)($|\?)/i)) return true;
  }
  return false;
};

const isPdfAttachment = (attObj) => {
  if (!attObj) return false;
  if (typeof attObj === 'object') {
    if (attObj.name && attObj.name.toLowerCase().endsWith('.pdf')) return true;
    if (attObj.type === 'application/pdf') return true;
    if (attObj.url && isPdfAttachment(attObj.url)) return true;
  }
  if (typeof attObj === 'string') {
    const s = attObj.toLowerCase();
    if (s.match(/\.pdf($|\?)/i)) return true;
    if (s.includes('/raw/upload/') && s.includes('pdf')) return true;
  }
  return false;
};

// ─── Subcomponents ──────────────────────────────────────────────────────────
const Avatar = ({ user, size = 10 }) => {
  const classes = `w-${size} h-${size} rounded-full overflow-hidden flex items-center justify-center text-slate-600 font-bold flex-shrink-0`;
  if (user?.profileImage) {
    return (
      <div className={classes}>
        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return <div className={classes}><span className="text-sm">{avatarInitials(user || {})}</span></div>;
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ClientMessages = () => {
  const { user: me } = useAuth();
  const myId = me?._id || me?.id;
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null); // { url, type: 'image' | 'pdf' | 'doc', title }
  const [receiptModal, setReceiptModal] = useState(null); // { reference, amount, contractTitle, date }
  const [searchTerm, setSearchTerm] = useState('');

  // ── Download File Helper (forces direct download even for cross-origin URLs) ──
  const handleDownloadFile = async (url, fileName) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [convError, setConvError] = useState('');
  const [msgError, setMsgError] = useState('');
  const [showMobileThread, setShowMobileThread] = useState(false);

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [startingChatId, setStartingChatId] = useState(null);
  const [chatStartError, setChatStartError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Load all conversations ──
  const loadConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      const rawList = Array.isArray(data) ? data : [];
      setConversations(dedupeConversationsByParticipant(rawList, myId));
    } catch (err) {
      setConvError(err?.message || 'Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  }, [myId]);

  // ── Load messages for a conversation ──
  const loadMessages = useCallback(async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    setMsgError('');
    try {
      const data = await messageService.getMessages(convId);
      const msgs = Array.isArray(data) ? data : [];
      setMessages((prev) => {
        if (JSON.stringify(prev.map((m) => m._id)) === JSON.stringify(msgs.map((m) => m._id))) return prev;
        return msgs;
      });
    } catch (err) {
      if (!silent) setMsgError(err?.message || 'Failed to load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // ── Polling for new messages ──
  const startPolling = useCallback(
    (convId) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(convId, true), 4000);
    },
    [loadMessages]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  // ── Handle ?recipient= deep-link and payment receipt prefill ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipientId = params.get('recipient');
    if (!recipientId || recipientId === 'undefined' || recipientId === 'null' || !myId) return;

    const receiptRef = params.get('receiptRef');
    const amount = params.get('amount');
    const title = params.get('title');
    const attachReceipt = params.get('attachReceipt');

    if (receiptRef || attachReceipt) {
      const decodedTitle = decodeURIComponent(title || 'Contract Settlement');
      const formattedAmt = `₦${Number(amount || 0).toLocaleString()}`;
      setMessageText(`Here is the payment receipt of ${formattedAmt} for "${decodedTitle}". Reference: ${receiptRef || 'PAYSTACK'}`);
      setStagedFiles([{
        id: `receipt-${Date.now()}`,
        isReceipt: true,
        name: `Receipt_${receiptRef || 'Paystack'}.pdf`,
        reference: receiptRef || 'PAYSTACK',
        amount: formattedAmt,
        contractTitle: decodedTitle,
        date: new Date().toLocaleDateString()
      }]);
    }

    const initConversation = async () => {
      try {
        const conv = await messageService.getOrCreateConversation(recipientId);
        if (conv?._id || conv?.id) {
          const cId = conv._id || conv.id;
          setActiveConvId(cId);
          setShowMobileThread(true);
          setConversations((prev) => {
            const exists = prev.some((c) => (c._id || c.id) === cId);
            if (exists) return prev;
            return [conv, ...prev];
          });
          await loadConversations();
        }
      } catch (err) {
        console.error('Error opening conversation:', err);
        setConvError(err?.response?.data?.message || err?.message || 'Could not open conversation with this freelancer');
      }
    };
    initConversation();
  }, [location.search, myId, loadConversations]);

  // ── Initial load ──
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Poll messages when active conversation changes ──
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      startPolling(activeConvId);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [activeConvId, loadMessages, startPolling, stopPolling]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Select conversation ──
  const selectConversation = (convId) => {
    setActiveConvId(convId);
    setMessages([]);
    setMsgError('');
    setShowMobileThread(true);
    inputRef.current?.focus();
  };

  // ── Open New Chat Modal & Load Freelancers ──
  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    setLoadingContacts(true);
    setContactSearch('');
    try {
      const [contractsData, jobsData] = await Promise.all([
        contractService.getMyContracts().catch(() => []),
        jobService.getMyJobs().catch(() => []),
      ]);

      const freelancerMap = new Map();

      // Collect freelancers from contracts
      (Array.isArray(contractsData) ? contractsData : []).forEach((c) => {
        const f = c.freelancerId;
        if (f && (f._id || f.id)) {
          const fid = f._id || f.id;
          if (fid !== myId && !freelancerMap.has(fid)) {
            freelancerMap.set(fid, {
              userId: fid,
              name: [f.firstname, f.lastname].filter(Boolean).join(' ') || f.email || 'Freelancer',
              email: f.email,
              profileImage: f.profileImage,
              context: `Contract: ${c.title || 'Project'}`,
            });
          }
        }
      });

      // Collect freelancers from applicants to client's jobs
      const jobsList = Array.isArray(jobsData) ? jobsData : jobsData?.jobs || [];
      const proposalPromises = jobsList.map(async (job) => {
        try {
          const pRes = await proposalService.getProposalsForJob(job._id || job.id);
          const pList = Array.isArray(pRes) ? pRes : [];
          pList.forEach((p) => {
            const f = p.freelancerId;
            if (f && (f._id || f.id)) {
              const fid = f._id || f.id;
              if (fid !== myId && !freelancerMap.has(fid)) {
                freelancerMap.set(fid, {
                  userId: fid,
                  name: [f.firstname, f.lastname].filter(Boolean).join(' ') || f.email || 'Freelancer',
                  email: f.email,
                  profileImage: f.profileImage,
                  context: `Applicant: ${job.title || 'Job Listing'}`,
                });
              }
            }
          });
        } catch {}
      });
      await Promise.all(proposalPromises);

      setContacts(Array.from(freelancerMap.values()));
    } catch (err) {
      console.error('Failed to load contacts for client:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // ── Start Conversation from Modal ──
  const handleStartConversation = async (contact) => {
    setStartingChatId(contact.userId);
    setChatStartError('');
    try {
      const conv = await messageService.getOrCreateConversation(contact.userId);
      const cid = conv?._id || conv?.id;
      if (cid) {
        setShowNewChatModal(false);
        setActiveConvId(cid);
        setShowMobileThread(true);
        await loadConversations();
        inputRef.current?.focus();
      }
    } catch (err) {
      setChatStartError(err?.message || 'Failed to start conversation. Please try again.');
    } finally {
      setStartingChatId(null);
    }
  };

  // ── Handle Staged Attachments ──
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newStaged = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
      isImage: file.type.startsWith('image/'),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setStagedFiles((prev) => [...prev, ...newStaged]);
    e.target.value = '';
  };

  const removeStagedFile = (id) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // ── Send message ──
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = messageText.trim();
    if ((!text && stagedFiles.length === 0) || !activeConvId || sending) return;

    const activeConv = conversations.find((c) => (c._id || c.id) === activeConvId);
    const recipient = getOtherParticipant(activeConv, myId);
    const receiverId = recipient._id || recipient.id;
    if (!receiverId) return;

    const currentText = text || (stagedFiles.length > 0 ? '📎 Attached file(s)' : '');

    // Prepare FormData payload for files & JSON structured attachments
    const formData = new FormData();
    formData.append('conversationId', activeConvId);
    formData.append('receiverId', receiverId);
    formData.append('message', currentText);

    const receiptAttachments = [];
    stagedFiles.forEach((item) => {
      if (item.file) {
        formData.append('files', item.file);
      } else if (item.isReceipt) {
        // Strip local-only fields before sending to backend
        // eslint-disable-next-line no-unused-vars
        const { id: _id, file: _file, previewUrl: _prev, ...cleanReceipt } = item;
        receiptAttachments.push(cleanReceipt);
      }
    });

    if (receiptAttachments.length > 0) {
      formData.append('attachments', JSON.stringify(receiptAttachments));
    }

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticAttachments = stagedFiles.map((item) => {
      if (item.isReceipt) {
        // Keep the full receipt object for immediate rendering
        const { id: _id, file: _file, previewUrl: _prev, ...cleanReceipt } = item;
        return cleanReceipt;
      }
      return item.previewUrl || item.url || item.name || item;
    });
    const optimistic = {
      _id: tempId,
      conversationId: activeConvId,
      senderId: { _id: myId, firstname: me?.firstname, lastname: me?.lastname, profileImage: me?.profileImage },
      message: currentText,
      attachments: optimisticAttachments,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');
    setStagedFiles([]);
    setSending(true);

    try {
      const res = await messageService.sendMessage(formData);
      const sent = res?.data || res;
      setMessages((prev) => prev.map((m) => (m._id === tempId ? sent : m)));
      loadConversations();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setMessageText(text);
      setMsgError(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ── Keyboard submit ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Removes the thread only from the current user's inbox. A later message will
  // make the conversation visible again, just like standard messaging apps.
  const handleDeleteConversation = async () => {
    if (!activeConvId || deleting) return;
    setDeleting(true);
    setMsgError('');
    try {
      await messageService.deleteConversation(activeConvId);
      setConversations((prev) => prev.filter((conv) => (conv._id || conv.id) !== activeConvId));
      setActiveConvId(null);
      setMessages([]);
      setShowMobileThread(false);
      setShowDeleteModal(false);
    } catch (err) {
      setMsgError(err?.message || 'Unable to delete this conversation. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtered conversations ──
  const filteredConvs = conversations.filter((conv) => {
    if (!searchTerm.trim()) return true;
    const other = getOtherParticipant(conv, myId);
    const name = `${other.firstname || ''} ${other.lastname || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || (conv.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtered contacts in modal
  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const s = contactSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.context && c.context.toLowerCase().includes(s))
    );
  });

  const activeConv = conversations.find((c) => (c._id || c.id) === activeConvId);
  const activeRecipient = activeConv ? getOtherParticipant(activeConv, myId) : null;
  const deleteRecipientName = activeRecipient?.firstname
    ? `${activeRecipient.firstname} ${activeRecipient.lastname || ''}`.trim()
    : 'this conversation';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-120px)] flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">

      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-chat-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="delete-chat-title" className="text-lg font-bold text-slate-900">Delete conversation?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Your chat with {deleteRecipientName} will be removed from your inbox. The other participant will keep their copy.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={deleting} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="button" onClick={handleDeleteConversation} disabled={deleting} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Chat Modal ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">New Conversation</h3>
                  <p className="text-xs text-slate-500">Select a freelancer to message</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search freelancers by name or job..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
              {/* Chat start error */}
              {chatStartError && (
                <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{chatStartError}</span>
                  <button onClick={() => setChatStartError('')} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {loadingContacts ? (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Finding freelancers...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <p className="text-sm font-semibold text-slate-700">No freelancers found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Freelancers who have submitted proposals to your jobs or have active contracts will appear here.
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isStarting = startingChatId === contact.userId;
                  return (
                    <div
                      key={contact.userId}
                      onClick={() => !isStarting && handleStartConversation(contact)}
                      className="p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar user={contact} size={10} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{contact.name}</p>
                          <p className="text-xs text-blue-600 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 flex-shrink-0" />
                            <span>{contact.context}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        disabled={isStarting}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        {isStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Chat'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar: Conversation List ── */}
      <div
        className={`${
          showMobileThread ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 flex-shrink-0 border-r border-slate-200 flex-col bg-slate-50`}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
            <button
              onClick={openNewChatModal}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Start a new conversation"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : convError ? (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {convError}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">Chat directly with applicants and hired talent.</p>
              </div>
              <button
                onClick={openNewChatModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Chat</span>
              </button>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const other = getOtherParticipant(conv, myId);
              const convId = conv._id || conv.id;
              const isActive = convId === activeConvId;
              return (
                <button
                  key={convId}
                  onClick={() => selectConversation(convId)}
                  className={`w-full text-left p-4 border-b border-slate-100 transition-colors flex items-start gap-3 ${
                    isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative mt-0.5">
                    <Avatar user={other} size={10} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {other.firstname ? `${other.firstname} ${other.lastname || ''}`.trim() : other.name || 'Freelancer'}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                        {formatTime(conv.lastMessageAt || conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Thread: Chat Area ── */}
      <div
        className={`${
          showMobileThread ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col h-full bg-slate-50/40`}
      >
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-slate-700">Select or start a conversation</p>
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Message freelancers directly about interview questions, project scopes, and milestones.
            </p>
            <button
              onClick={openNewChatModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileThread(false)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 -ml-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar user={activeRecipient} size={9} />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {activeRecipient?.firstname
                      ? `${activeRecipient.firstname} ${activeRecipient.lastname || ''}`.trim()
                      : activeRecipient?.name || 'Freelancer'}
                  </h3>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {activeRecipient?.role || 'Freelancer'} · Online
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Banner */}
            {msgError && (
              <div className="m-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 flex-shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{msgError}</span>
              </div>
            )}

            {/* Message Bubble List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <p className="text-sm">No messages here yet.</p>
                  <p className="text-xs">Send a greeting to start collaborating!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = (msg.senderId?._id || msg.senderId?.id || msg.senderId) === myId;
                  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                        {/* Attachments inside bubble */}
                        {attachments.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-white/20 pt-2.5">
                            {attachments.map((att, attIdx) => {
                              let attObj = att;
                              if (typeof att === 'string' && att.startsWith('{')) {
                                try { attObj = JSON.parse(att); } catch {}
                              }

                              if (attObj?.isReceipt || (typeof attObj === 'object' && attObj?.reference)) {
                                return (
                                  <div 
                                    key={attIdx} 
                                    onClick={() => setReceiptModal(attObj)}
                                    className="bg-white/95 text-slate-900 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 shadow-sm cursor-pointer hover:border-blue-300 transition-all"
                                  >
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                      <div className="flex items-center gap-1.5 font-bold text-blue-700">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Official Paystack Receipt</span>
                                      </div>
                                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{attObj.reference}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-slate-500 font-medium">Contract: <strong className="text-slate-800">{attObj.contractTitle}</strong></p>
                                      <p className="text-slate-500 font-medium">Amount: <strong className="text-slate-900 text-sm font-extrabold">{attObj.amount}</strong></p>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); setReceiptModal(attObj); }} 
                                      className="w-full mt-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1"
                                    >
                                      <Download className="w-3.5 h-3.5" /> View / Save PDF Receipt
                                    </button>
                                  </div>
                                );
                              }

                              const urlStr = typeof attObj === 'string' ? attObj : attObj?.url || attObj?.name || '';
                              const isImg = isImageAttachment(attObj);
                              const isPdf = isPdfAttachment(attObj);
                              const fileName = (typeof attObj === 'object' && attObj?.name) ? attObj.name : (urlStr.split('/').pop().split('?')[0] || 'Attached Document');

                              if (isImg) {
                                return (
                                  <div
                                    key={attIdx}
                                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 max-w-xs shadow-xs"
                                    onClick={() => setPreviewMedia({ url: urlStr, type: 'image', title: fileName || 'Image Attachment' })}
                                  >
                                    <img src={urlStr} alt="Attached image" className="w-full max-h-56 object-cover group-hover:opacity-90 transition-opacity" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-semibold text-xs backdrop-blur-xs">
                                      <Eye className="w-4 h-4" /> Click for bigger view
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={attIdx}
                                  onClick={() => setPreviewMedia({ url: urlStr, type: isPdf ? 'pdf' : 'doc', title: fileName })}
                                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                                    isMe
                                      ? 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <FileText className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                  <span className="truncate max-w-[180px]">{fileName}</span>
                                  <Eye className="w-3.5 h-3.5 ml-auto opacity-70" />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMe && (
                          msg._optimistic ? (
                            <Check className="w-3 h-3 text-slate-400" />
                          ) : (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Staged Files Preview Area */}
            <div className="p-3 md:p-4 border-t border-slate-200 bg-white flex-shrink-0 space-y-2">
              {stagedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {stagedFiles.map((sf) => (
                    <div key={sf.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs">
                      {sf.isReceipt ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : sf.isImage ? (
                        <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{sf.name}</span>
                      <button type="button" onClick={() => removeStagedFile(sf.id)} className="text-slate-400 hover:text-red-600 p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSend}>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                  <label 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer flex-shrink-0 transition-colors"
                    title="Attach payment receipt, image, or PDF document"
                  >
                    <input 
                      type="file" 
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.zip" 
                      className="sr-only" 
                      onChange={handleFileSelect}
                    />
                    <Paperclip className="w-4 h-4" />
                  </label>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={stagedFiles.length > 0 ? "Add a message for attached file(s)..." : "Write a message or attach files..."}
                    disabled={sending}
                    style={{ resize: 'none', overflowY: 'hidden' }}
                    className="flex-1 bg-transparent focus:outline-none text-sm text-slate-900 placeholder-slate-400 py-1.5 max-h-32 overflow-auto"
                  />
                  <button
                    type="submit"
                    disabled={(!messageText.trim() && stagedFiles.length === 0) || sending}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      (messageText.trim() || stagedFiles.length > 0) && !sending
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">Press Enter to send · Shift+Enter for new line · Supports PDF, images, docs</p>
              </form>
            </div>
          </>
        )}
      </div>

      {/* ── Centered Media & Document Lightbox Modal ── */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                {previewMedia.type === 'image' ? (
                  <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {previewMedia.title || 'Attachment Preview'}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewMedia.url, previewMedia.title)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-950/5 min-h-[350px]">
              {previewMedia.type === 'image' || isImageAttachment(previewMedia.url) ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title || 'Preview'}
                  className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-slate-200"
                />
              ) : previewMedia.type === 'pdf' || isPdfAttachment(previewMedia.url) ? (
                <iframe
                  src={previewMedia.url}
                  className="w-full h-[72vh] rounded-xl border border-slate-200 shadow-sm"
                  title="PDF Document Preview"
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewMedia.url)}&embedded=true`}
                  className="w-full h-[72vh] rounded-xl border border-slate-200 shadow-sm"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Official Printable Paystack Receipt Modal ── */}
      {receiptModal && (
        <div 
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in printable-modal"
          onClick={() => setReceiptModal(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-slate-100 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReceiptModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 no-print">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="text-center mb-6 no-print">
              <h2 className="text-xl font-bold text-slate-900">Payment Receipt</h2>
              <p className="text-xs text-slate-500 mt-1">Official Paystack payment verification document.</p>
            </div>

            {/* Printable Receipt Container */}
            <div id="printable-receipt" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-sans text-sm shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">FreelanceX</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Official Payment Receipt</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                    Paystack Verified
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Receipt Reference</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{receiptModal.reference || 'PAYSTACK'}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Contract Title</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">{receiptModal.contractTitle || 'Contract Settlement'}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Amount Paid</span>
                  <span className="font-extrabold text-slate-900 text-base">{receiptModal.amount}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Date</span>
                  <span className="text-slate-700 font-medium">{receiptModal.date || new Date().toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Payment Gateway</span>
                  <span className="text-slate-900 font-semibold">Paystack Direct Gateway</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                    Payment Sent — Verified
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center space-y-1">
                <p className="text-[11px] text-slate-600 font-semibold">Thank you for using FreelanceX!</p>
                <p className="text-[10px] text-slate-400">This document serves as official electronic proof of payment.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Print / Save PDF Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMessages;
