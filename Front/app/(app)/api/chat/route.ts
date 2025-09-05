import { groq, createGroq } from "@ai-sdk/groq";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const groq = createGroq({});

    const result = streamText({
      model: groq("gemma2-9b-it"),
      messages,
      tools: {
        weather: tool({
          description: "Get the weather in a location (fahrenheit)",
          parameters: z.object({
            location: z
              .string()
              .describe("The location to get the weather for"),
          }),
          execute: async ({ location }) => {
            const temperature = Math.round(Math.random() * (90 - 32) + 32);
            return { location, temperature };
          },
        }),
        convertFahrenheitToCelsius: tool({
          description: "Convert a temperature in fahrenheit to celsius",
          parameters: z.object({
            temperature: z
              .number()
              .describe("The temperature in fahrenheit to convert"),
          }),
          execute: async ({ temperature }) => {
            const celsius = Math.round((temperature - 32) * (5 / 9));
            return { celsius };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
