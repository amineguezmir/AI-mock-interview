"use client";
import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { chatSession } from "@/utils/GeminiAIModal";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestions,
  activeQuestionIndex,
  interviewData,
}) {
  const [isSupported, setIsSupported] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results = [],
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    console.log("Speech Results:", results);
    setUserAnswer((prevAnswer) =>
      results.reduce((acc, result) => acc + result.transcript, prevAnswer)
    );
  }, [results]);

  useEffect(() => {
    console.log("Is Recording:", isRecording);
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswerInDb();
    }
  }, [userAnswer, isRecording]);

  const StartStopRecording = async () => {
    if (isRecording) {
      setLoading(true);
      stopSpeechToText();
      console.log("Stopping recording, current userAnswer:", userAnswer);
      try {
        await UpdateUserAnswerInDb();
      } catch (error) {
        console.error("Error sending message to chatSession:", error);
      } finally {
        setLoading(false);
      }
    } else {
      startSpeechToText();
    }
  };

  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setIsSupported(false);
    }
  }, []);

  if (error) {
    console.error("Speech-to-text error:", error);
  }

  if (!isSupported) {
    return (
      <div>
        <p>
          Speech recognition is not supported in your browser. Please use Google
          Chrome for this feature.
        </p>
      </div>
    );
  }

  const UpdateUserAnswerInDb = async () => {
    console.log("User Answer:", userAnswer);

    setLoading(true);
    const feedbackPrompt =
      "Question : " +
      mockInterviewQuestions[activeQuestionIndex]?.question +
      ", User Answer :" +
      userAnswer +
      ", Depends on the Questions and the User Answers with a rating out of 10 in, in JSON format";

    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const responseText = await result.response.text();

      let cleanedResponse = responseText
        .replace(/```json\s*/, "")
        .replace(/```$/, "")
        .trim();

      cleanedResponse = cleanedResponse
        .replace(/^[^\{]*/, "")
        .replace(/[^}]*$/, "");

      console.log("Cleaned Response Text:", cleanedResponse);
      console.log("Mock Interview Questions:", mockInterviewQuestions);
      console.log("Active Question Index:", activeQuestionIndex);
      console.log(
        "Current Question:",
        mockInterviewQuestions[activeQuestionIndex]
      );

      if (cleanedResponse) {
        try {
          const JsonFeedBackResp = JSON.parse(cleanedResponse);

          const res = await db.insert(UserAnswer).values({
            mockIdRef: interviewData.mockId,
            question: mockInterviewQuestions[activeQuestionIndex]?.question,
            correctAnswer:
              mockInterviewQuestions[activeQuestionIndex]?.correctAnswer,
            userAnswer: userAnswer,
            feedback: JsonFeedBackResp?.feedback,
            rating: JsonFeedBackResp?.rating,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("YYYY-MM-DD HH"),
          });
          console.log("Inserting into DB:", {
            mockIdRef: interviewData.mockId,
            question: mockInterviewQuestions[activeQuestionIndex]?.question,
            correctAnswer:
              mockInterviewQuestions[activeQuestionIndex]?.correctAnswer,
            userAnswer: userAnswer,
            feedback: JsonFeedBackResp?.feedback,
            rating: JsonFeedBackResp?.rating,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("YYYY-MM-DD HH"),
          });
          console.log("Mock Interview Questions:", mockInterviewQuestions);
          console.log("Active Question Index:", activeQuestionIndex);
          console.log(
            "Current Question:",
            mockInterviewQuestions[activeQuestionIndex]
          );

          if (res) {
            toast("success", "User answer recorded");
            setUserAnswer("");
            setResults([]);
          }
          setResults([]);
          setLoading(false);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
          toast("error", "Failed to parse response JSON");
        }
      } else {
        console.error("No valid JSON found in response");
        toast("error", "No valid JSON found in response");
      }
    } catch (error) {
      console.error("Error updating user answer in DB:", error);
      toast("error", "Error updating user answer in DB");
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 relative">
        <Image
          src="/webcam.png"
          width={200}
          height={200}
          className="absolute"
          alt="Webcam"
        />
        <Webcam
          mirrored={true}
          style={{ width: "100%", height: 300, zIndex: 10 }}
        />
      </div>
      <Button variant="outline" className="mt-10" onClick={StartStopRecording}>
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle /> Stop Recording
          </h2>
        ) : (
          <h2>Start Recording</h2>
        )}
      </Button>

      {/* <Button className="mt-4" onClick={() => console.log(userAnswer)}>
        Show User Answer
      </Button> */}
    </div>
  );
}

export default RecordAnswerSection;
