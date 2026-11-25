import {
  buildLiveAiFailurePersistInput,
  createSlidingWindowRateLimiter,
  detectMessageLanguage,
  validateChatRequestPayload
} from '../../../src/lib/receptionistKnowledge';
import { persistConversationMessages } from '../../../src/lib/receptionistConversationStore';
import {
  handleReceptionistChat,
  ReceptionistApiError,
  ReceptionistRuntimeEnv
} from '../../../src/lib/receptionistServerCore';

const checkChatRateLimit = createSlidingWindowRateLimiter(20, 60_000);

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(extraHeaders || {})
    }
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: ReceptionistRuntimeEnv;
}): Promise<Response> {
  const { request, env } = context;

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';

  const rate = checkChatRateLimit(`chat:${clientIp}`);
  if (!rate.allowed) {
    return jsonResponse(
      {
        error: `Too many chat requests. Please wait ${rate.retryAfterSeconds} seconds and try again.`,
        code: 'RATE_LIMITED',
        retryAfterSeconds: rate.retryAfterSeconds
      },
      429,
      { 'Retry-After': String(rate.retryAfterSeconds) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.', code: 'INVALID_JSON' }, 400);
  }

  const validation = validateChatRequestPayload(body);
  if (validation.ok === false) {
    return jsonResponse({ error: validation.error, code: 'VALIDATION_ERROR' }, 400);
  }

  const chatReq = validation.data;
  const sessionToken = chatReq.sessionToken;
  const sourceChannel = chatReq.sourceChannel || 'website';
  const sourceMode = chatReq.sourceMode || chatReq.mode;
  const customerMsgId = chatReq.clientMessageId || `usr_${crypto.randomUUID()}`;
  const assistantMsgId = chatReq.assistantMessageId || `ast_${crypto.randomUUID()}`;
  const detectedLang = chatReq.detectedLanguage || detectMessageLanguage(chatReq.message);
  let conversationId: string | undefined;
  let customerSaved = false;

  const customerMsgInput = {
    messageId: customerMsgId,
    senderType: 'customer' as const,
    messageContent: chatReq.message,
    messageMetadata: {
      quickActionId: chatReq.quickActionId,
      currentPage: chatReq.currentPage || '/',
      detectedLanguage: detectedLang
    },
    deliveryStatus: 'received' as const
  };

  try {
    if (sessionToken) {
      try {
        const persistedCustomer = await persistConversationMessages(
          {
            sessionId: chatReq.sessionId,
            sessionToken,
            sourceChannel,
            sourceMode,
            currentPage: chatReq.currentPage || '/',
            detectedLanguage: detectedLang,
            customerIdentifier: chatReq.collectedDraft?.customerName || undefined,
            messages: [customerMsgInput]
          },
          env
        );
        conversationId = persistedCustomer.conversationId;
        customerSaved = true;
      } catch (persistErr: unknown) {
        if (persistErr instanceof ReceptionistApiError && persistErr.code === 'INVALID_SESSION_TOKEN') {
          throw persistErr;
        }
        console.warn('Non-fatal customer message persistence warning:', persistErr);
      }
    }

    const result = await handleReceptionistChat(chatReq, env);
    let persisted = false;

    if (sessionToken) {
      try {
        const customerIdentifier =
          result.extractedFields?.customerName ||
          chatReq.collectedDraft?.customerName ||
          result.extractedFields?.contactNumber ||
          undefined;

        const assistantMsgInput = {
          messageId: assistantMsgId,
          senderType: 'assistant' as const,
          messageContent: result.reply,
          messageMetadata: {
            recommendedLinks: result.recommendedLinks,
            suggestEnquiryForm: result.suggestEnquiryForm,
            suggestHumanHandover: result.suggestHumanHandover,
            currentPage: chatReq.currentPage || '/',
            detectedLanguage: result.detectedLanguage
          },
          aiModel: result.model || null,
          deliveryStatus: 'delivered' as const
        };

        const persistedReply = await persistConversationMessages(
          {
            sessionId: chatReq.sessionId,
            sessionToken,
            sourceChannel,
            sourceMode,
            currentPage: chatReq.currentPage || '/',
            detectedLanguage: result.detectedLanguage || detectedLang,
            customerIdentifier,
            messages: customerSaved ? [assistantMsgInput] : [customerMsgInput, assistantMsgInput]
          },
          env
        );
        conversationId = persistedReply.conversationId;
        persisted = true;
      } catch (persistErr) {
        console.warn('Non-fatal assistant reply persistence warning:', persistErr);
      }
    }

    return jsonResponse(
      {
        ...result,
        conversationId,
        customerMessageId: customerMsgId,
        assistantMessageId: assistantMsgId,
        persisted
      },
      200
    );
  } catch (err: unknown) {
    if (err instanceof ReceptionistApiError) {
      if (sessionToken && err.code !== 'INVALID_SESSION_TOKEN' && sourceMode === 'live') {
        try {
          const failureStage =
            err.code === 'CLOUDFLARE_NETWORK_ERROR'
              ? 'network'
              : err.code === 'CLOUDFLARE_EMPTY_REPLY'
              ? 'empty_reply'
              : err.code === 'TURNSTILE_TOKEN_REQUIRED'
              ? 'turnstile'
              : 'upstream_ai';
          const failMsg = buildLiveAiFailurePersistInput({
            assistantMessageId: assistantMsgId,
            errorCode: err.code,
            errorMessage: err.message,
            failureStage,
            currentPage: chatReq.currentPage || '/',
            detectedLanguage: detectedLang
          });
          await persistConversationMessages(
            {
              sessionId: chatReq.sessionId,
              sessionToken,
              sourceChannel,
              sourceMode,
              currentPage: chatReq.currentPage || '/',
              detectedLanguage: detectedLang,
              customerIdentifier: chatReq.collectedDraft?.customerName || undefined,
              messages: customerSaved ? [failMsg] : [customerMsgInput, failMsg]
            },
            env
          );
        } catch (failPersistErr) {
          console.warn('Non-fatal failure event persistence warning:', failPersistErr);
        }
      }
      return jsonResponse({ error: err.message, code: err.code, conversationId }, err.status);
    }
    console.error('Cloudflare Worker /api/receptionist/chat error:', err);
    return jsonResponse(
      { error: 'Unexpected error processing your message. Please try again.', code: 'INTERNAL_ERROR' },
      500
    );
  }
}
