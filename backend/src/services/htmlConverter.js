import { RPParser } from './rpParser.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HTML Converter
 * Transforms parsed RP document into interactive HTML/CSS/JS
 */
export class HTMLConverter {
  constructor(outputDir) {
    this.outputDir = outputDir || path.join(__dirname, '../../output');
    this.parser = new RPParser();
    this.projectId = null;
    this.pages = [];
    this.interactions = [];
  }

  /**
   * Convert .rp file buffer to HTML project
   */
  async convert(buffer, options = {}) {
    this.projectId = uuidv4();
    
    // Parse the RP file
    const parsed = await this.parser.parse(buffer);
    this.pages = parsed.pages;
    
    // Create output directory
    const projectDir = path.join(this.outputDir, this.projectId);
    await fs.ensureDir(projectDir);
    await fs.ensureDir(path.join(projectDir, 'assets'));
    
    // Convert each page to HTML
    const pageFiles = [];
    for (let i = 0; i < parsed.pages.length; i++) {
      const page = parsed.pages[i];
      const html = await this._generatePageHTML(page, parsed, i);
      const filename = `page_${i}.html`;
      await fs.writeFile(path.join(projectDir, filename), html);
      pageFiles.push({
        filename,
        name: page.name,
        id: page.id
      });
    }
    
    // Generate index/navigation page
    const indexHTML = this._generateIndexPage(pageFiles, parsed);
    await fs.writeFile(path.join(projectDir, 'index.html'), indexHTML);
    
    // Copy/extract resources
    await this._extractResources(projectDir);
    
    return {
      projectId: this.projectId,
      url: `/previews/${this.projectId}/index.html`,
      pages: pageFiles,
      pageCount: pageFiles.length
    };
  }

  /**
   * Generate HTML for a single page
   */
  async _generatePageHTML(page, parsed, pageIndex) {
    const widgets = this._extractWidgets(page.raw);
    const interactions = this._extractInteractions(page.raw);
    
    const widgetsHTML = await this._renderWidgets(widgets, parsed);
    const interactionsJS = this._generateInteractionsJS(interactions);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name} - Yuanxing Preview</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    ${this._generatePageCSS(widgets)}
  </style>
</head>
<body>
  <div class="prototype-canvas" data-page="${page.id}">
    ${widgetsHTML}
  </div>
  
  <!-- Page navigation -->
  <nav class="page-nav">
    ${pageIndex > 0 ? `<a href="page_${pageIndex - 1}.html" class="nav-btn prev">← 上一页</a>` : ''}
    <span class="page-indicator">${pageIndex + 1} / ${parsed.pages.length}</span>
    ${pageIndex < parsed.pages.length - 1 ? `<a href="page_${pageIndex + 1}.html" class="nav-btn next">下一页 →</a>` : ''}
    <a href="index.html" class="nav-btn home">🏠 首页</a>
  </nav>
  
  <script src="interactions.js"></script>
  <script>
    ${interactionsJS}
  </script>
</body>
</html>`;
  }

  /**
   * Extract widgets from page data
   */
  _extractWidgets(pageData) {
    const widgets = [];
    
    // Recursive function to extract widgets from the tree
    const extractFromTree = (node, depth = 0) => {
      if (!node) return;
      
      if (node.type && node.type !== 'group') {
        widgets.push({
          ...node,
          depth
        });
      }
      
      // Handle children
      if (node.children) {
        node.children.forEach(child => extractFromTree(child, depth + 1));
      }
      
      // Handle dynamic panel states
      if (node.states) {
        node.states.forEach((state, idx) => {
          if (state.children) {
            state.children.forEach(child => {
              widgets.push({
                ...child,
                depth: depth + 1,
                parentId: node.id,
                stateIndex: idx,
                stateName: state.name
              });
            });
          }
        });
      }
    };
    
    // Start from page objects
    if (pageData.objects) {
      pageData.objects.forEach(obj => extractFromTree(obj));
    } else if (pageData.children) {
      pageData.children.forEach(child => extractFromTree(child));
    }
    
    return widgets;
  }

  /**
   * Extract interactions from page data
   */
  _extractInteractions(pageData) {
    const interactions = [];
    
    const extractInteractions = (node) => {
      if (!node) return;
      
      if (node.interactions) {
        node.interactions.forEach(interaction => {
          interactions.push({
            widgetId: node.id,
            ...interaction
          });
        });
      }
      
      if (node.children) {
        node.children.forEach(extractInteractions);
      }
    };
    
    if (pageData.objects) {
      pageData.objects.forEach(extractInteractions);
    } else if (pageData.children) {
      pageData.children.forEach(extractInteractions);
    }
    
    return interactions;
  }

  /**
   * Render widgets to HTML
   */
  async _renderWidgets(widgets, parsed) {
    let html = '';
    
    for (const widget of widgets) {
      html += await this._renderWidget(widget, parsed);
    }
    
    return html;
  }

  /**
   * Render a single widget to HTML
   */
  async _renderWidget(widget, parsed) {
    const id = widget.id || `widget_${Math.random().toString(36).substr(2, 9)}`;
    const style = this._computeWidgetStyle(widget);
    const classes = this._getWidgetClasses(widget);
    
    switch (widget.type) {
      case 'rectangle':
      case 'buttonShape':
        return `<div id="${id}" class="${classes}" style="${style}">${widget.text || ''}</div>\n`;
      
      case 'button':
        return `<button id="${id}" class="${classes}" style="${style}">${widget.text || 'Button'}</button>\n`;
      
      case 'paragraph':
      case 'label':
      case 'text':
      case 'textLink':
        return `<p id="${id}" class="${classes}" style="${style}">${widget.text || ''}</p>\n`;
      
      case 'h1':
      case 'heading1':
        return `<h1 id="${id}" class="${classes}" style="${style}">${widget.text || ''}</h1>\n`;
      
      case 'h2':
      case 'heading2':
        return `<h2 id="${id}" class="${classes}" style="${style}">${widget.text || ''}</h2>\n`;
      
      case 'h3':
      case 'heading3':
        return `<h3 id="${id}" class="${classes}" style="${style}">${widget.text || ''}</h3>\n`;
      
      case 'image':
      case 'imageBox':
        const imgSrc = widget.image ? await this._getImageSrc(widget.image) : '';
        return `<img id="${id}" class="${classes}" style="${style}" src="${imgSrc}" alt="${widget.alt || ''}" />\n`;
      
      case 'dynamicPanel':
        return this._renderDynamicPanel(widget, id, classes, style);
      
      case 'textField':
        return `<input type="text" id="${id}" class="${classes}" style="${style}" placeholder="${widget.placeholder || ''}" />\n`;
      
      case 'textArea':
        return `<textarea id="${id}" class="${classes}" style="${style}" placeholder="${widget.placeholder || ''}"></textarea>\n`;
      
      case 'checkbox':
        return `<label class="${classes}" style="${style}"><input type="checkbox" id="${id}" /> ${widget.text || ''}</label>\n`;
      
      case 'radioButton':
        return `<label class="${classes}" style="${style}"><input type="radio" name="${widget.groupName || 'radio'}" id="${id}" /> ${widget.text || ''}</label>\n`;
      
      case 'listBox':
        return this._renderListBox(widget, id, classes, style);
      
      case 'comboBox':
        return this._renderComboBox(widget, id, classes, style);
      
      case 'table':
        return this._renderTable(widget, id, classes, style);
      
      case 'horizontalLine':
        return `<hr id="${id}" class="${classes}" style="${style}" />\n`;
      
      case 'verticalLine':
        return `<div id="${id}" class="${classes} vertical-line" style="${style}"></div>\n`;
      
      case 'inlineFrame':
        return `<iframe id="${id}" class="${classes}" style="${style}" src="${widget.src || ''}"></iframe>\n`;
      
      case 'hotspot':
        return `<div id="${id}" class="${classes} hotspot" style="${style}"></div>\n`;
      
      case 'repeater':
        return this._renderRepeater(widget, id, classes, style);
      
      default:
        // Generic div for unknown types
        return `<div id="${id}" class="${classes}" style="${style}">${widget.text || ''}</div>\n`;
    }
  }

  /**
   * Compute CSS style for a widget
   */
  _computeWidgetStyle(widget) {
    const style = widget.style || widget.widgetStyle || {};
    const loc = widget.location || widget.loc || {};
    const size = widget.size || widget.dim || {};
    
    let css = '';
    
    // Position and size
    if (loc.x !== undefined) css += `left: ${loc.x}px; `;
    if (loc.y !== undefined) css += `top: ${loc.y}px; `;
    if (size.width || size.w) css += `width: ${size.width || size.w}px; `;
    if (size.height || size.h) css += `height: ${size.height || size.h}px; `;
    
    // Background
    if (style.backgroundColor) css += `background-color: ${style.backgroundColor}; `;
    if (style.backgroundImage) css += `background-image: url(${style.backgroundImage}); `;
    if (style.backgroundSize) css += `background-size: ${style.backgroundSize}; `;
    if (style.background) css += `background: ${style.background}; `;
    
    // Text styling
    if (style.fontFamily) css += `font-family: ${style.fontFamily}; `;
    if (style.fontSize) css += `font-size: ${style.fontSize}px; `;
    if (style.fontWeight) css += `font-weight: ${style.fontWeight}; `;
    if (style.color) css += `color: ${style.color}; `;
    if (style.textAlign) css += `text-align: ${style.textAlign}; `;
    if (style.lineHeight) css += `line-height: ${style.lineHeight}; `;
    if (style.letterSpacing) css += `letter-spacing: ${style.letterSpacing}px; `;
    if (style.textDecoration) css += `text-decoration: ${style.textDecoration}; `;
    
    // Borders
    if (style.borderWidth) css += `border-width: ${style.borderWidth}px; `;
    if (style.borderColor) css += `border-color: ${style.borderColor}; `;
    if (style.borderStyle) css += `border-style: ${style.borderStyle}; `;
    if (style.borderRadius) css += `border-radius: ${style.borderRadius}px; `;
    
    // Effects
    if (style.opacity !== undefined) css += `opacity: ${style.opacity}; `;
    if (style.boxShadow) css += `box-shadow: ${style.boxShadow}; `;
    if (style.cursor) css += `cursor: ${style.cursor}; `;
    
    // Transform
    if (style.rotation) css += `transform: rotate(${style.rotation}deg); `;
    
    return css.trim();
  }

  /**
   * Get CSS classes for a widget
   */
  _getWidgetClasses(widget) {
    const classes = ['widget', `widget-${widget.type}`];
    if (widget.class) classes.push(widget.class);
    return classes.join(' ');
  }

  /**
   * Render dynamic panel
   */
  _renderDynamicPanel(widget, id, classes, style) {
    let html = `<div id="${id}" class="${classes} dynamic-panel" style="${style}">`;
    
    if (widget.states) {
      widget.states.forEach((state, idx) => {
        const stateStyle = idx === 0 ? '' : 'display:none;';
        html += `<div class="panel-state" data-state="${state.name}" style="${stateStyle}">`;
        if (state.children) {
          state.children.forEach(child => {
            html += `<div class="widget widget-${child.type}" style="${this._computeWidgetStyle(child)}">${child.text || ''}</div>`;
          });
        }
        html += `</div>`;
      });
    }
    
    html += `</div>\n`;
    return html;
  }

  /**
   * Render list box
   */
  _renderListBox(widget, id, classes, style) {
    const items = widget.items || ['Item 1', 'Item 2', 'Item 3'];
    let html = `<select id="${id}" class="${classes}" style="${style}" size="${widget.size || 3}">`;
    items.forEach(item => {
      html += `<option value="${item}">${item}</option>`;
    });
    html += `</select>\n`;
    return html;
  }

  /**
   * Render combo box
   */
  _renderComboBox(widget, id, classes, style) {
    const items = widget.items || ['Option 1', 'Option 2', 'Option 3'];
    let html = `<select id="${id}" class="${classes}" style="${style}">`;
    items.forEach(item => {
      html += `<option value="${item}">${item}</option>`;
    });
    html += `</select>\n`;
    return html;
  }

  /**
   * Render table
   */
  _renderTable(widget, id, classes, style) {
    const rows = widget.rows || [['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']];
    let html = `<table id="${id}" class="${classes}" style="${style}">`;
    rows.forEach(row => {
      html += `<tr>`;
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += `</tr>`;
    });
    html += `</table>\n`;
    return html;
  }

  /**
   * Render repeater
   */
  _renderRepeater(widget, id, classes, style) {
    const items = widget.data || [{ name: 'Item 1' }, { name: 'Item 2' }];
    let html = `<div id="${id}" class="${classes} repeater" style="${style}">`;
    items.forEach(item => {
      html += `<div class="repeater-item">`;
      if (widget.template) {
        html += `<span>${widget.template.replace(/\{\{(\w+)\}\}/g, (_, key) => item[key] || '')}</span>`;
      }
      html += `</div>`;
    });
    html += `</div>\n`;
    return html;
  }

  /**
   * Get image source from resource
   */
  async _getImageSrc(imageData) {
    if (!imageData) return '';
    
    // Handle different image reference formats
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:') || imageData.startsWith('http')) {
        return imageData;
      }
      // Try to get from parser resources
      return await this.parser.getResourceDataUrl(imageData) || '';
    }
    
    if (imageData.url) return imageData.url;
    
    return '';
  }

  /**
   * Generate interactions JavaScript
   */
  _generateInteractionsJS(interactions) {
    let js = '';
    
    interactions.forEach(interaction => {
      const { widgetId, event, action, target } = interaction;
      
      switch (event) {
        case 'onClick':
        case 'click':
          js += `
            document.getElementById('${widgetId}')?.addEventListener('click', function() {
              ${this._generateActionJS(action, target)}
            });
          `;
          break;
        case 'onMouseOver':
        case 'mouseover':
          js += `
            document.getElementById('${widgetId}')?.addEventListener('mouseenter', function() {
              ${this._generateActionJS(action, target)}
            });
          `;
          break;
        case 'onMouseOut':
        case 'mouseout':
          js += `
            document.getElementById('${widgetId}')?.addEventListener('mouseleave', function() {
              ${this._generateActionJS(action, target)}
            });
          `;
          break;
        case 'onFocus':
          js += `
            document.getElementById('${widgetId}')?.addEventListener('focus', function() {
              ${this._generateActionJS(action, target)}
            });
          `;
          break;
        case 'onChange':
          js += `
            document.getElementById('${widgetId}')?.addEventListener('change', function() {
              ${this._generateActionJS(action, target)}
            });
          `;
          break;
      }
    });
    
    return js;
  }

  /**
   * Generate action JS
   */
  _generateActionJS(action, target) {
    if (!action) return '';
    
    switch (action.type) {
      case 'openLink':
        if (target?.pageIndex !== undefined) {
          return `window.location.href = 'page_${target.pageIndex}.html';`;
        }
        return `window.open('${target?.url || '#'}', '_blank');`;
      case 'show':
        return `document.getElementById('${target?.id}')?.style.display = 'block';`;
      case 'hide':
        return `document.getElementById('${target?.id}')?.style.display = 'none';`;
      case 'toggle':
        return `
          var el = document.getElementById('${target?.id}');
          if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
        `;
      case 'setPanelState':
        return this._generatePanelStateJS(target);
      case 'setValue':
        return `document.getElementById('${target?.id}')?.value = '${target?.value || ''}';`;
      default:
        return '';
    }
  }

  /**
   * Generate panel state change JS
   */
  _generatePanelStateJS(target) {
    if (!target?.id) return '';
    return `
      var panel = document.getElementById('${target.id}');
      if (panel) {
        var states = panel.querySelectorAll('.panel-state');
        states.forEach((s, i) => s.style.display = i === ${target.stateIndex || 0} ? 'block' : 'none');
      }
    `;
  }

  /**
   * Generate page-level CSS
   */
  _generatePageCSS(widgets) {
    return `
      .prototype-canvas {
        position: relative;
        margin: 0 auto;
        background: #ffffff;
        min-height: 600px;
      }
      .widget {
        position: absolute;
        box-sizing: border-box;
      }
      .hotspot {
        cursor: pointer;
      }
      .dynamic-panel .panel-state {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .vertical-line {
        width: 1px !important;
        background-color: #000;
      }
    `;
  }

  /**
   * Generate index/navigation page
   */
  _generateIndexPage(pageFiles, parsed) {
    const pageLinks = pageFiles.map((page, idx) => 
      `<li><a href="${page.filename}" class="page-link">
        <span class="page-number">${idx + 1}</span>
        <span class="page-name">${page.name}</span>
      </a></li>`
    ).join('\n');
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>原型预览 - Yuanxing</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .index-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .index-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .index-header h1 {
      margin: 0;
      color: #333;
    }
    .index-header p {
      color: #666;
      margin-top: 8px;
    }
    .page-list {
      list-style: none;
      padding: 0;
    }
    .page-link {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      transition: all 0.2s;
    }
    .page-link:hover {
      background: #e9ecef;
      transform: translateX(4px);
    }
    .page-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #4A90D9;
      color: white;
      border-radius: 50%;
      margin-right: 16px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="index-container">
    <div class="index-header">
      <h1>📐 原型预览</h1>
      <p>共 ${pageFiles.length} 个页面</p>
    </div>
    <ul class="page-list">
      ${pageLinks}
    </ul>
  </div>
</body>
</html>`;
  }

  /**
   * Extract resource files to disk
   */
  async _extractResources(projectDir) {
    const assetsDir = path.join(projectDir, 'assets');
    await fs.ensureDir(assetsDir);
    
    for (const [relativePath, file] of this.parser.resources) {
      const data = await file.async('uint8array');
      const filePath = path.join(assetsDir, relativePath);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, data);
    }
  }
}

export default HTMLConverter;
