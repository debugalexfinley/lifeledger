/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as businessDecisions from "../businessDecisions.js";
import type * as businessSimulator from "../businessSimulator.js";
import type * as businessTypeProfiles from "../businessTypeProfiles.js";
import type * as claude from "../claude.js";
import type * as dating from "../dating.js";
import type * as gameHelpers from "../gameHelpers.js";
import type * as games from "../games.js";
import type * as health from "../health.js";
import type * as leaderboard from "../leaderboard.js";
import type * as marketRates from "../marketRates.js";
import type * as seedData from "../seedData.js";
import type * as seedEvents from "../seedEvents.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  businessDecisions: typeof businessDecisions;
  businessSimulator: typeof businessSimulator;
  businessTypeProfiles: typeof businessTypeProfiles;
  claude: typeof claude;
  dating: typeof dating;
  gameHelpers: typeof gameHelpers;
  games: typeof games;
  health: typeof health;
  leaderboard: typeof leaderboard;
  marketRates: typeof marketRates;
  seedData: typeof seedData;
  seedEvents: typeof seedEvents;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
