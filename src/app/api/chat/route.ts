import Anthropic from '@anthropic-ai/sdk';
import { ARCHITECT_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { ARCHITECT_TOOLS } from '@/lib/agents/tools';
import { handleToolCall } from '@/lib/agents/architect';

const anthropic = new Anthropic();

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages, setupId } = await req.json();

  const encoder = new TextEncoder();
  const context = { setupId: setupId || 'default', challengeId: undefined, rubricId: undefined };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Convert messages to Anthropic format
        const anthropicMessages = messages.map((m: any) => ({
          role: m.role === 'tool_result' ? 'user' : m.role === 'tool_use' ? 'assistant' : m.role,
          content: m.role === 'tool_result'
            ? [{ type: 'tool_result' as const, tool_use_id: m.metadata?.tool_use_id, content: m.content }]
            : m.role === 'tool_use'
              ? [{ type: 'tool_use' as const, id: m.metadata?.tool_use_id, name: m.metadata?.tool_name, input: JSON.parse(m.content) }]
              : m.content,
        }));

        let currentMessages = anthropicMessages;
        let continueLoop = true;

        while (continueLoop) {
          continueLoop = false;

          const response = await anthropic.messages.create({
            model: 'claude-opus-4-6-20250213',
            max_tokens: 4096,
            system: ARCHITECT_SYSTEM_PROMPT,
            messages: currentMessages,
            tools: ARCHITECT_TOOLS,
          });

          for (const block of response.content) {
            if (block.type === 'text') {
              send({ type: 'text', content: block.text });
            } else if (block.type === 'tool_use') {
              send({ type: 'tool_use', tool: block.name, input: block.input, tool_use_id: block.id });

              // Execute the tool
              const result = await handleToolCall(block.name, block.input as Record<string, any>, context);
              send({ type: 'tool_result', tool: block.name, result, tool_use_id: block.id });

              // Continue the conversation with tool result
              currentMessages = [
                ...currentMessages,
                { role: 'assistant' as const, content: response.content },
                {
                  role: 'user' as const,
                  content: [{ type: 'tool_result' as const, tool_use_id: block.id, content: result }],
                },
              ];
              continueLoop = true;
              break; // Process one tool at a time
            }
          }

          if (response.stop_reason === 'end_turn') {
            continueLoop = false;
          }
        }

        send({ type: 'done' });
      } catch (error: any) {
        send({ type: 'error', message: error.message || 'An error occurred' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
