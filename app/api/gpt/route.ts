/**
 * Based from:
 * https://github.com/Nutlope/twitterbio
 */

import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "../../../utils/OpenAIStream";
import { verifyToken } from "./util";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export async function GET(req: Request): Promise<Response> {
  const token = req.headers.get("X-Idtoken");
  try {
    const payload = await verifyToken(token || "");
    if (payload.email_verified) {
      console.log(payload);
      return new Response(
        JSON.stringify({
          status: 200,
          data: { ...payload },
        })
      );
    } else {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Email not verified or not whitelisted",
        }),
        { status: 400 }
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({
        status: 400,
        message: "Invalid token",
      }),
      { status: 400 }
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  const token = req.headers.get("X-Idtoken");

  try {
    const res = await verifyToken(token || "");

    if (!res.email_verified) {
      throw Error("Email not verified");
    }

    const { prompt } = (await req.json()) as {
      prompt?: ChatGPTMessage[];
    };

    if (!prompt) {
      return new Response("No prompt in the request", { status: 400 });
    }

    /**
     * @see https://platform.openai.com/playground?mode=chat
     */
    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      messages: prompt,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 200,
      stream: true,
      n: 1,
      user: "guest",
    };

    try {
      const stream = await OpenAIStream(payload);
      return new Response(stream);
    } catch (err) {
      console.error(err);
      return new Response("error");
    }
  } catch (e) {
    return new Response(
      JSON.stringify({
        status: 400,
        message: "Invalid token",
      }),
      { status: 400 }
    );
  }
}
