import type { AdapterModel, AdapterSessionCodec } from "../../adapter-utils/dist/index.js";
export declare const sessionCodec: AdapterSessionCodec;
export declare const models: AdapterModel[];
export declare const agentConfigurationDoc: any;
export { execute, testEnvironment, MODELS_CACHE } from "./execute.js";
export { listOpenCodeRemoteModels, ensureOpenCodeRemoteModelConfigured, resetOpenCodeRemoteModelsCacheForTests } from "./models.js";
export { parseOpenCodeRemoteJsonl, isOpenCodeRemoteUnknownSessionError } from "./parse.js";
export { listOpenCodeRemoteSkills, syncOpenCodeRemoteSkills } from "./skills.js";
//# sourceMappingURL=index.d.ts.map