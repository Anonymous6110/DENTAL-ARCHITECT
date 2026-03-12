import { DataModelFromSchema } from "convex/server";
import schema from "../schema";

export type DataModel = DataModelFromSchema<typeof schema>;
