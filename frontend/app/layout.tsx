import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FairnessAudit | AI Bias Detection & Fairness Analysis Platform',
  description:
    'Enterprise-grade fairness auditing platform. Detect bias, explain model decisions, and mitigate algorithmic discrimination, apply mitigation techniques, and generate compliance reports. Built for Google Solution Challenge 2026.',
  keywords: ['AI fairness', 'bias detection', 'SHAP explainability', 'Fairlearn', 'fairness audit'],
  openGraph: {
    title: 'FairnessAudit Platform',
    description: 'Detect and mitigate AI bias with enterprise-grade tools.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="animated-bg min-h-screen">{children}</body>
    </html>
  );
}
