import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { runDesignLanguageAgent } from './designLanguageAgent.mjs';
import { runAdManagementAgent } from './adManagementAgent.mjs';
import { runTicketManagerAgent } from './ticketManagerAgent.mjs';
import { runAdminPlatformAgent } from './adminPlatformAgent.mjs';
import { runImagePipelineAgent } from './imagePipelineAgent.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

async function main() {
  console.log('🚀 Spawning 5 Autonomous Agents Simultaneously...');
  const overallStart = Date.now();

  const [
    designResults,
    adResults,
    ticketResults,
    adminResults,
    imageResults,
  ] = await Promise.all([
    runDesignLanguageAgent(workspaceRoot),
    runAdManagementAgent(workspaceRoot),
    runTicketManagerAgent(workspaceRoot),
    runAdminPlatformAgent(workspaceRoot),
    runImagePipelineAgent(workspaceRoot),
  ]);

  const totalDuration = Date.now() - overallStart;

  const comprehensiveReport = {
    timestamp: new Date().toISOString(),
    totalExecutionDurationMs: totalDuration,
    agentsCount: 5,
    agentResults: {
      designLanguageAgent: designResults,
      adManagementAgent: adResults,
      ticketManagerAgent: ticketResults,
      adminPlatformAgent: adminResults,
      imagePipelineAgent: imageResults,
    },
  };

  const outputPath = path.join(__dirname, 'analysisReport.json');
  await fs.writeFile(outputPath, JSON.stringify(comprehensiveReport, null, 2));

  console.log(`✅ Autonomous Analysis Completed in ${totalDuration}ms!`);
  console.log(`📄 Comprehensive report saved to: ${outputPath}`);
  console.log('\n--- EXECUTIVE GAP SUMMARY ---');
  console.log('1. Design Language:', designResults.summary);
  console.log('2. Ads & Clash Detection Gaps:', adResults.gapsIdentified);
  console.log('3. Ticket Manager Gaps:', ticketResults.gapsIdentified);
  console.log('4. Admin Platform & Moderation Gaps:', adminResults.gapsIdentified);
  console.log('5. Media & Image Pipeline Gaps:', imageResults.gapsIdentified);
}

main().catch((err) => {
  console.error('Fatal error during autonomous multi-agent run:', err);
  process.exit(1);
});
