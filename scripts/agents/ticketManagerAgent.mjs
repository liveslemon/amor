import fs from 'node:fs/promises';
import path from 'node:path';

export async function runTicketManagerAgent(workspaceRoot) {
  const startTime = Date.now();
  const findings = {
    agent: 'Ticket Manager & Events Agent',
    status: 'COMPLETE',
    requiredFields: ['event_name', 'event_description', 'ticket_type', 'ticket_price', 'location'],
    databaseModelChecks: {},
    backendChecks: {},
    frontendChecks: {},
    gapsIdentified: [],
  };

  const schemaFile = path.join(workspaceRoot, 'backend', 'backend', 'schema.sql');
  const eventSchemasFile = path.join(workspaceRoot, 'backend', 'src', 'validators', 'eventSchemas.js');
  const eventServiceFile = path.join(workspaceRoot, 'backend', 'src', 'services', 'eventService.js');
  const eventControllerFile = path.join(workspaceRoot, 'backend', 'src', 'controllers', 'eventController.js');
  const businessPageFile = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'business.tsx');
  const eventDetailPageFile = path.join(workspaceRoot, 'frontend', 'src', 'pages', 'events', '[slug].tsx');

  try {
    const schemaContent = await fs.readFile(schemaFile, 'utf-8');
    findings.databaseModelChecks = {
      hasEventName: schemaContent.includes('event_name'),
      hasEventDescription: schemaContent.includes('event_description') || schemaContent.includes('description'),
      hasTicketType: schemaContent.includes('ticket_type'),
      hasTicketPrice: schemaContent.includes('ticket_price'),
      hasLocation: schemaContent.includes('location'),
      hasTicketStatus: schemaContent.includes('status TEXT NOT NULL DEFAULT \'valid\''),
      hasAdminApproval: schemaContent.includes('admin_status') || schemaContent.includes('approved'),
    };
  } catch (err) {
    findings.databaseModelChecks = { error: err.message };
  }

  try {
    const validatorContent = await fs.readFile(eventSchemasFile, 'utf-8');
    findings.backendChecks['eventSchemas.js'] = {
      validatesEventName: validatorContent.includes('event_name'),
      validatesEventDescription: validatorContent.includes('event_description') || validatorContent.includes('description'),
      validatesTicketType: validatorContent.includes('ticket_type'),
      validatesTicketPrice: validatorContent.includes('ticket_price'),
      validatesLocation: validatorContent.includes('location'),
    };
  } catch (err) {
    findings.backendChecks['eventSchemas.js'] = { error: err.message };
  }

  try {
    const businessContent = await fs.readFile(businessPageFile, 'utf-8');
    findings.frontendChecks['business.tsx'] = {
      hasTicketManagerSection: businessContent.includes('Ticket manager'),
      hasTicketCreationForm: businessContent.includes('Create ticket') || businessContent.includes('event_description'),
      hasLocationInput: businessContent.includes('location') || businessContent.includes('Location'),
      hasTicketTypeInput: businessContent.includes('ticket_type') || businessContent.includes('Ticket Type'),
    };
  } catch (err) {
    findings.frontendChecks['business.tsx'] = { error: err.message };
  }

  // Identify gaps
  if (!findings.backendChecks['eventSchemas.js']?.validatesEventDescription) {
    findings.gapsIdentified.push('Backend event validator is missing "event_description" (or description).');
  }
  if (!findings.backendChecks['eventSchemas.js']?.validatesTicketType) {
    findings.gapsIdentified.push('Backend event validator is missing "ticket_type" (e.g. Regular, VIP, Early Bird).');
  }
  if (!findings.backendChecks['eventSchemas.js']?.validatesLocation) {
    findings.gapsIdentified.push('Backend event validator is missing "location".');
  }
  if (!findings.frontendChecks['business.tsx']?.hasTicketCreationForm) {
    findings.gapsIdentified.push('Frontend business.tsx Ticket Manager only lists user tickets; lacks event/ticket creation form with Event name, description, ticket type, price, and location.');
  }

  findings.durationMs = Date.now() - startTime;
  return findings;
}
