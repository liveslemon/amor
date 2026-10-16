import fs from 'node:fs/promises';
import path from 'node:path';

export async function runAdminPlatformAgent(workspaceRoot) {
  const startTime = Date.now();
  const findings = {
    agent: 'Admin Platform, Telemetry & Moderation Agent',
    status: 'COMPLETE',
    requiredFeatures: {
      approveDenyAds: 'Be able to approve or deny ads with clash checking reason',
      approveDenyTickets: 'Be able to approve or deny tickets/events',
      datesOfTheWeek: 'See dates of the week and total dates',
      activeUsers: 'Live active users metric',
      pushAndPopupsMetrics: 'Push notifications and popups telemetry',
      categoryOfAds: 'Show category of ads used (banner, notification, popup, ticket_boost)',
      flaggedProfilesInspector: 'Show flagged user profiles on the admin panel for admin to check profile',
    },
    backendEndpoints: {},
    frontendAdminPage: {},
    gapsIdentified: [],
  };

  const adminRoutesFile = path.join(workspaceRoot, 'backend', 'src', 'routes', 'adminRoutes.js');
  const adminPageFile = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'admin', 'index.tsx');

  try {
    const adminRoutesContent = await fs.readFile(adminRoutesFile, 'utf-8');
    findings.backendEndpoints = {
      hasStatsEndpoint: adminRoutesContent.includes('/stats') || adminRoutesContent.includes('/dashboard'),
      hasAdReviewEndpoint: adminRoutesContent.includes('/ads') && (adminRoutesContent.includes('review') || adminRoutesContent.includes('approve')),
      hasTicketReviewEndpoint: adminRoutesContent.includes('/tickets') && (adminRoutesContent.includes('review') || adminRoutesContent.includes('approve')),
      hasFlaggedUsersEndpoint: adminRoutesContent.includes('/flagged') || adminRoutesContent.includes('/users'),
    };
  } catch (err) {
    findings.backendEndpoints = { error: err.message };
  }

  try {
    const adminContent = await fs.readFile(adminPageFile, 'utf-8');
    findings.frontendAdminPage = {
      hasDatesOfTheWeek: adminContent.includes('dates of the week') || adminContent.includes('Dates of the Week') || adminContent.includes('Weekly Schedule'),
      hasTotalDates: adminContent.includes('total dates') || adminContent.includes('Total Dates') || adminContent.includes('totalMatches'),
      hasActiveUsers: adminContent.includes('active users') || adminContent.includes('Active Users'),
      hasPushAndPopups: adminContent.includes('popups') || adminContent.includes('Popups'),
      hasAdCategoryBreakdown: adminContent.includes('category') || adminContent.includes('Category of Ads') || adminContent.includes('banner'),
      hasAdApprovalControls: adminContent.includes('Approve') || adminContent.includes('approve') || adminContent.includes('Deny'),
      hasTicketApprovalControls: adminContent.includes('Ticket') && adminContent.includes('Approve'),
      hasFlaggedProfileViewer: adminContent.includes('flagged') || adminContent.includes('Flagged Users') || adminContent.includes('Flagged Profiles'),
      hasAestheticGlows: adminContent.includes('shadow-emerald-500/20') || adminContent.includes('selection:bg-pink-500/30'),
    };
  } catch (err) {
    findings.frontendAdminPage = { error: err.message };
  }

  // Identify gaps
  if (!findings.backendEndpoints.hasStatsEndpoint) {
    findings.gapsIdentified.push('Backend adminRoutes.js is missing comprehensive /admin/stats and /admin/dashboard endpoints.');
  }
  if (!findings.backendEndpoints.hasAdReviewEndpoint) {
    findings.gapsIdentified.push('Backend adminRoutes.js is missing ad approval/rejection endpoints with collision detection.');
  }
  if (!findings.backendEndpoints.hasTicketReviewEndpoint) {
    findings.gapsIdentified.push('Backend adminRoutes.js is missing ticket/event approval/rejection endpoints.');
  }
  if (!findings.backendEndpoints.hasFlaggedUsersEndpoint) {
    findings.gapsIdentified.push('Backend adminRoutes.js is missing /admin/users/flagged endpoint to return flagged profiles.');
  }
  if (!findings.frontendAdminPage.hasFlaggedProfileViewer) {
    findings.gapsIdentified.push('Frontend admin/index.tsx has no section to inspect flagged user profiles.');
  }
  if (!findings.frontendAdminPage.hasDatesOfTheWeek) {
    findings.gapsIdentified.push('Frontend admin/index.tsx lacks dates of the week and total dates telemetry.');
  }
  if (!findings.frontendAdminPage.hasAdCategoryBreakdown) {
    findings.gapsIdentified.push('Frontend admin/index.tsx lacks visual breakdown of ad categories (banner, notification, popup, ticket boost).');
  }

  findings.durationMs = Date.now() - startTime;
  return findings;
}
