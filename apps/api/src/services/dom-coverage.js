class DOMTextFinder {
  constructor(config = {}) {
    this.config = {
      minTextLength: 2,
      maxAncestors: 4,
      ...config,
    }

    this.results = {
      elements: [],
      selectors: new Map(),
      failed: [],
    }
  }

  findElements() {
    // First, find all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
    )

    const textNodes = new Map() // text -> [nodes]
    let node

    while ((node = walker.nextNode())) {
      const text = node.textContent.trim()
      if (text.length >= this.config.minTextLength) {
        if (!textNodes.has(text)) {
          textNodes.set(text, [])
        }
        textNodes.get(text).push(node)
      }
    }

    // For each unique text, find the most specific container
    textNodes.forEach((nodes, text) => {
      nodes.forEach((textNode) => {
        const bestElement = this.findBestContainer(textNode)
        if (bestElement) {
          const selector = this.generateSelector(bestElement)
          if (selector) {
            this.results.elements.push({
              element: bestElement,
              text,
              selector,
            })
            this.results.selectors.set(text, selector)
          }
        }
      })
    })

    return this.results
  }

  findBestContainer(textNode) {
    let current = textNode.parentElement
    let best = null
    let bestScore = -1

    while (current && current !== document.body) {
      const score = this.evaluateElement(current, textNode)
      if (score > bestScore) {
        bestScore = score
        best = current
      }
      current = current.parentElement
    }

    return best
  }

  evaluateElement(element, textNode) {
    let score = 0

    // Prefer semantic elements
    if (/^H[1-6]$|^(P|BUTTON|A|LABEL|LI|TD|TH|DT|DD)$/.test(element.tagName)) {
      score += 50
    }

    // Prefer elements with fewer children
    score -= element.children.length * 2

    // Prefer elements where our text is a larger percentage of their content
    const elementText = element.textContent.trim()
    const textNodeContent = textNode.textContent.trim()
    const textRatio = textNodeContent.length / elementText.length
    score += textRatio * 30

    // Prefer elements with meaningful attributes
    if (element.id) score += 10
    if (element.className) score += 5
    if (element.getAttribute('role')) score += 5
    if (element.getAttribute('aria-label')) score += 5

    // Penalize very generic containers
    if (/^(DIV|SPAN)$/.test(element.tagName)) {
      score -= 10
    }

    return score
  }

  buildSelectorFromPath(elements) {
    return elements
      .map((el) => {
        const tag = el.tagName.toLowerCase()
        const classes = el.className
          ? el.className.split(/\\s+/).filter(Boolean)
          : []

        if (classes.length === 0) return tag

        // Try combinations of classes from the end, moving inward
        const classCount = classes.length
        for (let size = 1; size <= Math.min(3, classCount); size++) {
          // Try combinations starting from the end
          for (let startIdx = classCount - size; startIdx >= 0; startIdx--) {
            const classSlice = classes.slice(startIdx, startIdx + size)
            // Each class needs its own period
            const selector =
              tag + '.' + classSlice.map((c) => this.escapeCSS(c)).join('.')

            if (this.isUniqueSelector(selector, el)) {
              return selector
            }
          }

          // If end-first didn't work, try other combinations of this size
          const combinations = this.getCombinations(classes, size)
          for (const combo of combinations) {
            // Each class needs its own period
            const selector =
              tag + '.' + combo.map((c) => this.escapeCSS(c)).join('.')
            if (this.isUniqueSelector(selector, el)) {
              return selector
            }
          }
        }

        // If no smaller combinations work, try semantic classes
        const semanticClasses = classes.filter((c) =>
          /heading|title|content|text|label|button|link|nav|main|header|footer|section/i.test(
            c,
          ),
        )

        if (semanticClasses.length > 0) {
          // Each semantic class needs its own period
          const selector =
            tag + '.' + semanticClasses.map((c) => this.escapeCSS(c)).join('.')
          if (this.isUniqueSelector(selector, el)) {
            return selector
          }
        }

        // Fallback to first and last class if nothing else worked
        // Make sure each class has its own period
        return (
          tag +
          '.' +
          this.escapeCSS(classes[0]) +
          (classes.length > 1
            ? '.' + this.escapeCSS(classes[classes.length - 1])
            : '')
        )
      })
      .join(' > ')
  }

  getCombinations(arr, size) {
    if (size > arr.length) return []
    if (size === 1) return arr.map((x) => [x])

    return arr.reduce((acc, item, i) => {
      const smaller = this.getCombinations(arr.slice(i + 1), size - 1)
      return acc.concat(smaller.map((x) => [item].concat(x)))
    }, [])
  }

  generateSelector(element) {
    try {
      // Try ID first
      if (element.id) {
        const selector = '#' + this.escapeCSS(element.id)
        if (this.isUniqueSelector(selector, element)) {
          return selector
        }
      }

      // Get the path to the element
      const path = []
      let current = element
      while (current && current !== document.body) {
        path.unshift(current)
        current = current.parentElement
      }

      // Try just the element first
      const elementSelector = this.buildSelectorFromPath([element])
      if (elementSelector && this.isUniqueSelector(elementSelector, element)) {
        return elementSelector
      }

      // Try with minimal parent context
      for (let i = path.length - 2; i >= 0; i--) {
        const pathSlice = path.slice(i)
        const selector = this.buildSelectorFromPath(pathSlice)
        if (selector && this.isUniqueSelector(selector, element)) {
          return selector
        }
      }

      // If we still need more context, try with parent class context
      if (element.parentElement) {
        const parentClasses = element.parentElement.className
          ? element.parentElement.className.split(/\\s+/).filter(Boolean)
          : []

        for (const cls of parentClasses) {
          // Make sure parent class has its period
          const contextSelector =
            '.' + this.escapeCSS(cls) + ' ' + elementSelector
          if (this.isUniqueSelector(contextSelector, element)) {
            return contextSelector
          }
        }
      }

      return null
    } catch (e) {
      this.results.failed.push({
        element,
        error: e.message,
      })
      return null
    }
  }

  escapeCSS(str) {
    if (!str || typeof str !== 'string') return ''
    return str
      .replace(/[\[\].#$>+*=|^~:()'"!\/]/g, '\\\\$&')
      .replace(/^(\d|--|[\u00A0-\u9999])/, '\\\\$1')
  }

  getElementSelector(element) {
    const tag = element.tagName.toLowerCase()
    const classes = element.className
      ? '.' +
        element.className
          .split(/\\s+/)
          .map((c) => this.escapeCSS(c))
          .join('.')
      : ''
    return tag + classes
  }

  getNthChildSelector(element) {
    const parent = element.parentElement
    if (!parent) return null

    const index = Array.from(parent.children).indexOf(element) + 1
    const selector = `${element.tagName.toLowerCase()}:nth-child(${index})`

    if (parent === document.body) {
      return selector
    }

    const parentSelector = this.generateSelector(parent)
    return parentSelector ? `${parentSelector} > ${selector}` : selector
  }

  isUniqueSelector(selector, element) {
    try {
      // First check if selector is valid
      document.querySelector(selector) // This will throw if selector is invalid

      // Then check uniqueness
      const matches = document.querySelectorAll(selector)
      if (matches.length !== 1) return false

      // Check if it matches our target element
      return matches[0] === element
    } catch (e) {
      return false
    }
  }

  highlight() {
    // Remove existing highlights
    document.querySelectorAll('.text-finder-highlight').forEach((el) => {
      el.classList.remove('text-finder-highlight')
      if (el._clickHandler) {
        el.removeEventListener('click', el._clickHandler)
      }
    })

    // Add styles if not present
    if (!document.getElementById('text-finder-styles')) {
      const style = document.createElement('style')
      style.id = 'text-finder-styles'
      style.textContent = `
        .text-finder-highlight {
          outline: 2px solid #FF4444 !important;
          background-color: rgba(255, 68, 68, 0.1) !important;
          cursor: pointer !important;
          transition: all 0.2s ease-in-out !important;
        }
        .text-finder-highlight:hover {
          outline: 3px solid #FF0000 !important;
          background-color: rgba(255, 68, 68, 0.2) !important;
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
      `
      document.head.appendChild(style)
    }

    // Highlight elements and add click handlers
    this.results.elements.forEach(({ element, text, selector }) => {
      try {
        element.classList.add('text-finder-highlight')

        const clickHandler = (e) => {
          e.preventDefault()
          e.stopPropagation()

          const selectorString = `document.querySelector('${selector}')`
          navigator.clipboard.writeText(selectorString).then(() => {
            const rect = element.getBoundingClientRect()
            const notification = document.createElement('div')
            notification.className = 'selector-copied'
            notification.textContent = 'Selector copied!'
            notification.style.left = `${rect.left}px`
            notification.style.top = `${rect.top - 30}px`
            document.body.appendChild(notification)
            setTimeout(() => notification.remove(), 1000)
          })
        }

        element._clickHandler = clickHandler
        element.addEventListener('click', clickHandler)

        element.title = [
          `Text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
          `Selector: ${selector}`,
          'Click to copy selector',
        ].join('\\n')
      } catch (e) {
        console.warn('Failed to highlight:', e)
      }
    })
  }
}

// Usage
const finder = new DOMTextFinder()
const results = finder.findElements()
finder.highlight()

// Log coverage stats
const stats = {
  totalTextNodes: results.elements.length,
  uniqueSelectors: results.selectors.size,
  failed: results.failed.length,
}

console.log('Coverage Stats:', stats)

//
