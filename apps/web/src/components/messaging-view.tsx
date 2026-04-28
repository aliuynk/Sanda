'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  EmptyState,
  Input,
  Spinner,
  useToast,
} from '@sanda/ui-web';
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { trpc } from '@/trpc/shared';

/* ---------------------------------------------------------------------------
 * Messaging UI — works for both buyer and seller roles.
 *
 * Props:
 * - role: 'buyer' | 'seller' — determines which conversations to load
 * -------------------------------------------------------------------------- */

export function MessagingView({ role }: { role: 'buyer' | 'seller' }) {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const toast = useToast();

  const { data: convData, isLoading: loadingConvs } =
    trpc.messaging.myConversations.useQuery({ role, limit: 30 });
  const conversations = convData?.items ?? [];

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm md:flex-row">
      {/* Sidebar — conversation list */}
      <aside
        className={cn(
          'w-full shrink-0 border-b border-border/60 md:w-80 md:border-b-0 md:border-r',
          activeConvId ? 'hidden md:block' : 'block',
        )}
      >
        <div className="flex items-center gap-3 border-b border-border/60 p-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Mesajlar</h2>
          {conversations.some((c: any) =>
            role === 'seller' ? c.sellerUnreadCount > 0 : c.buyerUnreadCount > 0,
          ) && (
            <Badge tone="destructive" className="ml-auto rounded-full px-2 text-[10px]">
              Yeni
            </Badge>
          )}
        </div>

        {loadingConvs ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Henüz mesaj yok. Sipariş veya ürün hakkında iletişim başlatıldığında burada görünecek.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 overflow-y-auto">
            {conversations.map((conv: any) => {
              const unread =
                role === 'seller' ? conv.sellerUnreadCount : conv.buyerUnreadCount;
              const lastMsg = conv.messages?.[0];
              const name =
                role === 'seller'
                  ? `${conv.buyer?.profile?.firstName ?? ''} ${conv.buyer?.profile?.lastName ?? ''}`.trim() || 'Alıcı'
                  : conv.seller?.displayName ?? 'Üretici';

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30',
                    activeConvId === conv.id && 'bg-primary/[0.06]',
                  )}
                >
                  <Avatar size="sm" alt={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{name}</span>
                      {unread > 0 && (
                        <Badge tone="destructive" className="shrink-0 rounded-full px-1.5 text-[10px]">
                          {unread}
                        </Badge>
                      )}
                    </div>
                    {conv.subject && (
                      <p className="truncate text-xs text-muted-foreground">{conv.subject}</p>
                    )}
                    {conv.order?.orderNumber && (
                      <p className="text-[10px] text-muted-foreground">
                        Sipariş #{conv.order.orderNumber}
                      </p>
                    )}
                    {lastMsg && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {lastMsg.body}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main — conversation thread */}
      <main className={cn('flex flex-1 flex-col', !activeConvId && 'hidden md:flex')}>
        {!activeConvId ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="h-12 w-12 text-muted-foreground/20" />}
              title="Sohbet seçilmedi"
              description="Sol panelden bir konuşma seç veya yeni mesaj bekle."
            />
          </div>
        ) : (
          <ConversationThread
            conversationId={activeConvId}
            role={role}
            onBack={() => setActiveConvId(null)}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Conversation Thread
 * -------------------------------------------------------------------------- */
function ConversationThread({
  conversationId,
  role,
  onBack,
}: {
  conversationId: string;
  role: 'buyer' | 'seller';
  onBack: () => void;
}) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.messaging.getMessages.useQuery(
    { conversationId, limit: 50 },
    { refetchInterval: 5000 }, // poll every 5s
  );
  const messages = data?.items ?? [];

  const markRead = trpc.messaging.markRead.useMutation();
  const sendMsg = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      utils.messaging.getMessages.invalidate({ conversationId });
      utils.messaging.myConversations.invalidate();
    },
    onError: (err) => {
      toast.error('Gönderilemedi', err.message);
    },
  });

  // Mark as read on mount
  useEffect(() => {
    markRead.mutate({ conversationId });
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMsg.mutate({ conversationId, body: message.trim() });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar size="sm" alt="Konuşma" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Konuşma</p>
          <p className="text-[10px] text-muted-foreground">
            {messages.length} mesaj
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              Henüz mesaj yok. İlk mesajı sen gönder!
            </p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = role === 'seller'
              ? msg.sender?.id !== undefined // simplified — server knows
              : true;
            const senderName = msg.sender?.profile
              ? `${msg.sender.profile.firstName ?? ''} ${msg.sender.profile.lastName ?? ''}`.trim()
              : 'Kullanıcı';

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  isMe ? 'justify-end' : 'justify-start',
                )}
              >
                {!isMe && <Avatar size="sm" alt={senderName} />}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    isMe
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-muted text-foreground',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div
                    className={cn(
                      'mt-1 flex items-center gap-1 text-[10px]',
                      isMe ? 'justify-end text-primary-foreground/60' : 'text-muted-foreground',
                    )}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && msg.readAt && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesaj yaz..."
            className="flex-1 rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-xl shadow-md shadow-primary/20"
            disabled={!message.trim()}
            loading={sendMsg.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
}
