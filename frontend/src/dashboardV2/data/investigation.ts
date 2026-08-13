export type EntityType = 'email' | 'username' | 'domain' | 'phone' | 'wallet';

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  x: number;
  y: number;
  risk: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface SourceRow {
  id: string;
  source: string;
  category: string;
  matches: number;
  lastSeen: string;
  reliability: number;
}

export interface CopilotInsight {
  id: string;
  type: 'summary' | 'pivot' | 'confidence' | 'risk';
  label: string;
  value: string;
  detail: string;
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 'n1', label: 'shadowbroker@proton.me', type: 'email', x: 50, y: 50, risk: 82 },
  { id: 'n2', label: '@ghost_w1re', type: 'username', x: 22, y: 28, risk: 67 },
  { id: 'n3', label: 'darknet-market.onion', type: 'domain', x: 78, y: 30, risk: 91 },
  { id: 'n4', label: '+1 (415) 555-0192', type: 'phone', x: 20, y: 72, risk: 44 },
  { id: 'n5', label: '0x7A3b...9F2c', type: 'wallet', x: 80, y: 73, risk: 76 },
  { id: 'n6', label: 'leaksforum.io', type: 'domain', x: 50, y: 14, risk: 58 },
  { id: 'n7', label: '@phantom_trader', type: 'username', x: 50, y: 88, risk: 63 },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'n1', to: 'n2', kind: 'alias' },
  { from: 'n1', to: 'n3', kind: 'registered' },
  { from: 'n1', to: 'n4', kind: 'contact' },
  { from: 'n1', to: 'n5', kind: 'wallet' },
  { from: 'n2', to: 'n6', kind: 'posted' },
  { from: 'n3', to: 'n5', kind: 'transaction' },
  { from: 'n1', to: 'n7', kind: 'alias' },
  { from: 'n7', to: 'n5', kind: 'transaction' },
];

export const TIMELINE: TimelineEvent[] = [
  {
    id: 't1',
    time: '2026-07-17 14:32 UTC',
    title: 'Wallet 0x7A3b linked to darknet market',
    detail: 'On-chain analysis ties wallet to known illicit marketplace escrow contract.',
    severity: 'critical',
  },
  {
    id: 't2',
    time: '2026-07-15 09:11 UTC',
    title: 'Email registered on leaksforum.io',
    detail: 'Account created using shadowbroker@proton.me, verified via PGP.',
    severity: 'warn',
  },
  {
    id: 't3',
    time: '2026-07-12 22:04 UTC',
    title: 'Username @ghost_w1re mentioned in breach dump',
    detail: 'Credential set appeared in a 2024 combolist circulating on Telegram.',
    severity: 'warn',
  },
  {
    id: 't4',
    time: '2026-07-09 17:48 UTC',
    title: 'Phone number tied to VoIP provider',
    detail: '+1 (415) 555-0192 provisioned by a privacy-focused VoIP carrier.',
    severity: 'info',
  },
  {
    id: 't5',
    time: '2026-07-02 06:20 UTC',
    title: 'Domain darknet-market.onion resolved via guard nodes',
    detail: 'Tor exit relay fingerprint matched a previously flagged node set.',
    severity: 'critical',
  },
];

export const SOURCES: SourceRow[] = [
  { id: 's1', source: 'HaveIBeenPwned', category: 'Breach Intelligence', matches: 3, lastSeen: '2h ago', reliability: 94 },
  { id: 's2', source: 'Chainalysis KYT', category: 'On-Chain Analytics', matches: 12, lastSeen: '14m ago', reliability: 97 },
  { id: 's3', source: 'Shodan', category: 'Infrastructure Recon', matches: 5, lastSeen: '1h ago', reliability: 88 },
  { id: 's4', source: 'OSINT Telegram Crawler', category: 'Social Signals', matches: 8, lastSeen: '33m ago', reliability: 71 },
  { id: 's5', source: 'DomainTools Iris', category: 'WHOIS / DNS', matches: 2, lastSeen: '4h ago', reliability: 90 },
  { id: 's6', source: 'Pipl Identity Graph', category: 'Identity Resolution', matches: 6, lastSeen: '52m ago', reliability: 82 },
];

export const COPILOT_INSIGHTS: CopilotInsight[] = [
  {
    id: 'c1',
    type: 'summary',
    label: 'Summary',
    value: 'Subject operates across at least 3 personas bridging email, social, and on-chain activity. Wallet 0x7A3b shows repeated transfers to a flagged marketplace escrow.',
    detail: 'Corroborated by 6 sources with high reliability.',
  },
  {
    id: 'c2',
    type: 'pivot',
    label: 'Suggested Next Pivot',
    value: 'Expand on 0x7A3b...9F2c — trace inbound transactions 2 hops back to identify funding source.',
    detail: 'Highest leverage pivot given current evidence.',
  },
  {
    id: 'c3',
    type: 'confidence',
    label: 'Confidence',
    value: '87%',
    detail: 'Driven by cross-source corroboration and on-chain finality.',
  },
  {
    id: 'c4',
    type: 'risk',
    label: 'Risk',
    value: 'High',
    detail: 'Pattern consistent with financially-motivated illicit actor.',
  },
];

export const ENTITY_ICONS: Record<EntityType, string> = {
  email: 'Mail',
  username: 'AtSign',
  domain: 'Globe',
  phone: 'Phone',
  wallet: 'Wallet',
};
