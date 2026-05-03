import type { AdapterSkillContext, AdapterSkillSnapshot } from "../../adapter-utils/dist/index.js";
export declare function listOpenCodeRemoteSkills(ctx: AdapterSkillContext): Promise<AdapterSkillSnapshot>;
export declare function syncOpenCodeRemoteSkills(ctx: AdapterSkillContext, desiredSkills: string[]): Promise<AdapterSkillSnapshot>;
export declare function resolveOpenCodeRemoteDesiredSkillNames(config: Record<string, unknown>, availableEntries: Array<{
    key: string;
    required?: boolean;
}>): any;
//# sourceMappingURL=skills.d.ts.map