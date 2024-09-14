"use client";
import { MockInterview } from "@/utils/schema";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import Webcam from "react-webcam";
import { Lightbulb, WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState([]);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
    setInterviewData(result[0]);
  };

  return (
    <motion.div
      className="my-10 container mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-bold text-4xl text-center mb-8 text-gradient bg-gradient-to-r">
        Let's Get Started
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div
          className="flex flex-col gap-5"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition duration-300 ease-in-out border-none bg-zinc-50 text-black">
            <CardHeader>
              <h2 className="text-xl">
                <strong>Job Role / Job Position:</strong>
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-md">{interviewData.jobPosition}</p>
            </CardContent>
            <CardHeader>
              <h2 className="text-xl">
                <strong>Job Description / Tech Stack:</strong>
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-md">{interviewData.jobDesc}</p>
            </CardContent>
            <CardHeader>
              <h2 className="text-xl">
                <strong>Job Experience:</strong>
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-md">{interviewData.jobExperience}</p>
            </CardContent>
          </Card>

          <motion.div
            className="p-5 rounded-lg border-2 border-yellow-300 bg-yellow-100"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="flex gap-2 items-center text-yellow-600 text-lg">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <p className="mt-3 text-yellow-600">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              className="h-72 w-96 rounded-lg border-4 border-secondary"
            />
          ) : (
            <>
              <WebcamIcon className="h-72 w-96 my-7 p-20 bg-secondary rounded-lg border" />
              <Button
                onClick={() => setWebCamEnabled(true)}
                className="w-[300px] hover:bg-secondary transition duration-300 ease-in-out"
                variant="ghost"
              >
                Enable WebCam and Microphone
              </Button>
            </>
          )}
        </motion.div>
      </div>

      <div className="flex justify-center items-center mt-10">
        <Link href={"/dashboard/interview/" + params.interviewId + "/start"}>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl w-[300px]">
            Start Interview
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default Interview;
