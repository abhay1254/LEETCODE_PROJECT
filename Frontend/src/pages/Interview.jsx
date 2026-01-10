import { useState } from 'react';
import { NavLink } from 'react-router';
import { 
  Sparkles, User, Code, FileQuestion, ChevronRight, 
  Briefcase, Zap, Target, Brain, MessageSquare, 
  CheckCircle2, Star, TrendingUp, Award, ArrowLeft,
  Clock, Users, BookOpen, Mic
} from 'lucide-react';

function InterviewPage() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 'hr',
      title: 'HR Interview',
      subtitle: 'Master behavioral questions',
      description: 'Practice common HR questions, behavioral interviews, and situational scenarios with AI feedback',
      icon: Briefcase,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500',
      stats: [
        { label: 'Questions', value: '50+', icon: MessageSquare },
        { label: 'Avg Duration', value: '20 min', icon: Clock },
        { label: 'Difficulty', value: 'Easy', icon: Target }
      ],
      topics: [
        '💼 Tell me about yourself',
        '🎯 Strengths & weaknesses',
        '🚀 Career goals & motivation',
        '👥 Team collaboration scenarios',
        '🏆 Conflict resolution',
        '📈 Leadership experiences'
      ],
      benefits: [
        'Build confidence for real interviews',
        'Get feedback on communication style',
        'Practice STAR method responses',
        'Improve body language tips'
      ]
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      subtitle: 'Code with AI interviewer',
      description: 'Real-time coding challenges, system design questions, and technical problem-solving with live AI feedback',
      icon: Code,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500',
      stats: [
        { label: 'Problems', value: '100+', icon: Code },
        { label: 'Avg Duration', value: '45 min', icon: Clock },
        { label: 'Difficulty', value: 'Medium', icon: Target }
      ],
      topics: [
        '💻 Data structures & algorithms',
        '🏗️ System design questions',
        '⚡ Code optimization',
        '🔧 Debugging challenges',
        '🎨 API design',
        '📊 Database queries'
      ],
      benefits: [
        'Real-time code execution',
        'Instant performance feedback',
        'Industry-standard problems',
        'Time complexity analysis'
      ]
    },
    {
      id: 'questions',
      title: 'Interview Questions',
      subtitle: 'Browse & practice questions',
      description: 'Explore curated interview questions from top companies with detailed solutions and explanations',
      icon: FileQuestion,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500',
      stats: [
        { label: 'Total Questions', value: '500+', icon: BookOpen },
        { label: 'Companies', value: '50+', icon: Users },
        { label: 'Categories', value: '20+', icon: Target }
      ],
      topics: [
        '🏢 Company-specific questions',
        '📚 Topic-wise categorization',
        '✅ Detailed solutions',
        '💡 Best practices & tips',
        '🎯 Difficulty levels',
        '⭐ Community ratings'
      ],
      benefits: [
        'Learn from real interview experiences',
        'Bookmark favorite questions',
        'Track your preparation progress',
        'Access solution explanations'
      ]
    }
  ];

  if (selectedFeature) {
    const feature = features.find(f => f.id === selectedFeature);
    const Icon = feature.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Header */}
        <div className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button 
              onClick={() => setSelectedFeature(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to features</span>
            </button>
          </div>
        </div>

        {/* Feature Detail Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-3xl mb-6 shadow-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {feature.title}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {feature.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {feature.stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center`}>
                      <StatIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Topics */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-400" />
                What You'll Practice
              </h3>
              <div className="space-y-3">
                {feature.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-150 transition-transform"></div>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                Key Benefits
              </h3>
              <div className="space-y-4">
                {feature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6" />
              <span>Start {feature.title} Now</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-slate-400 text-sm mt-4">Coming soon - Feature under development</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeCraft
                </div>
                <div className="text-xs text-slate-400">AI Interview Portal</div>
              </div>
            </NavLink>

            <NavLink 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero Welcome Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="mb-8 inline-block relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Interview Hub
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Practice with AI, master interviews, and land your dream job.
          <span className="block mt-2 text-blue-400 font-semibold">Choose your path below 👇</span>
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-xl">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm">500+ Questions Available</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-xl">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-slate-300 text-sm">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-xl">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">10k+ Users</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">
          Select Interview Type
        </h2>
        <p className="text-center text-slate-400 mb-12 text-lg">
          Choose the interview format you want to practice
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const routePath = feature.id === 'hr' ? '/hr-interview' : 
                             feature.id === 'technical' ? '/technical-interview' : 
                             '/interview-questions';
            
            return (
              <NavLink 
                key={feature.id}
                to={routePath}
                className="group relative cursor-pointer block"
              >
                {/* Card Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                
                {/* Card Content */}
                <div className={`relative bg-gradient-to-br ${feature.bgGradient} border-2 ${feature.borderColor} rounded-3xl p-8 backdrop-blur-xl hover:scale-105 transition-all duration-300 h-full flex flex-col`}>
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 font-semibold">
                    {feature.subtitle}
                  </p>
                  <p className="text-slate-300 mb-6 flex-grow leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stats Preview */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {feature.stats.slice(0, 2).map((stat, index) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={index} className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <StatIcon className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{stat.label}</span>
                          </div>
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${feature.gradient} rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all group-hover:translate-x-1`}>
                    <span>Start Practice</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
            <Mic className="w-6 h-6 text-blue-400" />
            <p className="text-slate-300">
              <span className="font-bold text-white">Pro Tip:</span> Start with HR interviews to build confidence, then move to technical challenges!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;