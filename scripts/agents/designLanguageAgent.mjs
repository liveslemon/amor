import fs from 'node:fs/promises';
import path from 'node:path';

export async function runDesignLanguageAgent(workspaceRoot) {
  const startTime = Date.now();
  const findings = {
    agent: 'DesignLanguage & Aesthetic Auditor Agent',
    status: 'COMPLETE',
    glowViolations: [],
    unnecessaryBorders: [],
    aiAestheticTokens: [],
    colorRestraintIssues: [],
    recommendations: [],
  };

  const frontendSrc = path.join(workspaceRoot, 'frontend', 'src');

  async function walk(dir) {
    let files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', '.next', '.git'].includes(entry.name)) {
            files = files.concat(await walk(fullPath));
          }
        } else if (/\.(tsx|jsx|css|ts)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // directory might not exist
    }
    return files;
  }

  const allFiles = await walk(frontendSrc);

  const glowRegex = /(shadow-\[0_0_|drop-shadow-\[0_0_|neon|blur-\[|glow)/i;
  const heavyBorderRegex = /(border-(2|4|8)|border-pink-500\/[5-9]\d|border-rose-500\/[5-9]\d)/i;
  const aiGradientsRegex = /(bg-gradient-to-(r|br|tr|l|b)\s+from-(cyan|purple|indigo|violet|emerald|amber|fuchsia)-[4-6]00)/i;

  for (const filePath of allFiles) {
    const relPath = path.relative(workspaceRoot, filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (glowRegex.test(line) && !line.includes('STYLING_GUIDE')) {
        findings.glowViolations.push({
          file: relPath,
          line: lineNum,
          content: line.trim(),
        });
      }
      if (heavyBorderRegex.test(line)) {
        findings.unnecessaryBorders.push({
          file: relPath,
          line: lineNum,
          content: line.trim(),
        });
      }
      if (aiGradientsRegex.test(line)) {
        findings.aiAestheticTokens.push({
          file: relPath,
          line: lineNum,
          content: line.trim(),
        });
      }
    });
  }

  findings.durationMs = Date.now() - startTime;
  findings.totalFilesScanned = allFiles.length;
  findings.summary = `Scanned ${allFiles.length} files. Found ${findings.glowViolations.length} glow patterns, ${findings.unnecessaryBorders.length} heavy border styles, and ${findings.aiAestheticTokens.length} synthetic gradient tokens.`;

  return findings;
}
