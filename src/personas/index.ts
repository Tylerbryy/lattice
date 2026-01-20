import type { PersonaConfig, PersonaId } from "./types.js";
import { mungerPersona } from "./munger/index.js";
import { cathiePersona } from "./cathie/index.js";

// Re-export types
export * from "./types.js";

// Re-export personas
export { mungerPersona } from "./munger/index.js";
export { cathiePersona } from "./cathie/index.js";

// Persona registry
const personas: Record<PersonaId, PersonaConfig> = {
  munger: mungerPersona,
  cathie: cathiePersona,
};

// Default persona
export const DEFAULT_PERSONA_ID: PersonaId = "munger";

/**
 * Get a persona configuration by ID
 * @param id - The persona ID ("munger" | "cathie")
 * @returns The persona configuration
 * @throws Error if persona ID is invalid
 */
export function getPersona(id: PersonaId): PersonaConfig {
  const persona = personas[id];
  if (!persona) {
    throw new Error(`Unknown persona: ${id}. Valid options: ${Object.keys(personas).join(", ")}`);
  }
  return persona;
}

/**
 * Get persona by ID, defaulting to Munger if not found
 * @param id - The persona ID (case-insensitive)
 * @returns The persona configuration
 */
export function getPersonaSafe(id: string | undefined): PersonaConfig {
  if (!id) {
    return personas[DEFAULT_PERSONA_ID];
  }
  const normalizedId = id.toLowerCase() as PersonaId;
  return personas[normalizedId] || personas[DEFAULT_PERSONA_ID];
}

/**
 * Check if a persona ID is valid
 * @param id - The persona ID to check
 * @returns True if the ID is valid
 */
export function isValidPersonaId(id: string): id is PersonaId {
  return id in personas;
}

/**
 * Get all available persona IDs
 * @returns Array of valid persona IDs
 */
export function getPersonaIds(): PersonaId[] {
  return Object.keys(personas) as PersonaId[];
}

/**
 * Get all available personas
 * @returns Array of all persona configurations
 */
export function getAllPersonas(): PersonaConfig[] {
  return Object.values(personas);
}
