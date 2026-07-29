import JSZip from 'jszip';
import fs from 'fs-extra';
import path from 'path';

/**
 * RP File Parser
 * Axure RP 9/10 .rp files are ZIP archives containing:
 * - document.json: Main structure with pages, masters, widgets
 * - files/: Resources (images, etc.)
 * - meta.json: Project metadata
 */

export class RPParser {
  constructor() {
    this.document = null;
    this.resources = new Map();
    this.pages = [];
    this.masters = [];
    this.globalVariables = {};
  }

  /**
   * Parse a .rp file from buffer
   */
  async parse(buffer) {
    const zip = await JSZip.loadAsync(buffer);
    
    // Load document.json
    const docFile = zip.file('document.json');
    if (!docFile) {
      throw new Error('Invalid .rp file: missing document.json');
    }
    
    const docContent = await docFile.async('string');
    this.document = JSON.parse(docContent);
    
    // Extract metadata
    this._extractMeta(zip);
    
    // Extract pages
    this._extractPages();
    
    // Extract masters
    this._extractMasters();
    
    // Extract global variables
    this._extractVariables();
    
    // Extract resources
    await this._extractResources(zip);
    
    return {
      pages: this.pages,
      masters: this.masters,
      variables: this.globalVariables,
      resources: this.resources,
      document: this.document
    };
  }

  _extractMeta(zip) {
    const metaFile = zip.file('meta.json');
    if (metaFile) {
      metaFile.async('string').then(content => {
        this.meta = JSON.parse(content);
      }).catch(() => {
        this.meta = {};
      });
    } else {
      this.meta = {};
    }
  }

  _extractPages() {
    if (!this.document || !this.document.pages) return;
    
    this.pages = Object.entries(this.document.pages).map(([id, page]) => ({
      id,
      name: page.name || page.pageName || `Page ${this.pages.length + 1}`,
      notes: page.notes || '',
      // Store raw page data for conversion
      raw: page
    }));
  }

  _extractMasters() {
    if (!this.document || !this.document.masters) return;
    
    this.masters = Object.entries(this.document.masters).map(([id, master]) => ({
      id,
      name: master.name || master.masterName || `Master ${this.masters.length + 1}`,
      raw: master
    }));
  }

  _extractVariables() {
    if (!this.document || !this.document.variables) return;
    this.globalVariables = this.document.variables;
  }

  async _extractResources(zip) {
    const filesFolder = zip.folder('files');
    if (!filesFolder) return;
    
    filesFolder.forEach((relativePath, file) => {
      if (!file.dir) {
        this.resources.set(relativePath, file);
      }
    });
  }

  /**
   * Get resource as base64 data URL
   */
  async getResourceDataUrl(resourcePath) {
    const file = this.resources.get(resourcePath);
    if (!file) return null;
    
    const data = await file.async('base64');
    // Determine mime type from extension
    const ext = path.extname(resourcePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };
    const mime = mimeTypes[ext] || 'application/octet-stream';
    return `data:${mime};base64,${data}`;
  }
}

export default RPParser;
