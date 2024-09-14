"use client";
import { MockInterview } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import InterviewItemCard from "./InterviewItemCard";

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(
        eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
      )
      .orderBy(desc(MockInterview.id));

    console.log(result);

    setInterviewList(result);
  };

  return (
    <div>
      <h2 className="font-medium text-xl">Previous Interviews:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-3">
        {interviewList && interviewList.length > 0 ? (
          interviewList.map((interview, index) => (
            <InterviewItemCard key={index} interview={interview} />
          ))
        ) : (
          <p>No previous interviews available.</p>
        )}
      </div>
    </div>
  );
}

export default InterviewList;
