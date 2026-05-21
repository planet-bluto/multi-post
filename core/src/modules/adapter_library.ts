import EventEmitter from "node:events";
import { MultiPostAdapter } from "./adapter";

/** Static class for managing and querying all MultiPost adapters */
export class AdapterLibrary {
  static _adapters: Map<string, MultiPostAdapter> = new Map<string, MultiPostAdapter>()
  static _events: EventEmitter

	/**
	 * Adds an adapter. Automatically called by the {@link MultiPostAdapter} during construction
	 * @param {MultiPostAdapter} adapter - The adapter to add
	 */
  static add(adapter: MultiPostAdapter): void {
    AdapterLibrary._adapters.set(adapter.id, adapter)
  }

	/**
	 * Gets an adapter by ID
	 * @param {string} id - ID of the adapter to look
   * @returns {MultiPostAdapter | undefined} Either the found adapter or undefined if nothing found
	 */
  static get(id: string): MultiPostAdapter | undefined {
    return AdapterLibrary._adapters.get(id)
  }

	/**
	 * Wait for all added adapter to be ready
   * @returns {Promise<void>} Promise that resolves once ALL adapter are ready
	 */
  static async awaitReady() {
    for (const adapter of AdapterLibrary._adapters.values()) {
      await adapter.awaitReady()
    }
  }
}