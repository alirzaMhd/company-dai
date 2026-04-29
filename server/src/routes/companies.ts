import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

const companies: Map<string, {
  id: string;
  name: string;
  description: string | null;
  status: string;
  issuePrefix: string;
  issueCounter: number;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  requireBoardApprovalForNewAgents: boolean;
  feedbackDataSharingEnabled: boolean;
  feedbackDataSharingConsentAt: string | null;
  feedbackDataSharingConsentByUserId: string | null;
  feedbackDataSharingTermsVersion: string | null;
  brandColor: string | null;
  logoAssetId: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}> = new Map();

const CreateCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  budgetMonthlyCents: z.number().default(0)
});

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
    res.json({ companies: Array.from(companies.values()) });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateCompanySchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();
    const issuePrefix = (data.name.toUpperCase().slice(0, 3) || 'CMP') + '1';
    const company = {
      id,
      name: data.name,
      description: data.description || null,
      status: 'active',
      issuePrefix,
      issueCounter: 0,
      budgetMonthlyCents: data.budgetMonthlyCents,
      spentMonthlyCents: 0,
      requireBoardApprovalForNewAgents: true,
      feedbackDataSharingEnabled: false,
      feedbackDataSharingConsentAt: null,
      feedbackDataSharingConsentByUserId: null,
      feedbackDataSharingTermsVersion: null,
      brandColor: null,
      logoAssetId: null,
      logoUrl: null,
      createdAt: now,
      updatedAt: now
    };
    companies.set(id, company);
    console.log("[DEBUG] Created company:", JSON.stringify(company));
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ id, name: 'Company', status: 'active', budget: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/org', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ org: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      companyCount: 1,
      agentCount: 0,
      issueCount: 0,
      activeRuns: 0,
      totalCost: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/agents', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ agents: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/issues', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ issues: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ projects: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;
    res.json({ activities: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/user-directory', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ users: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ memberships: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/invites', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ invites: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/join-requests', async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.query.status || 'pending_approval';
    res.json({ joinRequests: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/agent-configurations', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ configurations: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/memberships', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ memberships: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/memberships', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;