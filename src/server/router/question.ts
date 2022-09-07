import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import PusherServer from "pusher";
import { env } from "../../env/server.mjs";

const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: env.PUSHER_APP_SECRET,
  cluster: env.PUSHER_APP_CLUSTER,
});

export const questionRouter = createRouter()
  .query("get-my-question", {
    async resolve({ ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not signed in",
        });
      }

      const questions = await ctx.prisma.question.findMany({
        where: {
          userId: ctx.session.user?.id,
        },
      });

      return questions;
    },
  })
  .query("get-user-metadata", {
    input: z.object({ userId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.findFirst({ where: { id: input.userId } });
    },
  })
  .mutation("submit-question", {
    input: z.object({
      userId: z.string(),
      question: z.string().min(0).max(400),
    }),
    async resolve({ ctx, input }) {
      const question = await prisma?.question.create({
        data: {
          userId: input.userId,
          body: input.question,
        },
      });
      return question;
    },
  })
  .mutation("pin-question", {
    input: z.object({ questionId: z.string() }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const question = await ctx.prisma.question.findFirst({
        where: { id: input.questionId },
      });

      if (!question || question.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "NOT YOUR QUESTION",
        });
      }

      await pusherServerClient.trigger(
        `user-${question.userId}`,
        "question-pinned",
        {
          question: question.body,
        }
      );
    },
  });
