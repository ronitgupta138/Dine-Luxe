/**
 * Generates a unique employee ID in format: EMP-{BRANCHCODE}-{SEQUENCE}
 * e.g. EMP-CP-001, EMP-MG-042
 *
 * @param branchName  - Human-readable branch name e.g. "Connaught Place"
 * @param branchId    - UUID of the branch (for sequence scoping)
 */
export declare function generateEmployeeId(branchName: string, branchId: string): Promise<string>;
//# sourceMappingURL=employee-id.d.ts.map