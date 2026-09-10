'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Sparkles, 
  Atom, 
  Users, 
  Heart, 
  Star, 
  Zap, 
  Crown,
  MessageCircle,
  BarChart3,
  Shield,
  Settings,
  TrendingUp
} from 'lucide-react';

const revolutionaryFeatures = [
  {
    title: 'Neural Interface',
    description: 'Brain-computer interface for direct neural shopping',
    icon: Brain,
    href: '/neural-interface',
    color: 'text-blue-600'
  },
  {
    title: 'Holographic System',
    description: '3D holographic product visualization and AR experiences',
    icon: Sparkles,
    href: '/holographic',
    color: 'text-purple-600'
  },
  {
    title: 'Quantum Computing',
    description: 'Quantum predictions and teleportation technology',
    icon: Atom,
    href: '/quantum',
    color: 'text-green-600'
  },
  {
    title: 'DNA Analysis',
    description: 'Genetic personalization and biological optimization',
    icon: Heart,
    href: '/dna-analysis',
    color: 'text-red-600'
  },
  {
    title: 'Live Shopping',
    description: 'Real-time holographic commerce with neural bidding',
    icon: Users,
    href: '/live-shopping',
    color: 'text-orange-600'
  },
  {
    title: 'Digital Twin',
    description: 'Virtual replica shopping with time travel capabilities',
    icon: Star,
    href: '/digital-twin',
    color: 'text-yellow-600'
  },
  {
    title: 'Style Evolution',
    description: 'AI fashion time machine and trend forecasting',
    icon: TrendingUp,
    href: '/style-evolution',
    color: 'text-indigo-600'
  },
  {
    title: 'Social Capital',
    description: 'Influence monetization and social shopping economy',
    icon: Crown,
    href: '/social-capital',
    color: 'text-pink-600'
  },
  {
    title: 'Shopping Games',
    description: 'Gamified commerce with achievements and rewards',
    icon: Zap,
    href: '/shopping-games',
    color: 'text-cyan-600'
  },
  {
    title: 'Bio-Hacking',
    description: 'Biological optimization and real-time biometrics',
    icon: Heart,
    href: '/bio-hacking',
    color: 'text-emerald-600'
  },
  {
    title: 'Personal Shopper AI',
    description: 'AI-powered life planning and personal shopping',
    icon: MessageCircle,
    href: '/personal-shopper',
    color: 'text-teal-600'
  },
  {
    title: 'Reality Customization',
    description: 'Physics manipulation and dimensional configuration',
    icon: Settings,
    href: '/reality-customization',
    color: 'text-slate-600'
  },
  {
    title: 'Style Tribe',
    description: 'Collective shopping and trend-setting communities',
    icon: Users,
    href: '/style-tribe',
    color: 'text-violet-600'
  },
  {
    title: 'Trend Council',
    description: 'Elite trendsetters and predictive trend validation',
    icon: Crown,
    href: '/trend-council',
    color: 'text-amber-600'
  },
  {
    title: 'Luxury Products',
    description: 'Beyond-commerce items and quantum collectibles',
    icon: Star,
    href: '/luxury-products',
    color: 'text-rose-600'
  },
  {
    title: 'Emotional Truth',
    description: 'Review authenticity verification with neural analysis',
    icon: Shield,
    href: '/emotional-truth',
    color: 'text-lime-600'
  },
  {
    title: 'Reviews 2.0',
    description: 'Neural-powered review analysis and insights',
    icon: BarChart3,
    href: '/reviews-2.0',
    color: 'text-fuchsia-600'
  }
];

export default function RevolutionaryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Revolutionary Features</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience the future of shopping with cutting-edge technologies including neural interfaces, 
          quantum computing, holographic displays, and AI-powered personalization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revolutionaryFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link key={index} href={feature.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button variant="outline" className="w-full">
                    Experience Now
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
