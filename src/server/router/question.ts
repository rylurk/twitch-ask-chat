import { TRPCError } from "@trpc/server";
import { resolve } from "path";
import { z } from "zod";
import { createRouter } from "./context";

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
  });
