"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListView = void 0;
class ListView extends HTMLElement {
    constructor(options) {
        super();
        this.lastScrollOffset = 0;
        this.style.height = options.height;
        if (options.cacheLimit == -1) {
            this.itemBuilder = (idx) => {
                const elem = options.itemBuilder(idx);
                elem.setAttribute(ListView.indexAttribute, `${idx}`);
                return elem;
            };
        }
        else {
            this.itemBuilder = (idx) => {
                let elem = this.cachedElements.get(idx);
                if (elem) {
                    return elem;
                }
                elem = options.itemBuilder(idx);
                elem.setAttribute(ListView.indexAttribute, `${idx}`);
                this.updateCache(idx, elem);
                return elem;
            };
        }
        this.itemCount = options.itemCount;
        this.itemExtent = options.numOfItemsToRender;
        this.threshold = options.triggerIndexToUpdateElements;
        this.numOfItemsCanBeModifiedAtOnce = options.numOfItemsCanBeModifiedAtOnce;
        this.cacheLimit = options.cacheLimit;
        this.cachedElements = new Map();
        this.render();
        this.addEventListener("scroll", this.onScroll);
        this.lastScrollOffset = this.scrollTop;
    }
    render() {
        for (var i = 0; i < this.itemExtent && i < this.itemCount; i++) {
            this.appendChild(this.itemBuilder(i));
        }
    }
    onScroll() {
        if (this.itemCount < this.itemExtent) {
            return;
        }
        const children = this.children;
        const scrollTop = this.scrollTop;
        if (children.length > this.threshold) {
            if (scrollTop < this.lastScrollOffset) {
                if (this.firstElementChild.getAttribute(ListView.indexAttribute) == "0") {
                    return;
                }
                const upperThresholdElement = children[this.threshold];
                const rect = upperThresholdElement.getBoundingClientRect();
                const containerRect = this.getBoundingClientRect();
                if (rect.y > containerRect.top) {
                    console.log("adding elements on top");
                    this.addTopElements();
                }
            }
            else if (scrollTop > this.lastScrollOffset) {
                const lowerThresholdElement = children[children.length - this.threshold];
                const rect = lowerThresholdElement.getBoundingClientRect();
                const containerRect = this.getBoundingClientRect();
                if (rect.y < containerRect.bottom) {
                    console.log("adding elements on bottom");
                    this.addBottomElements();
                }
            }
        }
        this.lastScrollOffset = scrollTop;
    }
    addBottomElements() {
        const lastIndex = Number(this.lastElementChild.getAttribute(ListView.indexAttribute)) + 1;
        for (var i = 0; i < this.numOfItemsCanBeModifiedAtOnce; i++) {
            if (i + lastIndex >= this.itemCount) {
                break;
            }
            const elem = this.itemBuilder(i + lastIndex);
            this.removeChild(this.firstElementChild);
            this.append(elem);
        }
    }
    addTopElements() {
        const firstIndex = Number(this.firstElementChild.getAttribute(ListView.indexAttribute)) - 1;
        for (var i = 0; i < this.numOfItemsCanBeModifiedAtOnce; i++) {
            if (firstIndex - i < 0) {
                break;
            }
            const elem = this.itemBuilder(firstIndex - i);
            this.insertAdjacentElement("afterbegin", elem);
            this.removeChild(this.lastElementChild);
        }
    }
    updateItemCount(itemCount, clearCache = false) {
        if (this.itemCount > itemCount) {
            let lastIndex = Number(this.lastElementChild.getAttribute(ListView.indexAttribute));
            if (lastIndex > itemCount) {
                let firstIndex = Number(this.firstElementChild.getAttribute(ListView.indexAttribute));
                if (firstIndex > itemCount) {
                    let children = [];
                    for (var i = 0; i < this.itemExtent; i++) {
                        let index = itemCount - this.itemExtent + i;
                        if (index < 0) {
                            break;
                        }
                        children.push(this.itemBuilder(index));
                    }
                    this.replaceChildren(...children);
                }
                else {
                    while (true) {
                        lastIndex = Number(this.lastElementChild.getAttribute(ListView.indexAttribute));
                        if (lastIndex < itemCount) {
                            break;
                        }
                        this.removeChild(this.lastElementChild);
                        firstIndex = Number(this.firstElementChild.getAttribute(ListView.indexAttribute));
                        if (firstIndex > 0) {
                            this.insertAdjacentElement("afterbegin", this.itemBuilder(firstIndex - 1));
                        }
                    }
                }
            }
        }
        else {
            if (this.itemCount < this.itemExtent) {
                for (var i = this.itemCount; i < Math.min(itemCount, this.itemExtent); i++) {
                    this.appendChild(this.itemBuilder(i));
                }
            }
        }
        this.itemCount = itemCount;
        if (clearCache) {
            this.clearCache();
        }
    }
    clearCache() {
        this.cachedElements.clear();
    }
    updateCache(index, element) {
        if (this.cachedElements.size > this.cacheLimit) {
            const firstElementIndex = Number(this.firstElementChild.getAttribute(ListView.indexAttribute));
            const lastElementIndex = Number(this.lastElementChild.getAttribute(ListView.indexAttribute));
            const middleElementIndex = Math.floor((lastElementIndex - firstElementIndex) / 2);
            const keys = Array.from(this.cachedElements.keys()).sort();
            const firstCachedIndex = keys[0];
            const lastCachedIndex = keys[keys.length - 1];
            if (Math.abs(middleElementIndex - firstCachedIndex) > Math.abs(middleElementIndex - lastCachedIndex)) {
                this.cachedElements.delete(firstCachedIndex);
            }
            else {
                this.cachedElements.delete(lastCachedIndex);
            }
        }
        this.cachedElements.set(index, element);
    }
    get itemLength() {
        return this.itemCount;
    }
}
ListView.indexAttribute = "list-index";
exports.ListView = ListView;
const _main = () => {
    const style = document.createElement("style");
    const css = `
    list-view {
        display: block;
        overflow-y: scroll;
      }

      list-view::-webkit-scrollbar {
        display: none;
      }
    `;
    style.textContent = css;
    document.head.appendChild(style);
    customElements.define("list-view", ListView);
};
_main();
