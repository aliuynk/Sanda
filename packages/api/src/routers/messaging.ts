import { ForbiddenError, NotFoundError } from '@sanda/core';
import { z } from 'zod';

import { protectedProcedure, router, sellerProcedure } from '../trpc';

/**
 * Messaging router — buyer ↔ seller conversations.
 *
 * Conversations are scoped to a buyer-seller pair and optionally
 * linked to an order. Messages are persisted with sender tracking
 * and unread counters per side.
 */
export const messagingRouter = router({
  /** List conversations for the current user (buyer or seller side). */
  myConversations: protectedProcedure
    .input(
      z.object({
        role: z.enum(['buyer', 'seller']),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const accountId = ctx.principal.accountId;

      if (input.role === 'seller') {
        const seller = await ctx.prisma.sellerProfile.findUnique({
          where: { accountId },
          select: { id: true },
        });
        if (!seller) throw new NotFoundError('SellerProfile');

        const rows = await ctx.prisma.conversation.findMany({
          where: { sellerId: seller.id },
          orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          include: {
            buyer: {
              select: {
                id: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
            order: { select: { orderNumber: true } },
          },
        });

        const hasMore = rows.length > input.limit;
        const items = hasMore ? rows.slice(0, -1) : rows;
        return {
          items,
          nextCursor: hasMore ? items[items.length - 1]!.id : null,
        };
      }

      // Buyer side
      const rows = await ctx.prisma.conversation.findMany({
        where: { buyerAccountId: accountId },
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          seller: { select: { id: true, displayName: true, slug: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
          order: { select: { orderNumber: true } },
        },
      });

      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      return {
        items,
        nextCursor: hasMore ? items[items.length - 1]!.id : null,
      };
    }),

  /** Get messages for a conversation. */
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify access
      const conv = await ctx.prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: { seller: { select: { accountId: true } } },
      });
      if (!conv) throw new NotFoundError('Conversation', input.conversationId);

      const accountId = ctx.principal.accountId;
      if (conv.buyerAccountId !== accountId && conv.seller.accountId !== accountId) {
        throw new ForbiddenError('messaging.getMessages');
      }

      const rows = await ctx.prisma.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          sender: {
            select: {
              id: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      return {
        items: items.reverse(), // chronological order
        nextCursor: hasMore ? items[0]!.id : null,
      };
    }),

  /** Send a message in a conversation. */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        body: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: { seller: { select: { accountId: true } } },
      });
      if (!conv) throw new NotFoundError('Conversation', input.conversationId);

      const accountId = ctx.principal.accountId;
      const isBuyer = conv.buyerAccountId === accountId;
      const isSeller = conv.seller.accountId === accountId;
      if (!isBuyer && !isSeller) {
        throw new ForbiddenError('messaging.sendMessage');
      }

      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          senderAccountId: accountId,
          body: input.body,
        },
      });

      // Update conversation metadata
      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: {
          lastMessageAt: new Date(),
          ...(isBuyer
            ? { sellerUnreadCount: { increment: 1 } }
            : { buyerUnreadCount: { increment: 1 } }),
        },
      });

      return message;
    }),

  /** Mark conversation as read for the current user. */
  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: { seller: { select: { accountId: true } } },
      });
      if (!conv) throw new NotFoundError('Conversation', input.conversationId);

      const accountId = ctx.principal.accountId;
      const isBuyer = conv.buyerAccountId === accountId;

      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: isBuyer ? { buyerUnreadCount: 0 } : { sellerUnreadCount: 0 },
      });

      return { ok: true as const };
    }),
});
