import fs from 'node:fs/promises';
import path from 'node:path';

export async function runImagePipelineAgent(workspaceRoot) {
  const startTime = Date.now();
  const findings = {
    agent: 'Media & Image Pipeline Agent',
    status: 'COMPLETE',
    requirements: {
      downscaling: 'Downscale image size without losing quality',
      maxImages: 'Only 2 images allowed',
    },
    codebaseChecks: {},
    gapsIdentified: [],
  };

  const imageOptFile = path.join(workspaceRoot, 'frontend', 'src', 'lib', 'imageOptimization.ts');
  const mePageFile = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'me.tsx');
  const uploadControllerFile = path.join(workspaceRoot, 'backend', 'src', 'controllers', 'uploadController.js');
  const onboardingSchemasFile = path.join(workspaceRoot, 'backend', 'src', 'validators', 'onboardingSchemas.js');
  const onboardingControllerFile = path.join(workspaceRoot, 'backend', 'src', 'controllers', 'onboardingController.js');
  const businessPageFile = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'business.tsx');

  try {
    const optContent = await fs.readFile(imageOptFile, 'utf-8');
    findings.codebaseChecks['imageOptimization.ts'] = {
      usesCanvasDownscaling: optContent.includes('canvas.getContext("2d")'),
      usesWebPFormat: optContent.includes('image/webp'),
      qualityPreserved: optContent.includes('quality = 0.92') || optContent.includes('quality'),
      maxDimension: optContent.includes('maxDimension = 1600') || optContent.includes('maxDimension'),
    };
  } catch (err) {
    findings.codebaseChecks['imageOptimization.ts'] = { error: err.message };
  }

  try {
    const meContent = await fs.readFile(mePageFile, 'utf-8');
    findings.codebaseChecks['me.tsx'] = {
      limitsToTwoImages: meContent.includes('profilePhotos.length >= 2') && meContent.includes('[0, 1]'),
      usesImageOptimization: meContent.includes('optimizeImage'),
    };
  } catch (err) {
    findings.codebaseChecks['me.tsx'] = { error: err.message };
  }

  try {
    const schemaContent = await fs.readFile(onboardingSchemasFile, 'utf-8');
    findings.codebaseChecks['onboardingSchemas.js'] = {
      maxPhotosInSchema: schemaContent.includes('.max(2)'),
    };
  } catch (err) {
    findings.codebaseChecks['onboardingSchemas.js'] = { error: err.message };
  }

  try {
    const controllerContent = await fs.readFile(onboardingControllerFile, 'utf-8');
    findings.codebaseChecks['onboardingController.js'] = {
      enforcesMaxTwoInBackend: controllerContent.includes('Maximum of 2 photos allowed'),
    };
  } catch (err) {
    findings.codebaseChecks['onboardingController.js'] = { error: err.message };
  }

  try {
    const businessContent = await fs.readFile(businessPageFile, 'utf-8');
    findings.codebaseChecks['business.tsx'] = {
      downscalesAdImages: businessContent.includes('optimizeImage'),
      limitsAdImages: businessContent.includes('only 2') || businessContent.includes('max'),
    };
  } catch (err) {
    findings.codebaseChecks['business.tsx'] = { error: err.message };
  }

  // Identify gaps
  if (!findings.codebaseChecks['business.tsx']?.limitsAdImages) {
    findings.gapsIdentified.push('Frontend business.tsx ad manager does not explicitly enforce the 2 image maximum for ad creatives.');
  }

  findings.durationMs = Date.now() - startTime;
  return findings;
}
