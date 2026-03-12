import { GenericMutationBuilder, GenericQueryBuilder } from "convex/server";
import { DataModel } from "./dataModel";

export declare const query: GenericQueryBuilder<DataModel>;
export declare const mutation: GenericMutationBuilder<DataModel>;
export declare const internalQuery: GenericQueryBuilder<DataModel>;
export declare const internalMutation: GenericMutationBuilder<DataModel>;
