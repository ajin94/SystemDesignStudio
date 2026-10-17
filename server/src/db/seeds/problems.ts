import type { Difficulty } from '@sds/shared';

export interface ProblemSeed {
  id: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  tags: string[];
}

export const PROBLEM_SEEDS: ProblemSeed[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'easy',
    tags: ['Hashing', 'key generation', 'read-heavy caching'],
    prompt:
      'Design a service that turns long URLs into short links and redirects visitors to the original URL. Consider key generation, link expiry, and a heavily read-skewed workload.',
  },
  {
    id: 'design-twitter',
    title: 'Design Twitter',
    difficulty: 'medium',
    tags: ['Fan-out', 'timelines', 'ranking'],
    prompt:
      'Design a social network where users post short messages, follow other users, and view a home timeline of posts from accounts they follow.',
  },
  {
    id: 'ride-sharing',
    title: 'Ride Sharing',
    difficulty: 'hard',
    tags: ['Geo-indexing', 'matching', 'real-time location'],
    prompt:
      'Design a ride-hailing service that matches riders with nearby drivers, tracks driver locations in real time, and manages the trip lifecycle.',
  },
  {
    id: 'chat-application',
    title: 'Chat Application',
    difficulty: 'medium',
    tags: ['WebSockets', 'delivery guarantees', 'presence'],
    prompt:
      'Design a chat application supporting one-to-one and group conversations, message delivery and read receipts, and online presence.',
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    difficulty: 'easy',
    tags: ['Token bucket', 'distributed counters'],
    prompt:
      'Design a rate limiter that restricts how many requests a client can make to an API within a time window, working across multiple servers.',
  },
  {
    id: 'video-streaming',
    title: 'Video Streaming',
    difficulty: 'hard',
    tags: ['CDN', 'transcoding pipeline', 'adaptive bitrate'],
    prompt:
      'Design a video streaming platform where creators upload videos and viewers stream them at adaptive quality across devices worldwide.',
  },
];
