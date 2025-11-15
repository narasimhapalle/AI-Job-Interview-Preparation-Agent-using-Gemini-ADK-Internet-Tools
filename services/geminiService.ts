
import { GoogleGenAI } from "@google/genai";
import { InterviewPrepData } from '../types';

const getInterviewPrep = async (companyName: string): Promise<InterviewPrepData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an expert AI Job Interview Preparation Agent. Your task is to generate a comprehensive interview preparation guide for the company: "${companyName}".

    Use the Google Search tool to find the most recent and relevant information available on the internet about interview processes, typical questions, salary data, and company culture for "${companyName}".

    Please provide the output as a single, valid JSON object. Do not include any text or markdown formatting like \`\`\`json before or after the JSON object. The JSON object should strictly adhere to the following structure:

    {
      "companyName": "${companyName}",
      "interviewQuestions": {
        "title": "Recent Internet-Based Interview Questions",
        "questions": [
          { "question": "...", "topic": "Data Structures", "difficulty": "Medium" },
          { "question": "...", "topic": "System Design", "difficulty": "Hard" },
          { "question": "...", "topic": "Behavioral", "difficulty": "Easy" }
        ]
      },
      "codingRound": {
        "title": "Coding Round Analysis",
        "difficultyAnalysis": "Overall, the coding rounds are considered [Easy/Medium/Hard]...",
        "sampleProblems": [
          {
            "problem": "Sample coding problem title...",
            "description": "Detailed description of the problem.",
            "solution": {
              "python": "...",
              "java": "..."
            }
          }
        ]
      },
      "roleInsights": {
        "title": "Role Insights (Software Engineer)",
        "skillsRequired": ["Skill 1", "Skill 2", "..."],
        "hiringPattern": "Typically consists of X rounds including...",
        "numberOfRounds": "E.g., 3-5 rounds"
      },
      "sampleAnswers": {
        "title": "Sample HR Round Answers",
        "answers": [
          { "question": "Tell me about yourself.", "answer": "..." },
          { "question": "What are your strengths and weaknesses?", "answer": "..." },
          { "question": "Why should we hire you at ${companyName}?", "answer": "..." }
        ]
      },
      "studyPlan": {
        "title": "Customized 14-Day Study Plan",
        "plan": [
          { "days": "Day 1-3", "topic": "Arrays & Strings", "details": "Focus on common problems like two-pointers, sliding window..." },
          { "days": "Day 4-6", "topic": "Trees & Graphs", "details": "Practice BFS, DFS, and common traversal algorithms." },
          { "days": "Day 7-9", "topic": "Dynamic Programming", "details": "Start with classic problems like Fibonacci, Knapsack..." },
          { "days": "Day 10-12", "topic": "System Design", "details": "Study concepts like load balancing, caching, databases." },
          { "days": "Day 13-14", "topic": "Mock Interviews & Behavioral Prep", "details": "Practice with a peer, refine your stories for behavioral questions." }
        ]
      },
      "salaryRange": {
        "title": "Expected Salary Range (India, SDE-1)",
        "entryLevel": "₹X - ₹Y LPA",
        "midLevel": "₹Y - ₹Z LPA",
        "freshers": "₹A - ₹B LPA",
        "note": "Salary ranges are estimates based on recent data and can vary based on location, role, and individual experience."
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text.trim();
    // Clean up potential markdown code block fences
    const jsonString = text.replace(/^```json\s*|```$/g, '');
    
    const parsedData: InterviewPrepData = JSON.parse(jsonString);
    return parsedData;

  } catch (error) {
    console.error("Error fetching or parsing data from Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    throw new Error("An error occurred while generating the interview prep guide.");
  }
};

export default getInterviewPrep;
