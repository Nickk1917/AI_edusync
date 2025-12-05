
import React from 'react';
import { QuizResult, AppView } from '../types';

interface DashboardProps {
    history: QuizResult[];
    onNavigate: (view: AppView) => void;
    userName?: string;
}

export const DashboardSection: React.FC<DashboardProps> = ({ history, onNavigate, userName = "Student" }) => {
  
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalTests) 
    : 0;

  // Calculate generic "mastery" based on high scores
  const masteryCount = history.filter(h => (h.percentage || 0) >= 80).length;

  const getEncouragement = () => {
    if (totalTests === 0) return "Ready to start your learning journey? Upload your first note!";
    if (avgScore >= 90) return "You're on fire! Keep up the excellent work.";
    if (avgScore >= 70) return "Great progress! Consistent practice is key.";
    return "Don't give up! Review your notes and try again.";
  };

  // Generate Graph Points
  // We'll show the last 10 quizzes
  const recentHistory = [...history].slice(-10);
  
  const graphData = recentHistory.map((h, i) => ({
    x: i,
    y: h.percentage || 0,
    label: h.topic?.substring(0, 10) + '...'
  }));

  const renderGraph = () => {
    if (graphData.length < 2) return null;

    const height = 150;
    const width = 100; // Percentage width
    const maxVal = 100;
    
    // Scale points to SVG coordinates
    // We'll distribute X evenly: 0% to 100%
    const points = graphData.map((d, i) => {
        const x = (i / (graphData.length - 1)) * 100;
        const y = height - (d.y / maxVal) * height; // Invert Y
        return `${x},${y}`;
    }).join(' ');

    const fillPoints = `0,${height} ${points} 100,${height}`;

    return (
        <div className="w-full h-48 relative mt-4">
             <svg className="w-full h-full overflow-visible" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1={height/2} x2="100" y2={height/2} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1={height} x2="100" y2={height} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5" />

                {/* Area Fill */}
                <polygon points={fillPoints} className="fill-brand-500/10 dark:fill-brand-400/10" />

                {/* Line */}
                <polyline points={points} fill="none" stroke="currentColor" className="text-brand-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots */}
                {graphData.map((d, i) => {
                    const x = (i / (graphData.length - 1)) * 100;
                    const y = height - (d.y / maxVal) * height;
                    return (
                        <circle key={i} cx={x} cy={y} r="3" className="fill-brand-600 dark:fill-brand-400 stroke-white dark:stroke-gray-800 hover:scale-150 transition-transform cursor-pointer">
                            <title>{d.label}: {d.y}%</title>
                        </circle>
                    );
                })}
             </svg>
             <div className="flex justify-between text-xs text-gray-400 mt-2">
                 <span>Oldest</span>
                 <span>Latest</span>
             </div>
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {userName}! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{getEncouragement()}</p>
        </div>
        <button 
            onClick={() => onNavigate(AppView.UPLOAD)}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 flex items-center gap-2"
        >
            <span>+</span> New Study Set
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tests Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">📝</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Total Quizzes Taken</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{totalTests}</span>
                <span className="text-sm text-green-500 font-medium">Lifetime</span>
            </div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🎯</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Average Score</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${avgScore >= 80 ? 'text-green-500' : avgScore >= 60 ? 'text-yellow-500' : 'text-gray-900 dark:text-white'}`}>
                    {avgScore}%
                </span>
                <span className="text-sm text-gray-400">Performance</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-yellow-500' : 'bg-brand-500'}`} 
                    style={{ width: `${avgScore}%` }}
                ></div>
            </div>
        </div>

        {/* Mastery Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🏆</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Topics Mastered</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{masteryCount}</span>
                <span className="text-sm text-gray-400">Scored 80%+</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Report & Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Performance History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your progress over the last 10 quizzes</p>
            
            {history.length > 1 ? (
                renderGraph()
            ) : (
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
                    Take at least 2 quizzes to see your trend graph.
                </div>
            )}

            <div className="mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Quizzes</h4>
                {history.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p>No quizzes taken yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[...history].reverse().slice(0, 5).map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                                        ${(result.percentage || 0) >= 80 ? 'bg-green-500' : (result.percentage || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                                    `}>
                                        {result.percentage}%
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{result.topic || 'Untitled Quiz'}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(result.timestamp || Date.now()).toLocaleDateString()} • {result.score}/{result.total} Correct
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-medium px-2 py-1 rounded-md 
                                        ${(result.percentage || 0) >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                          (result.percentage || 0) >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}
                                    `}>
                                        {(result.percentage || 0) >= 80 ? 'Excellent' : (result.percentage || 0) >= 60 ? 'Good' : 'Needs Work'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Quick Report / Insight */}
        <div className="bg-brand-600 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-yellow-400 opacity-20 rounded-full blur-2xl"></div>
            
            <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>📊</span> Insight
                </h3>
                <div className="space-y-4 relative z-10">
                    <div>
                        <p className="text-brand-100 text-sm mb-1">Total Questions Answered</p>
                        <p className="text-3xl font-bold">{history.reduce((acc, curr) => acc + curr.total, 0)}</p>
                    </div>
                    <div>
                        <p className="text-brand-100 text-sm mb-1">Study Streak</p>
                        <p className="text-3xl font-bold">{totalTests > 0 ? Math.min(totalTests, 5) : 0} Days 🔥</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <p className="text-sm text-brand-100 italic opacity-90">
                    "{totalTests === 0 ? "Every expert was once a beginner." : "Success is the sum of small efforts, repeated day in and day out."}"
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};