"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Feedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);
  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);

    console.log(result);
    setFeedbackList(result);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-green-500">Congratulations!!</h2>
      <h2 className="font-bold text-2xl">Your Interview Feedback :</h2>
      <h2 className="text-blue-700 text-lg my-3">
        Your interview rating <strong>7/10</strong>
      </h2>
      <h2 className="text-sm text-gray-500">
        Blow is The interview Informations
      </h2>
      {feedbackList &&
        feedbackList.map((item, index) => (
          <Collapsible key={index} className="mt-7">
            <CollapsibleTrigger className="p-2 bg-secondary rounded-lg flex justify-between my-2 text-left gap-7 w-full">
              {item.question} <ChevronsUpDownIcon className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2">
                <h2 className="text-blue-600 p-2 border rounded-lg">
                  <strong>Rating :</strong>
                  {item.rating}
                </h2>
                <h2 className=" p-2 border rounded-lg bg-blue-50 text-sm text-blue-500">
                  <strong>Your Answer : </strong> {item.userAnswer}
                </h2>
                <h2 className=" p-2 border rounded-lg bg-green-50 text-sm text-green-500">
                  <strong>Correct Answer : </strong> {item.correctAnswer}
                </h2>
                <h2 className=" p-2 border rounded-lg bg-grey-100 text-sm">
                  <strong>Feedback : </strong> {item.feedback}
                </h2>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      <Button
        className="bg-blue-500"
        onClick={() => router.replace("/dashboard")}
      >
        Home
      </Button>
    </div>
  );
}

export default Feedback;
