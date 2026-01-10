import React, { useState } from 'react';
import { Lock, Trophy, Users, Calendar, Award, Zap, Clock, Target, Star, TrendingUp, CheckCircle, Crown, Sparkles } from 'lucide-react';

function Contests() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const features = [
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Weekly Contests",
      description: "Participate in curated weekly coding contests with real-time rankings"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Past Contest Archive",
      description: "Access 500+ past contests to practice and improve your skills"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certificates & Badges",
      description: "Earn verified certificates and showcase your achievements"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Compete with Peers",
      description: "Join a community of 100K+ competitive programmers worldwide"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Live Leaderboards",
      description: "Real-time rankings and performance analytics during contests"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Mock Interviews",
      description: "Timed interview simulations with company-specific problems"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Rating System",
      description: "Track your progress with ELO-based rating system"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Detailed Editorials",
      description: "In-depth solutions and video explanations for every problem"
    }
  ];

  const contestTypes = [
    {
      name: "Weekly Contest",
      frequency: "Every Sunday",
      duration: "90 minutes",
      problems: "4-5 Problems",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Biweekly Challenge",
      frequency: "Every 2 Weeks",
      duration: "120 minutes",
      problems: "5-6 Problems",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Monthly Championship",
      frequency: "Last Saturday",
      duration: "180 minutes",
      problems: "6-8 Problems",
      color: "from-orange-500 to-red-500"
    }
  ];

  const plans = [
    {
      name: "Monthly",
      price: billingCycle === 'monthly' ? 19 : 15,
      period: "month",
      savings: null,
      popular: false
    },
    {
      name: "Yearly",
      price: billingCycle === 'yearly' ? 180 : 180,
      period: "year",
      savings: "Save 21%",
      popular: true
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "SDE @ Google",
      rating: 2156,
      comment: "Premium contests helped me crack my dream job! The mock interviews are incredibly realistic.",
      avatar: "AC"
    },
    {
      name: "Priya Sharma",
      role: "Student @ IIT Delhi",
      rating: 1987,
      comment: "Best investment for competitive programming. The editorials are super detailed and helpful.",
      avatar: "PS"
    },
    {
      name: "Michael Johnson",
      role: "SDE @ Microsoft",
      rating: 2234,
      comment: "Went from 1400 to 2200 rating in 6 months. The weekly contests keep me sharp!",
      avatar: "MJ"
    }
  ];

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
        
    
   
    
   
   
      {/* Breaking News Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 overflow-hidden">
        <div className="py-3">
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-8">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-5 rounded uppercase">
                  Notice
                </span>
                <p className="text-white font-semibold text-sm md:text-base">
                  ⚠️ Payment feature integration in progress - Coming soon! Thank you for your patience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
      












      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full mb-6">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Premium Content</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Unlock Elite Contests
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Join thousands of competitive programmers who are sharpening their skills through 
              challenging contests, climbing leaderboards, and landing their dream jobs.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>500+ Past Contests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Weekly Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Live Rankings</span>
              </div>
            </div>
          </div>

          {/* Lock Visual */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-30"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 rounded-3xl p-12">
                <Lock className="w-32 h-32 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contest Types */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Contest Schedule</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {contestTypes.map((contest, index) => (
            <div key={index} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className={`inline-block px-4 py-2 bg-gradient-to-r ${contest.color} rounded-lg mb-4`}>
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{contest.name}</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>📅 {contest.frequency}</p>
                <p>⏱️ {contest.duration}</p>
                <p>📝 {contest.problems}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Excel</h2>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          Get access to premium features designed to accelerate your competitive programming journey
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
              <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-center text-slate-400 mb-8">Start competing today and level up your skills</p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-8 ${
                plan.popular
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              {plan.savings && (
                <p className="text-emerald-400 text-sm mb-4">{plan.savings}</p>
              )}

              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-slate-400">/{plan.period}</span>
              </div>

              <button className={`w-full py-4 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}>
                Get Started
              </button>

              <div className="mt-6 space-y-3">
                {[
                  'Unlimited contest access',
                  'All past contests',
                  'Detailed editorials',
                  'Performance analytics',
                  'Certificate of completion',
                  'Priority support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Loved by Top Performers</h2>
        <p className="text-center text-slate-400 mb-12">See what our community has to say</p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-slate-400">Rating: {testimonial.rating}</span>
              </div>
              <p className="text-slate-300 text-sm italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-3xl p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h2 className="text-4xl font-bold mb-4">Ready to Compete?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join elite coders, solve challenging problems, and climb the leaderboard. 
            Your competitive programming journey starts here.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-lg transition-all inline-flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Upgrade to Premium
          </button>
          <p className="text-sm text-slate-400 mt-4">30-day money-back guarantee • Cancel anytime</p>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I access past contests?",
              a: "Yes! Premium members get unlimited access to 500+ past contests with full editorials."
            },
            {
              q: "How does the rating system work?",
              a: "We use an ELO-based rating system similar to Codeforces and AtCoder. Your rating updates after each contest."
            },
            {
              q: "Can I cancel anytime?",
              a: "Absolutely! You can cancel your subscription at any time with no questions asked."
            }
          ].map((faq, index) => (
            <details key={index} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-slate-400 mt-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contests;