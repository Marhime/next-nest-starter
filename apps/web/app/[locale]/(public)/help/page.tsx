'use client';

import {
  Box,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface HelpCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  articles: number;
}

interface PopularTopic {
  title: string;
  href: string;
}

interface Help1Props {
  title?: string;
  categories?: HelpCategory[];
  popularTopics?: PopularTopic[];
  className?: string;
}

const DEFAULT_CATEGORIES: HelpCategory[] = [
  {
    icon: <Package className="size-6" />,
    title: 'Orders',
    description: 'Track, modify, or cancel orders',
    articles: 12,
  },
  {
    icon: <Truck className="size-6" />,
    title: 'Shipping',
    description: 'Delivery options and tracking',
    articles: 8,
  },
  {
    icon: <RotateCcw className="size-6" />,
    title: 'Returns & Refunds',
    description: 'Return policy and process',
    articles: 15,
  },
  {
    icon: <CreditCard className="size-6" />,
    title: 'Payments',
    description: 'Payment methods and issues',
    articles: 10,
  },
  {
    icon: <User className="size-6" />,
    title: 'Account',
    description: 'Profile, password, and settings',
    articles: 7,
  },
  {
    icon: <ShoppingBag className="size-6" />,
    title: 'Products',
    description: 'Sizing, care, and availability',
    articles: 9,
  },
];

const DEFAULT_TOPICS: PopularTopic[] = [
  { title: 'Where is my order?', href: '#' },
  { title: 'How to return an item', href: '#' },
  { title: 'Forgot my password', href: '#' },
  { title: 'Payment not going through', href: '#' },
  { title: 'Size guide', href: '#' },
  { title: 'Shipping to my country', href: '#' },
];

const HelpPage = ({
  title = 'Help Center',
  categories = DEFAULT_CATEGORIES,
  popularTopics = DEFAULT_TOPICS,
  className,
}: Help1Props) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container max-w-5xl mx-auto">
        {/* Header with Search */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            How can we help you today?
          </p>

          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 text-base"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group cursor-pointer gap-0 p-0 transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{category.title}</h3>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {category.articles} articles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="rounded-lg border bg-muted/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <HelpCircle className="size-5" />
            Popular Topics
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.href}
                className="flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-background"
              >
                <ChevronRight className="size-4 text-muted-foreground" />
                {topic.title}
              </a>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Button className="mt-3">Contact Support</Button>
        </div>
      </div>
    </section>
  );
};

export default HelpPage;
