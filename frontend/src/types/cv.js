/**
 * @typedef {Object} CVComponent
 * @property {string} id - Unique identifier for the component
 * @property {'personal' | 'experience' | 'education' | 'skills' | 'projects'} type - Component type
 * @property {Object} data - Component specific data
 * @property {boolean} isVisible - Whether the component is visible on the CV
 */

/**
 * @typedef {Object} CVProject
 * @property {string} id - Unique identifier for the CV project
 * @property {string} name - Name of the CV project
 * @property {string} templateId - ID of the selected template
 * @property {CVComponent[]} components - List of components in this CV
 * @property {Object} layout - Layout configuration
 * @property {string} createdAt - ISO string
 * @property {string} updatedAt - ISO string
 */

/**
 * @typedef {Object} ATSScore
 * @property {number} overall - Score out of 100
 * @property {string[]} suggestions - List of improvement suggestions
 * @property {string} analyzedAt - ISO string
 */

export {};
