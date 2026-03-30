import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Material {
    weight: number;
    minWeight: number;
    maxWeight: number;
    code: string;
    description: string;
    quantity: bigint;
}
export interface LabelLog {
    user: Principal;
    timestamp: Time;
    actualWeight: number;
    materialCode: string;
}
export type Time = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateMaterial(code: string, description: string, weight: number, minWeight: number, maxWeight: number, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportMaterials(materialsArray: Array<Material>): Promise<void>;
    clearAllLabelLogs(): Promise<void>;
    clearAllMaterials(): Promise<void>;
    deleteMaterial(code: string): Promise<void>;
    generateLabel(materialCode: string, actualWeight: number): Promise<void>;
    getAllLabelLogs(): Promise<Array<LabelLog>>;
    getAllMaterials(): Promise<Array<Material>>;
    getCallerUserRole(): Promise<UserRole>;
    getMaterial(code: string): Promise<Material | null>;
    getMaterialLabelLogs(materialCode: string): Promise<Array<LabelLog>>;
    isCallerAdmin(): Promise<boolean>;
}
