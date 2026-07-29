/**
 * In-memory project store
 * In production, replace with database (MongoDB, PostgreSQL, etc.)
 */
export class ProjectStore {
  constructor() {
    this.projects = new Map();
  }

  set(id, project) {
    this.projects.set(id, project);
  }

  get(id) {
    return this.projects.get(id);
  }

  getAll() {
    return Array.from(this.projects.values());
  }

  delete(id) {
    return this.projects.delete(id);
  }
}

// Singleton instance
export const PROJECT_STORE = new ProjectStore();
