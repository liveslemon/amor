import fs from 'node:fs/promises';
import path from 'node:path';

export async function runAdManagementAgent(workspaceRoot) {
  const startTime = Date.now();
  const findings = {
    agent: 'Advertising & Slot Scheduling Agent',
    status: 'COMPLETE',
    specifications: {
      bannerAdsLimit: '3 per day (Media, text, link)',
      ticketBoostAds: 'Event ticket boost integration',
      notificationAdsLimit: '1 per day (Text description, date to be shown >= 24 hours, link to popup)',
      popupAdsLimit: '1 per day (Media, text, link, date to be shown >= 24 hours)',
      clashRule: 'Reason for denial: "Clashing of dates with another advert"',
    },
    backendChecks: {},
    frontendChecks: {},
    gapsIdentified: [],
  };

  // Inspect backend ad routes & services
  const backendFiles = [
    path.join(workspaceRoot, 'backend', 'backend', 'ads', 'adService.js'),
    path.join(workspaceRoot, 'backend', 'backend', 'ads', 'adValidator.js'),
    path.join(workspaceRoot, 'backend', 'backend', 'ads', 'adController.js'),
    path.join(workspaceRoot, 'backend', 'backend', 'schema.sql'),
    path.join(workspaceRoot, 'backend', 'src', 'routes', 'adminRoutes.js'),
  ];

  for (const f of backendFiles) {
    try {
      const content = await fs.readFile(f, 'utf-8');
      const filename = path.basename(f);
      findings.backendChecks[filename] = {
        hasClashDetection: content.includes('Clashing of dates with another advert') || content.includes('Daily limit reached'),
        hasTicketBoost: content.includes('ticket_boost'),
        has24hConstraint: content.includes('24 hours') || content.includes('chk_min_24h_duration'),
        hasBannerLimit3: content.includes('max_allowed := 3') || content.includes('max_allowed = 3') || content.includes('3 per day'),
        hasNotificationLimit1: content.includes('notification') && (content.includes('max_allowed := 1') || content.includes('max_allowed = 1')),
        hasPopupLink: content.includes('popup_id'),
      };
    } catch (err) {
      findings.backendChecks[path.basename(f)] = { error: err.message };
    }
  }

  // Inspect frontend business page and components
  const frontendBusiness = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'business.tsx');
  try {
    const content = await fs.readFile(frontendBusiness, 'utf-8');
    findings.frontendChecks['business.tsx'] = {
      hasBannerForm: content.includes('home-banner') || content.includes('banner'),
      hasNotificationForm: content.includes('notification') || content.includes('Notification'),
      hasPopupForm: content.includes('popup'),
      hasTicketBoostForm: content.includes('ticket_boost') || content.includes('Ticket boost') || content.includes('Boost'),
      showsClashReason: content.includes('Clashing of dates with another advert'),
      requires24hDuration: content.includes('24 hours') || content.includes('24h'),
    };
  } catch (err) {
    findings.frontendChecks['business.tsx'] = { error: err.message };
  }

  // Identify gaps
  if (!findings.backendChecks['adService.js']?.hasTicketBoost) {
    findings.gapsIdentified.push('Backend adService lacks explicit "ticket_boost" ad category and handler.');
  }
  if (!findings.backendChecks['adService.js']?.hasClashDetection) {
    findings.gapsIdentified.push('Backend adService does not return specific denial reason: "Clashing of dates with another advert" upon date collision.');
  }
  if (!findings.frontendChecks['business.tsx']?.hasTicketBoostForm) {
    findings.gapsIdentified.push('Frontend business.tsx is missing dedicated Ticket Boost ad creation.');
  }
  if (!findings.frontendChecks['business.tsx']?.showsClashReason) {
    findings.gapsIdentified.push('Frontend business.tsx does not display the exact rejection reason "Clashing of dates with another advert".');
  }

  findings.durationMs = Date.now() - startTime;
  return findings;
}
