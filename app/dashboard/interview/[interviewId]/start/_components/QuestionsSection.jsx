import { LightbulbIcon, Volume2 } from "lucide-react";
import React, { useState } from "react";

function QuestionsSection({ mockInterviewQuestions, activeQuestionIndex }) {
  const [speechInstance, setSpeechInstance] = useState(null);

  function textToSpeech(text) {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.speak) {
        if (speechInstance && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setSpeechInstance(null);
        } else {
          const speech = new SpeechSynthesisUtterance(text);
          speech.onend = () => setSpeechInstance(null);
          setSpeechInstance(speech);
          window.speechSynthesis.speak(speech);
        }
      } else {
        console.error("speechSynthesis.speak is not a function");
        alert("Speech synthesis speak function is not supported");
      }
    } else {
      console.error("Speech synthesis not supported in this browser");
      alert("Speech synthesis not supported");
    }
  }

  return (
    mockInterviewQuestions && (
      <div className="p-5 border rounded-lg my-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockInterviewQuestions.map((question, index) => (
            <h2
              key={index}
              className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer ${
                index === activeQuestionIndex ? "bg-blue-500 text-white" : ""
              }`}
            >
              Questions #{index + 1}
            </h2>
          ))}
        </div>
        <h2 className="my-5 text-md md:text-lg">
          {mockInterviewQuestions[activeQuestionIndex]?.question}
        </h2>
        <Volume2
          className="cursor-pointer"
          onClick={() =>
            textToSpeech(mockInterviewQuestions[activeQuestionIndex]?.question)
          }
        />
        <div className="border rounded-lg p-5 bg-blue-100 mt-20">
          <h2 className="flex gap-2 items-center text-blue-700">
            <LightbulbIcon />
            <strong>Note :</strong>
          </h2>
          <h2 className="text-md text-blue-800 my-2">
            {process.env.NEXT_PUBLIC_QUESTION_NOTE}
          </h2>
        </div>
      </div>
    )
  );
}

export default QuestionsSection;
