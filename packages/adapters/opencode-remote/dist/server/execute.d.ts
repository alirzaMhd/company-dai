import type { AdapterExecutionContext, AdapterExecutionResult, AdapterEnvironmentTestContext, AdapterEnvironmentTestResult, AdapterSessionCodec } from "../../adapter-utils/dist/index.js";
declare const MODELS_CACHE: Map<string, {
    id: string;
    label: string;
}[]>;
export { MODELS_CACHE };
export declare const sessionCodec: AdapterSessionCodec;
export declare function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult>;
export declare function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
//# sourceMappingURL=execute.d.ts.map