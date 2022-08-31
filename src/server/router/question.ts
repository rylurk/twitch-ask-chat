import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";

export const questionRouter = createRouter().query("get-my-question", {
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
});
