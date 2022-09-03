import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

function AskForm({ userId }: { userId: string }) {
  const { data, isLoading } = trpc.useQuery([
    "questions.get-user-metadata",
    { userId },
  ]);

  const { mutate } = trpc.useMutation("questions.submit-question");

  const [question, setQuestion] = useState("");

  if (isLoading) return null;

  return (
    <div className="flex flex-col p-8 items-center">
      <h1 className="text-2xl font-bold">Ask {data?.name} a question!</h1>

      <textarea
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={() => {
          if (!question) return;
          mutate({ userId, question });
          setQuestion("");
        }}
      >
        Submit!
      </button>
    </div>
  );
}

export default function AskPage() {
  const { query } = useRouter();

  if (!query.uid || typeof query.uid !== "string") {
    return null;
  }

  return <AskForm userId={query.uid} />;
}
