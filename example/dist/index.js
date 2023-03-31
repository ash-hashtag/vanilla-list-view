"use strict";
(() => {
  // ../src/index.ts
  var _ListView = class extends HTMLElement {
    constructor(options) {
      super();
      this.lastScrollOffset = 0;
      this.style.height = options.height;
      if (options.cacheLimit == -1) {
        this.itemBuilder = (idx) => {
          const elem = options.itemBuilder(idx);
          elem.setAttribute(_ListView.indexAttribute, `${idx}`);
          return elem;
        };
      } else {
        this.itemBuilder = (idx) => {
          let elem = this.cachedElements.get(idx);
          if (elem) {
            return elem;
          }
          elem = options.itemBuilder(idx);
          elem.setAttribute(_ListView.indexAttribute, `${idx}`);
          this.updateCache(idx, elem);
          return elem;
        };
      }
      this.itemCount = options.itemCount;
      this.itemExtent = options.numOfItemsToRender;
      this.threshold = options.triggerIndexToUpdateElements;
      this.numOfItemsCanBeModifiedAtOnce = options.numOfItemsCanBeModifiedAtOnce;
      this.cacheLimit = options.cacheLimit;
      this.cachedElements = /* @__PURE__ */ new Map();
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
          if (this.firstElementChild.getAttribute(_ListView.indexAttribute) == "0") {
            return;
          }
          const upperThresholdElement = children[this.threshold];
          const rect = upperThresholdElement.getBoundingClientRect();
          const containerRect = this.getBoundingClientRect();
          if (rect.y > containerRect.top) {
            console.log("adding elements on top");
            this.addTopElements();
          }
        } else if (scrollTop > this.lastScrollOffset) {
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
      const lastIndex = Number(this.lastElementChild.getAttribute(_ListView.indexAttribute)) + 1;
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
      const firstIndex = Number(this.firstElementChild.getAttribute(_ListView.indexAttribute)) - 1;
      for (var i = 0; i < this.numOfItemsCanBeModifiedAtOnce; i++) {
        if (firstIndex - i < 0) {
          break;
        }
        const elem = this.itemBuilder(firstIndex - i);
        this.insertAdjacentElement("afterbegin", elem);
        this.removeChild(this.lastElementChild);
      }
    }
    /** update item count, itemCount must be greater than 0 */
    updateItemCount(itemCount2, clearCache = false) {
      if (this.itemCount > itemCount2) {
        let lastIndex = Number(this.lastElementChild.getAttribute(_ListView.indexAttribute));
        if (lastIndex > itemCount2) {
          let firstIndex = Number(this.firstElementChild.getAttribute(_ListView.indexAttribute));
          if (firstIndex > itemCount2) {
            let children = [];
            for (var i = 0; i < this.itemExtent; i++) {
              let index = itemCount2 - this.itemExtent + i;
              if (index < 0) {
                break;
              }
              children.push(this.itemBuilder(index));
            }
            this.replaceChildren(...children);
          } else {
            while (true) {
              lastIndex = Number(this.lastElementChild.getAttribute(_ListView.indexAttribute));
              if (lastIndex < itemCount2) {
                break;
              }
              this.removeChild(this.lastElementChild);
              firstIndex = Number(this.firstElementChild.getAttribute(_ListView.indexAttribute));
              if (firstIndex > 0) {
                this.insertAdjacentElement("afterbegin", this.itemBuilder(firstIndex - 1));
              }
            }
          }
        }
      } else {
        if (this.itemCount < this.itemExtent) {
          for (var i = this.itemCount; i < Math.min(itemCount2, this.itemExtent); i++) {
            this.appendChild(this.itemBuilder(i));
          }
        }
      }
      this.itemCount = itemCount2;
      if (clearCache) {
        this.cachedElements.clear();
      }
    }
    clearCache() {
      this.cachedElements.clear();
    }
    updateCache(index, element) {
      if (this.cachedElements.size > this.cacheLimit) {
        const firstElementIndex = Number(this.firstElementChild.getAttribute(_ListView.indexAttribute));
        const lastElementIndex = Number(this.lastElementChild.getAttribute(_ListView.indexAttribute));
        const middleElementIndex = Math.floor((lastElementIndex - firstElementIndex) / 2);
        const keys = Array.from(this.cachedElements.keys()).sort();
        const firstCachedIndex = keys[0];
        const lastCachedIndex = keys[keys.length - 1];
        if (Math.abs(middleElementIndex - firstCachedIndex) > Math.abs(middleElementIndex - lastCachedIndex)) {
          this.cachedElements.delete(firstCachedIndex);
        } else {
          this.cachedElements.delete(lastCachedIndex);
        }
      }
      this.cachedElements.set(index, element);
    }
  };
  var ListView = _ListView;
  ListView.indexAttribute = "list-index";
  var _main = () => {
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

  // src/index.ts
  var colors = ["blue", "yellow", "red", "purple", "green", "orange"];
  var itemCount = 11;
  var listView = new ListView({
    itemBuilder: (idx) => {
      const div = document.createElement("div");
      div.innerText = `Hello ${idx} ${Math.random()}`;
      div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      const img = document.createElement("img");
      const dimensions = {
        width: Math.floor(Math.random() * 100 + 100),
        height: Math.floor(Math.random() * 100 + 100)
      };
      img.src = `https://picsum.photos/${dimensions.width}/${dimensions.height}`;
      div.appendChild(img);
      return div;
    },
    itemCount,
    numOfItemsCanBeModifiedAtOnce: 5,
    numOfItemsToRender: 20,
    cacheLimit: 100,
    triggerIndexToUpdateElements: 5,
    height: "80vh"
  });
  var itemCountElem = document.createElement("div");
  itemCountElem.textContent = itemCount.toString();
  var incrementButton = document.createElement("button");
  incrementButton.textContent = "increment + 10";
  incrementButton.addEventListener("click", () => {
    itemCount += 10;
    itemCountElem.textContent = itemCount.toString();
    listView.updateItemCount(itemCount);
  });
  var decrementButton = document.createElement("button");
  decrementButton.textContent = "decrement - 10";
  decrementButton.addEventListener("click", () => {
    itemCount -= 10;
    listView.updateItemCount(itemCount);
    itemCountElem.textContent = itemCount.toString();
  });
  document.body.append(incrementButton, itemCountElem, decrementButton, listView);
})();
