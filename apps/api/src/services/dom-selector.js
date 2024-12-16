class SelectorBuilder {
  constructor() {
    this.currentPath = []
    this.selectorObject = {}
    this.isMultiSelect = false
    this.currentElement = null
    this.currentKey = ''
    this.currentObjectName = ''
  }

  setCurrentKey(key) {
    this.currentKey = key
    if (!this.getValueAtPath()) {
      this.setValueAtPath([])
    }
  }

  getValueAtPath() {
    let current = this.selectorObject
    for (let i = 0; i < this.currentPath.length; i++) {
      if (!(this.currentPath[i] in current)) {
        return undefined
      }
      current = current[this.currentPath[i]]
    }
    return current[this.currentKey]
  }

  setValueAtPath(value) {
    let current = this.selectorObject
    for (let i = 0; i < this.currentPath.length; i++) {
      if (!(this.currentPath[i] in current)) {
        current[this.currentPath[i]] = {}
      }
      current = current[this.currentPath[i]]
    }
    current[this.currentKey] = value
  }

  addSelector(selector, text) {
    const currentValue = this.getValueAtPath() || []
    if (Array.isArray(currentValue)) {
      if (!currentValue.some((item) => item.selector === selector)) {
        currentValue.push({ selector, text })
        this.setValueAtPath(currentValue)
      }
    }
  }

  removeSelector(selector) {
    const currentValue = this.getValueAtPath()
    if (Array.isArray(currentValue)) {
      const filtered = currentValue.filter((item) => item.selector !== selector)
      this.setValueAtPath(filtered)
    }
  }

  toJSON() {
    return this.selectorObject
  }

  startNewObject(name) {
    this.currentObjectName = name
    this.selectorObject[name] = {}
    this.currentPath = [name]
  }

  getCurrentObjectName() {
    return this.currentObjectName
  }
}

class DOMTextFinder {
  constructor(config = {}) {
    this.config = {
      minTextLength: 1,
      maxAncestors: 8,
      ignoreHiddenElements: false,
      ...config,
    }

    this.results = {
      leafNodes: [],
      selectors: new Map(),
      failed: [],
      dedupedMap: new Map(),
    }

    this.selectorBuilder = new SelectorBuilder()
    this.setupKeyboardNavigation()
    this.createFloatingUI()
  }

  getDirectTextContent(element) {
    let text = ''
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent
      }
    }
    return text.trim()
  }

  isLeafNode(element) {
    // Get direct text content (excluding child elements)
    const directText = this.getDirectTextContent(element)

    // Consider it a leaf if it has direct text content of sufficient length
    if (directText.length >= this.config.minTextLength) {
      return true
    }

    // If no direct text, check if it has no children (traditional leaf)
    return (
      element.children.length === 0 &&
      element.textContent.trim().length >= this.config.minTextLength
    )
  }

  isVisibleElement(element) {
    if (!this.config.ignoreHiddenElements) return true
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    )
  }

  findElements() {
    // Walk the DOM tree looking for leaf nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (!this.isVisibleElement(node)) {
            return NodeFilter.FILTER_REJECT // Skip hidden elements and their children
          }
          return NodeFilter.FILTER_ACCEPT
        },
      },
    )

    let node
    let nodeIndex = 0

    while ((node = walker.nextNode())) {
      if (this.isLeafNode(node)) {
        // Use direct text content if available, otherwise use full text content
        const text = this.getDirectTextContent(node) || node.textContent.trim()
        const selector = this.generateSelector(node)

        if (selector) {
          this.results.leafNodes.push({
            element: node,
            text,
            selector,
            index: nodeIndex++,
            hasChildren: node.children.length > 0,
          })

          this.results.selectors.set(text, {
            selector,
            index: nodeIndex - 1,
          })

          // Store in dedupedMap if we haven't seen this text before
          if (!this.results.dedupedMap.has(text)) {
            this.results.dedupedMap.set(text, {
              selector,
              index: nodeIndex - 1,
            })
          }
        }
      }
    }

    return this.results
  }

  generateSelector(element) {
    try {
      // Try ID if it exists and is valid
      if (element.id) {
        const escapedId = this.escapeCSS(element.id)
        const idSelector = `#${escapedId}`
        try {
          if (this.isUniqueSelector(idSelector, element)) {
            return idSelector
          }
        } catch (e) {
          console.warn('Invalid ID selector:', idSelector)
        }
      }

      // Try specific attributes that might make the element unique
      const uniqueAttributes = ['data-testid', 'name', 'aria-label']
      for (const attr of uniqueAttributes) {
        const value = element.getAttribute(attr)
        if (value) {
          const escapedValue = this.escapeCSS(value)
          const attrSelector = `[${attr}="${escapedValue}"]`
          try {
            if (this.isUniqueSelector(attrSelector, element)) {
              return attrSelector
            }
          } catch (e) {
            console.warn('Invalid attribute selector:', attrSelector)
          }
        }
      }

      // Try tag with classes
      if (element.className) {
        const classes = element.className.trim().split(/\s+/).filter(Boolean)
        const escapedClasses = classes.map((c) => this.escapeCSS(c))
        const classSelector =
          element.tagName.toLowerCase() + '.' + escapedClasses.join('.')

        try {
          if (this.isUniqueSelector(classSelector, element)) {
            return classSelector
          }
        } catch (e) {
          console.warn('Invalid class selector:', classSelector)
        }
      }

      // Generate path with nth-child for precision
      return this.generatePreciseSelector(element)
    } catch (e) {
      this.results.failed.push({
        element,
        error: e.message,
        index: this.results.failed.length,
      })
      // Fallback to simple nth-child path
      return this.generateSimpleNthChildPath(element)
    }
  }

  generatePreciseSelector(element) {
    const path = []
    let current = element

    while (current && current !== document.body) {
      const parent = current.parentElement
      if (!parent) break

      const index = Array.from(parent.children).indexOf(current) + 1
      const tag = current.tagName.toLowerCase()

      // Add class if it exists and is unique among siblings
      let selector = tag
      if (current.className) {
        const classes = current.className.trim().split(/\s+/).filter(Boolean)
        const uniqueClass = classes.find((className) => {
          try {
            const classSelector = `${tag}.${this.escapeCSS(className)}`
            const matches = parent.querySelectorAll(classSelector)
            return matches.length === 1 && matches[0] === current
          } catch (e) {
            return false
          }
        })

        if (uniqueClass) {
          selector += `.${this.escapeCSS(uniqueClass)}`
        } else {
          selector += `:nth-child(${index})`
        }
      } else {
        selector += `:nth-child(${index})`
      }

      path.unshift(selector)
      current = parent

      // Check if the current path is already unique
      const testSelector = path.join(' > ')
      try {
        if (this.isUniqueSelector(testSelector, element)) {
          return testSelector
        }
      } catch (e) {
        console.warn('Invalid selector generated:', testSelector)
      }
    }

    // Fallback to a simple nth-child path if other methods fail
    return this.generateSimpleNthChildPath(element)
  }

  generateSimpleNthChildPath(element) {
    const path = []
    let current = element

    while (current && current !== document.body) {
      const parent = current.parentElement
      if (!parent) break

      const index = Array.from(parent.children).indexOf(current) + 1
      const tag = current.tagName.toLowerCase()
      path.unshift(`${tag}:nth-child(${index})`)
      current = parent
    }

    return path.join(' > ')
  }

  escapeCSS(str) {
    if (!str || typeof str !== 'string') return ''

    // First replace all backslashes with double backslashes
    str = str.replace(/\\/g, '\\\\')

    // Then escape all special characters
    return str
      .replace(/[!"#$%&'()*+,.\/:;<=>?@[\]^`{|}~]/g, '\\$&') // Escape special characters
      .replace(/^-/, '\\-') // Escape leading hyphen
      .replace(/^\d/, '\\3$&') // Escape leading digit
  }

  isUniqueSelector(selector, element) {
    try {
      // First validate the selector syntax
      document.createAttribute(selector)

      const matches = document.querySelectorAll(selector)
      return matches.length === 1 && matches[0] === element
    } catch (e) {
      return false
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.selectorBuilder.currentElement) return

      const current = this.selectorBuilder.currentElement
      let newElement = null

      // Remove previous traversal highlight
      document.querySelectorAll('.leaf-finder-traversing').forEach((el) => {
        el.classList.remove('leaf-finder-traversing')
      })

      switch (e.key.toLowerCase()) {
        case 'w':
          newElement = current.parentElement
          break
        case 's':
          newElement =
            current.firstElementChild ||
            Array.from(current.children).find(
              (child) => this.isLeafNode(child) || child.children.length > 0,
            )
          break
        case 'a':
          newElement = current.previousElementSibling
          break
        case 'd':
          newElement = current.nextElementSibling
          break
        case 'enter':
          if (this.selectorBuilder.currentKey) {
            const selector = this.generateSelector(current)
            const text =
              this.getDirectTextContent(current) || current.textContent.trim()

            if (!e.ctrlKey && !this.selectorBuilder.isMultiSelect) {
              // Clear previous selections for this key
              document
                .querySelectorAll('.leaf-finder-selected')
                .forEach((el) => {
                  el.classList.remove('leaf-finder-selected')
                })
              this.selectorBuilder.setValueAtPath([])
            }

            current.classList.toggle('leaf-finder-selected')

            if (current.classList.contains('leaf-finder-selected')) {
              this.selectorBuilder.addSelector(selector, text)
              this.updateSelections(text)
            } else {
              this.selectorBuilder.removeSelector(selector)
            }

            // Update the tree view
            const treeContainer =
              this.shadowRoot.querySelector('.tree-container')
            treeContainer.innerHTML = renderTree(
              this.selectorBuilder.selectorObject,
            )
            this.setupTreeNodeListeners()

            // Reselect the current node
            const currentNode = this.shadowRoot.querySelector(
              `[data-path="${this.selectorBuilder.currentPath.join('.')}.${this.selectorBuilder.currentKey}"]`,
            )
            if (currentNode) {
              currentNode.classList.add('selected')
            }
          } else {
            this.showStatus('Please select a property from the tree first')
          }
          break
        case 'control':
          this.selectorBuilder.isMultiSelect = true
          break
      }

      if (newElement) {
        e.preventDefault()
        // Add traversal highlight to new element
        newElement.classList.add('leaf-finder-traversing')
        this.selectorBuilder.currentElement = newElement
      }
    })

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        this.selectorBuilder.isMultiSelect = false
      }
    })
  }

  highlight() {
    // Remove existing highlights
    document
      .querySelectorAll('.leaf-finder-highlight, .leaf-finder-traversing')
      .forEach((el) => {
        if (el.closest('#selector-builder-container')) return // Skip UI elements
        el.classList.remove(
          'leaf-finder-highlight',
          'leaf-finder-selected',
          'leaf-finder-traversing',
        )
        if (el._clickHandler) {
          el.removeEventListener('click', el._clickHandler)
        }
      })

    // Add styles if not present
    if (!document.getElementById('leaf-finder-styles')) {
      const style = document.createElement('style')
      style.id = 'leaf-finder-styles'
      style.textContent = `
          .leaf-finder-highlight {
            outline: 2px solid #44FF44 !important;
            background-color: rgba(68, 255, 68, 0.1) !important;
            cursor: pointer !important;
            transition: all 0.2s ease-in-out !important;
          }
          .leaf-finder-highlight:hover {
            outline: 3px solid #00FF00 !important;
            background-color: rgba(68, 255, 68, 0.2) !important;
          }
          .leaf-finder-highlight-with-children {
            outline-style: dashed !important;
          }
          .leaf-finder-selected {
            outline: 3px solid #FF4444 !important;
            background-color: rgba(255, 68, 68, 0.2) !important;
          }
          .leaf-finder-traversing {
            outline: 3px solid #4444FF !important;
            background-color: rgba(68, 68, 255, 0.2) !important;
          }
          .selector-copied {
            position: fixed;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            z-index: 10000;
            animation: fadeOut 1s ease-in-out;
          }
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
          }
          .delete-key-btn, .delete-item-btn {
            background: none;
            border: none;
            color: #ff4444;
            cursor: pointer;
            font-size: 14px;
            padding: 0 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
          }
          .delete-key-btn:hover, .delete-item-btn:hover {
            opacity: 1;
          }
          .array-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .clear-all-btn {
            background: #ff4444;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
          }
          .clear-all-btn:hover {
            background: #ff2222;
          }
        `
      document.head.appendChild(style)
    }

    // Highlight elements and add click handlers
    this.results.leafNodes.forEach(
      ({ element, text, selector, index, hasChildren }) => {
        try {
          element.classList.add('leaf-finder-highlight')
          if (hasChildren) {
            element.classList.add('leaf-finder-highlight-with-children')
          }

          const clickHandler = (e) => {
            // Prevent default only for interactive elements
            if (
              element.tagName.toLowerCase() in
              { a: 1, button: 1, input: 1, select: 1, textarea: 1 }
            ) {
              e.preventDefault()
              e.stopPropagation()
            }

            if (!this.selectorBuilder.currentKey) {
              this.showStatus('Please select a property from the tree first')
              return
            }

            if (!e.ctrlKey && !this.selectorBuilder.isMultiSelect) {
              // Clear previous selections for this key
              document
                .querySelectorAll('.leaf-finder-selected')
                .forEach((el) => {
                  el.classList.remove('leaf-finder-selected')
                })
              this.selectorBuilder.setValueAtPath([])
            }

            element.classList.toggle('leaf-finder-selected')

            if (element.classList.contains('leaf-finder-selected')) {
              this.selectorBuilder.addSelector(selector, text)
              this.updateSelections(text)
            } else {
              this.selectorBuilder.removeSelector(selector)
            }

            this.selectorBuilder.currentElement = element

            // Update the tree view to show new selection count
            const treeContainer =
              this.shadowRoot.querySelector('.tree-container')
            treeContainer.innerHTML = renderTree(
              this.selectorBuilder.selectorObject,
            )
            this.setupTreeNodeListeners()

            // Reselect the current node
            const currentNode = this.shadowRoot.querySelector(
              `[data-path="${this.selectorBuilder.currentPath.join('.')}.${this.selectorBuilder.currentKey}"]`,
            )
            if (currentNode) {
              currentNode.classList.add('selected')
            }
          }

          element._clickHandler = clickHandler
          element.addEventListener('click', clickHandler)

          element.title = [
            `Text: ${text}`,
            `Type: ${hasChildren ? 'Semi-leaf' : 'Leaf'}`,
            `Selector: ${selector}`,
            `Index: ${index}`,
            'Click to select/deselect',
            'Control+Click for multi-select',
            'Arrow keys to navigate',
          ].join('\n')
        } catch (e) {
          console.warn('Failed to highlight:', e)
        }
      },
    )
  }

  // Add method to get the current selection object
  getSelectionObject() {
    return this.selectorBuilder.toJSON()
  }

  createFloatingUI() {
    const container = document.createElement('div')
    container.id = 'selector-builder-container'
    const shadow = container.attachShadow({ mode: 'closed' })

    const styles = document.createElement('style')
    styles.textContent = `
        #selector-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 20vw;
          background: #2a2a2a;
          color: white;
          padding: 15px;
          border-radius: 0 8px 8px 0;
          box-shadow: 4px 0 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        #selector-panel.minimized {
          width: 40px;
          padding: 15px 8px;
        }
        #selector-panel.minimized .controls > *:not(.header),
        #selector-panel.minimized .object-tree {
          display: none;
        }
        #selector-panel.minimized .header {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          margin: 10px 0;
        }
        #selector-panel.minimized .minimize {
          transform: rotate(180deg);
          margin-top: 10px;
        }
        .controls {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
        }
        .object-tree {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 0;
          overflow: hidden;
        }
        .tree-container {
          flex: 1;
          overflow: auto;
          padding: 10px;
          background: #1a1a1a;
          border-radius: 4px;
          font-family: monospace;
          min-height: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }
        .minimize {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          background: #444;
          transition: all 0.3s ease;
        }
        .status {
          font-size: 12px;
          color: #4CAF50;
          margin-top: 8px;
          min-height: 15px;
        }
        .selections {
          margin-top: 8px;
          flex: 1;
          overflow: auto;
          background: #333;
          border-radius: 4px;
          padding: 8px;
        }
        .selection-item {
          font-size: 12px;
          color: #ddd;
          margin: 2px 0;
        }
        .tree-toolbar {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .tree-toolbar button {
          flex: 1;
        }
        .tree-node {
          padding: 2px 0 2px 20px;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tree-node-content {
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 20px;
        }
        .tree-node:hover > .tree-node-content {
          background: rgba(255,255,255,0.1);
        }
        .tree-node.selected > .tree-node-content {
          background: rgba(76, 175, 80, 0.2);
        }
        .tree-node .selection-count {
          background: #4CAF50;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-key-btn {
          opacity: 0;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 3px;
          width: 16px;
          height: 16px;
          line-height: 16px;
          text-align: center;
          cursor: pointer;
          font-size: 12px;
          transition: opacity 0.2s;
        }
        .tree-node-content:hover .add-key-btn {
          opacity: 1;
        }
        .new-key-input {
          background: #333;
          border: 1px solid #555;
          color: white;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 12px;
          width: 100px;
        }
        .tree-children {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tree-array {
          color: #b5cea8;
          font-style: italic;
          font-size: 0.9em;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tree-object {
          color: #dcdcaa;
        }
        input, button {
          margin: 5px 0;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #444;
          background: #333;
          color: white;
          width: calc(100% - 18px);
          font-family: inherit;
        }
        button {
          background: #4CAF50;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #45a049;
        }
        button.secondary {
          background: #666;
        }
        button.secondary:hover {
          background: #777;
        }
      `

    const panel = document.createElement('div')
    panel.id = 'selector-panel'
    panel.innerHTML = `
        <div class="controls">
          <div class="header">
            <strong>Selector Builder</strong>
            <span class="minimize">_</span>
          </div>
          <div class="status"></div>
          <div class="selections"></div>
          <button id="save-selections" style="margin-top: 10px">Save Selections</button>
        </div>
        <div class="object-tree">
          <div class="tree-toolbar">
            <button id="edit-tree">Edit</button>
            <button id="save-tree" style="display: none">Save</button>
            <button class="secondary" id="format-tree" style="display: none">Format</button>
          </div>
          <div class="tree-container"></div>
        </div>
      `

    shadow.appendChild(styles)
    shadow.appendChild(panel)
    document.body.appendChild(container)

    this.shadowRoot = shadow

    // Setup tree editor
    const treeContainer = shadow.querySelector('.tree-container')
    const editButton = shadow.querySelector('#edit-tree')
    const saveButton = shadow.querySelector('#save-tree')
    const formatButton = shadow.querySelector('#format-tree')

    let isEditing = false
    let editor = null

    const defaultObject = {
      product: {
        title: [],
        price: {
          currency: [],
          value: [],
        },
      },
    }

    const renderTree = (obj, path = '', level = 0) => {
      let html = ''
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        const isArray = Array.isArray(value)
        const isObject = !isArray && typeof value === 'object'
        const selectionCount = isArray ? value.length : 0

        html += `<div class="tree-node" data-path="${currentPath}">
          <div class="tree-node-content">
            ${selectionCount > 0 ? `<span class="selection-count">${selectionCount}</span>` : ''}
            ${isObject ? `<button class="add-key-btn" data-path="${currentPath}">+</button>` : ''}
            ${isObject ? `<button class="delete-key-btn" data-path="${currentPath}">×</button>` : ''}
            <span class="tree-key">${key}</span>: `

        if (isArray) {
          const displayText = value
            .map((v, i) => {
              const shortText =
                v.text?.substring(0, 30) + (v.text?.length > 30 ? '...' : '') ||
                ''
              return `<span class="array-item">
                ${shortText}
                <button class="delete-item-btn" data-path="${currentPath}" data-index="${i}">×</button>
              </span>`
            })
            .join(', ')
          html += `<span class="tree-array" title="${value.map((v) => v.text).join('\n')}">[${displayText}]</span>`
        } else if (isObject) {
          html += `<span class="tree-object">{</span>`
        } else {
          html += `<span class="tree-value">${value}</span>`
        }

        html += '</div>'

        if (isObject) {
          html += `<div class="tree-children">${renderTree(value, currentPath, level + 1)}</div>`
          html += `<div class="tree-node-content"><span class="tree-object">}</span></div>`
        }

        html += '</div>'
      }
      return html
    }

    const setupAddKeyListeners = () => {
      const addButtons = this.shadowRoot.querySelectorAll('.add-key-btn')
      addButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const path = btn.dataset.path
          const input = document.createElement('input')
          input.className = 'new-key-input'
          input.placeholder = 'new key'

          const handleAdd = (e) => {
            if (e.key === 'Enter') {
              const newKey = input.value.trim()
              if (newKey) {
                // Get the parent object at the path
                const pathParts = path.split('.')
                let current = this.selectorBuilder.selectorObject
                for (const part of pathParts) {
                  current = current[part]
                }
                // Add the new key with empty array
                current[newKey] = []

                // Re-render the tree
                treeContainer.innerHTML = renderTree(
                  this.selectorBuilder.selectorObject,
                )
                this.setupTreeNodeListeners()
                setupAddKeyListeners()
              }
              input.remove()
            } else if (e.key === 'Escape') {
              input.remove()
            }
          }

          input.addEventListener('keydown', handleAdd)
          btn.parentNode.insertBefore(input, btn.nextSibling)
          input.focus()
        })
      })
    }

    const formatStructure = (code) => {
      try {
        // First, normalize whitespace but preserve newlines
        let objStr = code.replace(/[\t ]+/g, ' ').trim()

        // Handle cases where there's no space after colons
        objStr = objStr.replace(/:/g, ': ')

        // Handle shorthand properties with different value types
        objStr = objStr.replace(/(\w+)(?=\s*[:,]|\s*})/g, (match, prop) => {
          // Skip if already quoted
          if (objStr.charAt(objStr.indexOf(match) - 1) === '"') return match
          return `"${prop}"`
        })

        // Handle empty or shorthand values
        objStr = objStr.replace(/:\s*,/g, ': "",')
        objStr = objStr.replace(/:\s*}/g, ': ""}')

        // Handle numeric values without quotes
        objStr = objStr.replace(/:\s*(\d+)(?=\s*[,}])/g, ': $1')

        // Handle empty objects and arrays
        objStr = objStr.replace(/:\s*{(?=\s*[,}])/g, ': {}')
        objStr = objStr.replace(/:\s*\[(?=\s*[,}])/g, ': []')

        // Parse and stringify to get proper formatting
        const obj = JSON.parse(objStr)
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        console.error('Format error:', e, '\nInput:', code)
        return code
      }
    }

    const handleEditorInput = (e) => {
      const editor = e.target
      const cursorPos = editor.selectionStart
      const value = editor.value
      const lastChar = value[cursorPos - 1]

      // Store scroll position
      const scrollTop = editor.scrollTop

      // Format on specific characters or after a delay
      if (
        lastChar === '{' ||
        lastChar === '}' ||
        lastChar === ',' ||
        lastChar === ':'
      ) {
        try {
          const formatted = formatStructure(value)
          if (formatted !== value) {
            // Save the cursor position relative to the previous character
            const beforeCursor = value.substring(0, cursorPos)
            const afterCursor = value.substring(cursorPos)

            editor.value = formatted

            // Try to restore cursor position intelligently
            let newPos = cursorPos
            if (lastChar === '{') {
              // Position inside the newly created object
              const nextBrace = formatted.indexOf('}', cursorPos)
              if (nextBrace !== -1) {
                newPos = nextBrace
              }
            } else if (lastChar === ',') {
              // Position after the comma and any formatting
              const lines = formatted.split('\n')
              let charCount = 0
              for (const line of lines) {
                if (charCount + line.length >= cursorPos) {
                  newPos = charCount + line.length + 1
                  break
                }
                charCount += line.length + 1 // +1 for the newline
              }
            }

            // Restore cursor and scroll position
            editor.selectionStart = editor.selectionEnd = newPos
            editor.scrollTop = scrollTop
          }
        } catch (e) {
          // If formatting fails, keep the original text
          console.error('Editor format error:', e)
        }
      }
    }

    const enterEditMode = () => {
      isEditing = true
      treeContainer.classList.add('editing')
      editButton.style.display = 'none'
      saveButton.style.display = 'block'
      formatButton.style.display = 'block'

      editor = document.createElement('textarea')
      editor.className = 'tree-editor'
      editor.value = JSON.stringify(
        this.selectorBuilder.selectorObject || defaultObject,
        null,
        2,
      )
      editor.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 200px;
        background: #1e1e1e;
        color: #d4d4d4;
        border: 1px solid #404040;
        border-radius: 4px;
        padding: 8px;
        font-family: monospace;
        font-size: 12px;
        resize: vertical;
        tab-size: 2;
      `
      editor.addEventListener('input', handleEditorInput)
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault()
          const start = editor.selectionStart
          const end = editor.selectionEnd
          editor.value =
            editor.value.substring(0, start) +
            '  ' +
            editor.value.substring(end)
          editor.selectionStart = editor.selectionEnd = start + 2
        }
      })

      treeContainer.innerHTML = ''
      treeContainer.appendChild(editor)
      editor.focus()
    }

    const exitEditMode = () => {
      try {
        const formatted = formatStructure(editor.value)
        const obj = JSON.parse(formatted)

        this.selectorBuilder.selectorObject = obj
        isEditing = false
        treeContainer.classList.remove('editing')
        editButton.style.display = 'block'
        saveButton.style.display = 'none'
        formatButton.style.display = 'none'

        treeContainer.innerHTML = renderTree(obj)
        this.setupTreeNodeListeners()
        setupAddKeyListeners()
        this.showStatus('Structure updated')
      } catch (e) {
        this.showStatus('Error: ' + e.message)
      }
    }

    // Add save selections handler
    const saveSelectionsButton = shadow.querySelector('#save-selections')
    saveSelectionsButton.addEventListener('click', () => {
      const selectionObject = this.selectorBuilder.toJSON()
      const jsonStr = JSON.stringify(selectionObject, null, 2)

      // Create a blob and download link
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dom-selections.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      this.showStatus('Selections saved!')
    })

    editButton.addEventListener('click', enterEditMode)
    saveButton.addEventListener('click', exitEditMode)
    formatButton.addEventListener('click', () => {
      try {
        editor.value = formatStructure(editor.value)
      } catch (e) {
        this.showStatus('Error: ' + e.message)
      }
    })

    // Initial render
    treeContainer.innerHTML = renderTree(
      this.selectorBuilder.selectorObject || defaultObject,
    )
    this.setupTreeNodeListeners()
    setupAddKeyListeners()

    // Minimize handler
    const minimize = shadow.querySelector('.minimize')
    const handleMinimize = () => {
      const isMinimized = panel.classList.contains('minimized')
      const newState = !isMinimized

      // Update classes and text
      panel.classList.toggle('minimized', newState)
      minimize.textContent = newState ? '+' : '_'

      // Calculate and set width
      const viewportWidth = window.innerWidth
      const newWidth = newState
        ? '40px'
        : `${Math.min(400, viewportWidth * 0.2)}px`

      // Apply transition
      panel.style.width = newWidth

      // Store state in localStorage for persistence
      localStorage.setItem('selector-panel-minimized', newState)
    }

    minimize.addEventListener('click', handleMinimize)

    // Restore previous state
    const wasMinimized =
      localStorage.getItem('selector-panel-minimized') === 'true'
    if (wasMinimized) {
      panel.classList.add('minimized')
      minimize.textContent = '+'
      panel.style.width = '40px'
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (!panel.classList.contains('minimized')) {
        const viewportWidth = window.innerWidth
        panel.style.width = `${Math.min(400, viewportWidth * 0.2)}px`
      }
    })

    // Prevent highlighting the UI elements
    container.addEventListener('mouseover', (e) => {
      e.stopPropagation()
    })

    const setupDeleteListeners = () => {
      // Delete key buttons
      this.shadowRoot.querySelectorAll('.delete-key-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const path = btn.dataset.path.split('.')
          const key = path.pop()
          let current = this.selectorBuilder.selectorObject

          // Navigate to parent object
          for (const part of path) {
            current = current[part]
          }

          // Delete the key
          delete current[key]

          // Re-render tree
          const treeContainer = this.shadowRoot.querySelector('.tree-container')
          treeContainer.innerHTML = renderTree(
            this.selectorBuilder.selectorObject,
          )
          this.setupTreeNodeListeners()
          setupAddKeyListeners()
          setupDeleteListeners()
        })
      })

      // Delete individual items
      this.shadowRoot.querySelectorAll('.delete-item-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const path = btn.dataset.path.split('.')
          const index = parseInt(btn.dataset.index)
          let current = this.selectorBuilder.selectorObject

          // Navigate to array
          for (const part of path) {
            current = current[part]
          }

          // Remove item from array
          if (Array.isArray(current)) {
            const removedItem = current.splice(index, 1)[0]

            // Remove highlight from element if it exists
            if (removedItem.selector) {
              const element = document.querySelector(removedItem.selector)
              if (element) {
                element.classList.remove('leaf-finder-selected')
              }
            }
          }

          // Re-render tree
          const treeContainer = this.shadowRoot.querySelector('.tree-container')
          treeContainer.innerHTML = renderTree(
            this.selectorBuilder.selectorObject,
          )
          this.setupTreeNodeListeners()
          setupAddKeyListeners()
          setupDeleteListeners()
        })
      })
    }

    // Add clear all button to toolbar
    const treeToolbar = shadow.querySelector('.tree-toolbar')
    const clearAllBtn = document.createElement('button')
    clearAllBtn.className = 'clear-all-btn'
    clearAllBtn.textContent = 'Clear All'
    clearAllBtn.addEventListener('click', () => {
      // Clear all arrays in the object
      const clearArrays = (obj) => {
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            obj[key] = []
          } else if (typeof obj[key] === 'object') {
            clearArrays(obj[key])
          }
        }
      }

      clearArrays(this.selectorBuilder.selectorObject)

      // Remove all selected highlights
      document.querySelectorAll('.leaf-finder-selected').forEach((el) => {
        el.classList.remove('leaf-finder-selected')
      })

      // Re-render tree
      const treeContainer = this.shadowRoot.querySelector('.tree-container')
      treeContainer.innerHTML = renderTree(this.selectorBuilder.selectorObject)
      this.setupTreeNodeListeners()
      setupAddKeyListeners()
      setupDeleteListeners()

      this.showStatus('All selections cleared')
    })
    treeToolbar.appendChild(clearAllBtn)

    // Call setupDeleteListeners in initial render and after updates
    setupDeleteListeners()
  }

  setupTreeNodeListeners() {
    const nodes = this.shadowRoot.querySelectorAll('.tree-node-content')
    nodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation()
        const treeNode = node.closest('.tree-node')
        const path = treeNode.dataset.path.split('.')
        const key = path.pop()

        // Get the value at this path
        const value = path.reduce(
          (obj, key) => obj[key],
          this.selectorBuilder.selectorObject,
        )[key]

        // Initialize as array if not already
        if (!Array.isArray(value)) {
          path.reduce(
            (obj, key) => obj[key],
            this.selectorBuilder.selectorObject,
          )[key] = []
        }

        // Update selection state
        this.shadowRoot
          .querySelectorAll('.tree-node')
          .forEach((n) => n.classList.remove('selected'))
        treeNode.classList.add('selected')

        this.selectorBuilder.currentPath = path
        this.selectorBuilder.currentKey = key
        this.selectorBuilder.currentObjectName = path[0]

        this.showStatus(`Ready to select items for: ${path.join('.')}.${key}`)

        // Clear previous selections display
        const selectionsDiv = this.shadowRoot.querySelector('.selections')
        selectionsDiv.innerHTML = ''

        // Show existing selections
        const currentValue = this.selectorBuilder.getValueAtPath() || []
        currentValue.forEach((item) => {
          this.updateSelections(item.text)
        })
      })
    })
  }

  showStatus(message) {
    const statusDiv = this.shadowRoot.querySelector('.status')
    statusDiv.textContent = message
    setTimeout(() => {
      statusDiv.textContent = ''
    }, 3000)
  }

  updateSelections(text) {
    const selectionsDiv = this.shadowRoot.querySelector('.selections')
    const item = document.createElement('div')
    item.className = 'selection-item'
    item.textContent = `• ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`
    selectionsDiv.appendChild(item)
  }
}

// Usage
const finder = new DOMTextFinder()
const results = finder.findElements()
finder.highlight()

// Export the finder instance to make it accessible
window.domFinder = finder

// Log detailed stats
console.group('🍃 Leaf Node Finder Results')

console.log(
  '%c🎯 Summary Statistics',
  'font-weight: bold; font-size: 14px; color: #2196F3',
)
console.table({
  'Total Leaf Nodes': results.leafNodes.length,
  'Unique Selectors': results.selectors.size,
  'Failed Attempts': results.failed.length,
  'Success Rate': `${((results.leafNodes.length / (results.leafNodes.length + results.failed.length)) * 100).toFixed(1)}%`,
  'Unique Deduped Texts': results.dedupedMap.size,
})

if (results.leafNodes.length > 0) {
  console.log(
    '%c🌿 Found Leaf Nodes',
    'font-weight: bold; font-size: 14px; color: #4CAF50',
  )
  console.table(
    results.leafNodes.map(({ text, selector, index }) => ({
      text: text.length > 30 ? text.substring(0, 30) + '...' : text,
      selector,
      index,
    })),
  )
}

if (results.failed.length > 0) {
  console.log(
    '%c❌ Failed Elements',
    'font-weight: bold; font-size: 14px; color: #F44336',
  )
  console.table(results.failed)
}

// Performance metrics
const avgSelectorLength =
  [...results.selectors.values()].reduce(
    (acc, { selector }) => acc + selector.length,
    0,
  ) / results.selectors.size

console.log(
  '%c📈 Performance Metrics',
  'font-weight: bold; font-size: 14px; color: #9C27B0',
)
console.table({
  'Average Selector Length': avgSelectorLength.toFixed(1),
  'Most Common Element Type': getMostCommonTag(results.leafNodes),
  'Memory Usage': `${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
})

console.groupEnd()

// Helper function to get most common tag
function getMostCommonTag(elements) {
  const tagCounts = elements.reduce((acc, { element }) => {
    const tag = element.tagName.toLowerCase()
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {})

  return (
    Object.entries(tagCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
  )
}
