import {
  Globe,
  Users,
  Fingerprint,
  Building2,
  Bitcoin,
  Image,
  Mail,
  Network,
  type LucideIcon,
} from 'lucide-react';

export type SearchType = 'email' | 'username' | 'domain' | 'phone' | 'wallet';

export interface SourceRow {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  hits: number;
  confidence: number;
  lastSeen: string;
  status: 'fresh' | 'cached' | 'error';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'subject' | 'email' | 'phone' | 'domain' | 'wallet' | 'social' | 'person';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  type: 'registration' | 'post' | 'transaction' | 'sighting' | 'breach';
}

export interface CopilotMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  kind?: 'summary' | 'pivot' | 'risk' | 'confidence' | 'text';
}

export const SEARCH_TYPES: { id: SearchType; label: string; placeholder: string }[] = [
  { id: 'email', label: 'Email', placeholder: 'target@protonmail.com' },
  { id: 'username', label: 'Username', placeholder: 'ghost_op_47' },
  { id: 'domain', label: 'Domain', placeholder: 'shadowcraft.io' },
  { id: 'phone', label: 'Phone', placeholder: '+1 415 555 0142' },
  { id: 'wallet', label: 'Wallet', placeholder: 'bc1q...4f9a' },
];

export const SUMMARY_CARDS = [
  { id: 'risk', label: 'Risk Score', value: 78, suffix: '/100', tone: 'warning', hint: 'Elevated' },
  { id: 'confidence', label: 'Confidence Score', value: 92, suffix: '%', tone: 'success', hint: 'High' },
  { id: 'sources', label: 'Sources Queried', value: 412, suffix: '', tone: 'cyan', hint: '412 of 412' },
  { id: 'relationships', label: 'Relationships Found', value: 27, suffix: '', tone: 'cyan', hint: '14 entities' },
] as const;

export const SOURCES: SourceRow[] = [
  { id: 's1', name: 'Have I Been Pwned', category: 'Breach Data', icon: Fingerprint, hits: 6, confidence: 98, lastSeen: '2m ago', status: 'fresh' },
  { id: 's2', name: 'WHOIS / RDAP', category: 'Infrastructure', icon: Network, hits: 3, confidence: 95, lastSeen: '1m ago', status: 'fresh' },
  { id: 's3', name: 'X / Twitter', category: 'Social Media', icon: Users, hits: 142, confidence: 88, lastSeen: '4m ago', status: 'fresh' },
  { id: 's4', name: 'LinkedIn', category: 'Corporate', icon: Building2, hits: 1, confidence: 91, lastSeen: '5m ago', status: 'fresh' },
  { id: 's5', name: 'GitHub', category: 'Developer', icon: Globe, hits: 18, confidence: 96, lastSeen: '3m ago', status: 'fresh' },
  { id: 's6', name: 'Hunter.io', category: 'Email', icon: Mail, hits: 4, confidence: 84, lastSeen: '6m ago', status: 'cached' },
  { id: 's7', name: 'Etherscan', category: 'Crypto', icon: Bitcoin, hits: 9, confidence: 99, lastSeen: '7m ago', status: 'fresh' },
  { id: 's8', name: 'PimEyes', category: 'Facial', icon: Image, hits: 2, confidence: 72, lastSeen: '8m ago', status: 'cached' },
];

export const GRAPH_NODES: GraphNode[] = [
  { id: 'subject', label: 'ghost_op_47', type: 'subject', x: 50, y: 50 },
  { id: 'email1', label: 'g47@protonmail.com', type: 'email', x: 22, y: 28 },
  { id: 'email2', label: 'ghost@shadowcraft.io', type: 'email', x: 78, y: 30 },
  { id: 'phone1', label: '+1 415 555 0142', type: 'phone', x: 18, y: 68 },
  { id: 'domain1', label: 'shadowcraft.io', type: 'domain', x: 82, y: 66 },
  { id: 'wallet1', label: 'bc1q...4f9a', type: 'wallet', x: 60, y: 18 },
  { id: 'social1', label: '@ghost_op_47', type: 'social', x: 38, y: 84 },
  { id: 'person1', label: 'Alias: "Vex"', type: 'person', x: 72, y: 84 },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'subject', to: 'email1', label: 'registered' },
  { from: 'subject', to: 'email2', label: 'linked' },
  { from: 'subject', to: 'phone1', label: 'verified' },
  { from: 'subject', to: 'domain1', label: 'admin' },
  { from: 'subject', to: 'wallet1', label: 'owns' },
  { from: 'subject', to: 'social1', label: 'handle' },
  { from: 'subject', to: 'person1', label: 'alias' },
  { from: 'domain1', to: 'email2', label: 'MX' },
  { from: 'email2', to: 'person1', label: 'sig' },
];

export const TIMELINE: TimelineEvent[] = [
  { id: 't1', date: '2026-07-14', title: 'Wallet cluster funded', detail: 'bc1q...4f9a received 0.84 BTC from exchange hot wallet.', type: 'transaction' },
  { id: 't2', date: '2026-06-22', title: 'Domain registered', detail: 'shadowcraft.io registered via Njalla — privacy registrar.', type: 'registration' },
  { id: 't3', date: '2026-05-09', title: 'GitHub activity', detail: 'Pushed 4 commits to private repo "exfil-tools".', type: 'post' },
  { id: 't4', date: '2026-03-01', title: 'Sighting on forum', detail: 'Posted in breach-forum thread under alias "Vex".', type: 'sighting' },
  { id: 't5', date: '2024-11-18', title: 'Credential exposure', detail: 'Email appeared in 3 separate breach corpora.', type: 'breach' },
];

export const COPILOT_INITIAL: CopilotMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    kind: 'summary',
    content:
      'Subject "ghost_op_47" resolves to a high-confidence identity cluster spanning 7 entities across 412 sources. Primary anchor is the ProtonMail address, reinforced by a privacy-registered domain and a BTC wallet with on-chain exchange exposure.',
  },
  {
    id: 'm2',
    role: 'assistant',
    kind: 'pivot',
    content:
      'Suggested next pivot: trace the 0.84 BTC inbound transaction to its originating exchange. KYC records on the deposit side could collapse the alias "Vex" to a real-world identity.',
  },
  {
    id: 'm3',
    role: 'assistant',
    kind: 'risk',
    content:
      'Risk Analysis: Elevated (78/100). Subject operates operational-security hygiene (privacy registrar, ProtonMail, no PII on social) but exhibits breach-forum participation and tooling consistent with initial-access tradecraft.',
  },
  {
    id: 'm4',
    role: 'assistant',
    kind: 'confidence',
    content:
      'Confidence Score: 92%. Entity resolution is corroborated by 3+ independent source classes (infrastructure, crypto, social). Remaining uncertainty centers on the "Vex" alias attribution.',
  },
];

export const COPILOT_PROMPTS = [
  'Summarize this investigation',
  'Suggest next pivot',
  'Explain the risk score',
  'What lowers confidence?',
];
