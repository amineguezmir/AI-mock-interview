"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { db } from "@/utils/db";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt =
      "Job Position:" +
      jobPosition +
      " Job Description :" +
      jobDesc +
      " Years of Experience:" +
      jobExperience +
      " Depends on this information please give me " +
      process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT +
      " interview question with Answered in Json Format. Give Question and Answer as fields in JSON";

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const MockJsonResponse = result.response
        ?.text()
        .replace("```json", "")
        .replace("```", "");
      const responseText = await result.response?.text();

      if (responseText) {
        console.log(JSON.parse(MockJsonResponse));
        setJsonResponse(MockJsonResponse);

        if (MockJsonResponse) {
          const resp = await db
            .insert(MockInterview)
            .values({
              mockId: uuidv4(),
              jsonMockResp: MockJsonResponse,
              jobPosition: jobPosition,
              jobDesc: jobDesc,
              jobExperience: jobExperience,
              createdBy: user?.primaryEmailAddress?.emailAddress,
              createdAt: moment().format("YYYY-MM-DD HH"),
            })
            .returning();

          console.log("Inserted ID:", resp);
          if (resp) {
            setOpenDialog(false);
            router.push("/dashboard/interview/" + resp[0]?.mockId);
          }
        } else {
          console.log("error");
        }
        setLoading(false);
      } else {
        console.error("No response text available");
      }
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    }
  };
  console.log("DB object:", db);

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-gray-100 hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add new</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job interview
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <h2>Add Details about your Position</h2>
                <div className="mt-7 my-3">
                  <label>Job Role / Job Position</label>
                  <Input
                    placeholder="Ex. Full Stack Developer ..."
                    required
                    onChange={(e) => setJobPosition(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Job Description</label>
                  <Textarea
                    placeholder="Ex. React , NextJs , Python ..."
                    required
                    onChange={(e) => setJobDesc(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Years of experience</label>
                  <Input
                    placeholder="Ex. 5"
                    max="35"
                    type="number"
                    required
                    onChange={(e) => setJobExperience(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-5 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Generating...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
