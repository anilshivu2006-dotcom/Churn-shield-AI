export enum PlanType {
  MOBILE = 'Mobile',
  BASIC = 'Basic',
  STANDARD = 'Standard',
  PREMIUM = 'Premium'
}

export interface Customer {
  id: string; // From CSV: customerID
  name: string; // Generated
  email: string; // Generated
  plan: string; // Derived from 'monthlyCharges' roughly
  monthlyBill: number; // From CSV: monthlyCharges
  tenureMonths: number; // From CSV: tenure
  contract: string; // From CSV: contract
  paymentIssue: boolean; // From CSV: paymentIssue
  totalSpend: number; // Calculated
  avatarUrl: string; // Generated
}

export interface ChurnPrediction {
  churnProbability: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  topRiskFactors: {
    factor: string;
    impactScore: number; // 1 to 10
  }[];
  recommendedActions: {
    id: string;
    title: string;
    type: 'email' | 'discount' | 'content';
    description: string;
  }[];
  contentRecommendations: string[];
}

export interface DashboardMetrics {
  currentChurnRate: number;
  revenueAtRisk: number;
  activeSubscribers: number;
  churnTrend: { month: string; rate: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
}