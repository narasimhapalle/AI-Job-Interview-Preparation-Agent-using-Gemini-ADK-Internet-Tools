
import React, { useState, useRef } from 'react';
import getInterviewPrep from './services/geminiService';
import type { InterviewPrepData } from './types';
import Loader from './components/Loader';
import CodeBlock from './components/CodeBlock';
import { BriefcaseIcon, CodeIcon, UsersIcon, CalendarIcon, DollarSignIcon, HelpCircleIcon, DownloadIcon } from './components/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrepData(null);

    try {
      const data = await getInterviewPrep(companyName);
      setPrepData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!resultsRef.current || !prepData) return;

    setIsPdfGenerating(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        backgroundColor: '#1f2937', 
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${prepData.companyName.replace(/\s+/g, '_')}_Interview_Prep.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Could not generate PDF. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  };


  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
            AI Job Interview Prep Agent
          </h1>
          <p className="text-lg text-content/70 max-w-2xl mx-auto">
            Enter a company name to get a personalized interview prep guide powered by Gemini and real-time web search.
          </p>
        </header>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="flex items-center gap-2 p-1.5 bg-base-200 rounded-full shadow-lg">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Infosys, TCS..."
              className="w-full bg-transparent p-3 pl-5 text-content placeholder-content/50 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-light text-white font-semibold rounded-full transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Generate'}
            </button>
          </div>
        </form>

        {isLoading && <Loader text={`Gathering intel on ${companyName}...`} />}
        {error && <div className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg max-w-xl mx-auto">{error}</div>}

        {prepData && (
          <div className="relative">
            <button
              onClick={handleExportPdf}
              disabled={isPdfGenerating}
              className="sticky top-4 z-10 float-right flex items-center gap-2 px-4 py-2 mb-4 bg-brand-secondary hover:bg-purple-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 disabled:bg-base-300"
            >
              {isPdfGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <DownloadIcon className="w-5 h-5" />
                  Export as PDF
                </>
              )}
            </button>

            <div ref={resultsRef} id="pdf-content" className="space-y-8 clear-both">
              {/* Interview Questions */}
              <SectionCard icon={<HelpCircleIcon />} title={prepData.interviewQuestions.title}>
                <ul className="space-y-4">
                  {prepData.interviewQuestions.questions.map((q, i) => (
                    <li key={i} className="p-4 bg-base-200 rounded-lg">
                      <p className="font-semibold">{q.question}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-content/70">
                        <span>Topic: <span className="font-medium text-content/90">{q.topic}</span></span>
                        <span className="w-1 h-1 bg-content/50 rounded-full"></span>
                        <span>Difficulty: <span className="font-medium text-content/90">{q.difficulty}</span></span>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
              
              {/* Coding Round Analysis */}
              <SectionCard icon={<CodeIcon />} title={prepData.codingRound.title}>
                <p className="mb-6 p-4 bg-base-200 rounded-lg">{prepData.codingRound.difficultyAnalysis}</p>
                {prepData.codingRound.sampleProblems.map((p, i) => (
                  <div key={i} className="mb-6">
                    <h4 className="font-bold text-lg mb-2">{p.problem}</h4>
                    <p className="mb-2 text-content/80">{p.description}</p>
                    <CodeBlock code={p.solution.python} language="Python" />
                    <CodeBlock code={p.solution.java} language="Java" />
                  </div>
                ))}
              </SectionCard>

              {/* Role Insights */}
              <SectionCard icon={<BriefcaseIcon />} title={prepData.roleInsights.title}>
                <div className="grid md:grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-bold text-brand-light mb-2">Hiring Pattern</h4>
                        <p>{prepData.roleInsights.hiringPattern}</p>
                        <p className="text-sm text-content/70">({prepData.roleInsights.numberOfRounds})</p>
                    </div>
                    <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-bold text-brand-light mb-2">Required Skills</h4>
                        <ul className="flex flex-wrap justify-center gap-2">
                           {prepData.roleInsights.skillsRequired.map((skill, i) => <li key={i} className="bg-base-300 px-3 py-1 rounded-full text-sm">{skill}</li>)}
                        </ul>
                    </div>
                </div>
              </SectionCard>
              
              {/* HR Sample Answers */}
              <SectionCard icon={<UsersIcon />} title={prepData.sampleAnswers.title}>
                 <div className="space-y-6">
                  {prepData.sampleAnswers.answers.map((a, i) => (
                    <div key={i} className="p-4 bg-base-200 rounded-lg">
                      <p className="font-semibold text-brand-light mb-2">{a.question}</p>
                      <p className="text-content/80 whitespace-pre-line">{a.answer}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Study Plan */}
              <SectionCard icon={<CalendarIcon />} title={prepData.studyPlan.title}>
                <div className="space-y-4">
                  {prepData.studyPlan.plan.map((day, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-base-200 rounded-lg">
                      <div className="font-bold text-brand-light md:w-1/4">{day.days}</div>
                      <div className="md:w-3/4">
                        <p className="font-semibold">{day.topic}</p>
                        <p className="text-sm text-content/70">{day.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Salary Range */}
              <SectionCard icon={<DollarSignIcon />} title={prepData.salaryRange.title}>
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-semibold text-content/70 mb-1">Freshers</h4>
                        <p className="text-xl font-bold text-green-400">{prepData.salaryRange.freshers}</p>
                    </div>
                     <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-semibold text-content/70 mb-1">Entry-Level (1-2 YOE)</h4>
                        <p className="text-xl font-bold text-green-400">{prepData.salaryRange.entryLevel}</p>
                    </div>
                     <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-semibold text-content/70 mb-1">Mid-Level (3-5 YOE)</h4>
                        <p className="text-xl font-bold text-green-400">{prepData.salaryRange.midLevel}</p>
                    </div>
                </div>
                <p className="text-center mt-6 text-sm text-content/60">{prepData.salaryRange.note}</p>
              </SectionCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface SectionCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => {
    return (
        <section className="bg-base-200/50 border border-base-300 rounded-2xl shadow-lg">
            <header className="flex items-center gap-4 p-4 border-b border-base-300">
                <div className="text-brand-primary bg-brand-primary/10 p-2 rounded-lg">
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
                </div>
                <h2 className="text-2xl font-bold text-content">{title}</h2>
            </header>
            <div className="p-6">
                {children}
            </div>
        </section>
    );
};

export default App;
