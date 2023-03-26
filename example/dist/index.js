"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/vanilla-list-view/dist/index.js
  var require_dist = __commonJS({
    "node_modules/vanilla-list-view/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ListView = void 0;
      var ListView2 = class extends HTMLElement {
        constructor(options) {
          super();
          this.lastScrollOffset = 0;
          this.style.height = options.height;
          if (options.cacheLimit == -1) {
            this.itemBuilder = (idx) => {
              const elem = options.itemBuilder(idx);
              elem.setAttribute(ListView2.indexAttribute, `${idx}`);
              return elem;
            };
          } else {
            this.itemBuilder = (idx) => {
              let elem = this.cachedElements.get(idx);
              if (elem) {
                return elem;
              }
              elem = options.itemBuilder(idx);
              elem.setAttribute(ListView2.indexAttribute, `${idx}`);
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
          for (var i = 0; i < this.itemExtent; i++) {
            this.appendChild(this.itemBuilder(i));
          }
        }
        onScroll() {
          const children = this.children;
          const scrollTop = this.scrollTop;
          if (children.length > this.threshold) {
            if (scrollTop < this.lastScrollOffset) {
              if (this.firstElementChild.getAttribute(ListView2.indexAttribute) == "0") {
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
          const lastIndex = Number(this.lastElementChild.getAttribute(ListView2.indexAttribute)) + 1;
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
          const firstIndex = Number(this.firstElementChild.getAttribute(ListView2.indexAttribute)) - 1;
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
            let lastIndex = Number(this.lastElementChild.getAttribute(ListView2.indexAttribute));
            if (lastIndex > itemCount) {
              let firstIndex = Number(this.firstElementChild.getAttribute(ListView2.indexAttribute));
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
              } else {
                while (true) {
                  lastIndex = Number(this.lastElementChild.getAttribute(ListView2.indexAttribute));
                  if (lastIndex < itemCount) {
                    break;
                  }
                  this.removeChild(this.lastElementChild);
                  firstIndex = Number(this.firstElementChild.getAttribute(ListView2.indexAttribute));
                  if (firstIndex > 0) {
                    this.insertAdjacentElement("afterbegin", this.itemBuilder(firstIndex - 1));
                  }
                }
              }
            }
          }
          this.itemCount = itemCount;
          if (clearCache) {
            this.cachedElements.clear();
          }
        }
        clearCache() {
          this.cachedElements.clear();
        }
        updateCache(index, element) {
          if (this.cachedElements.size > this.cacheLimit) {
            const firstElementIndex = Number(this.firstElementChild.getAttribute(ListView2.indexAttribute));
            const lastElementIndex = Number(this.lastElementChild.getAttribute(ListView2.indexAttribute));
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
      ListView2.indexAttribute = "list-index";
      exports.ListView = ListView2;
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
        customElements.define("list-view", ListView2);
      };
      _main();
    }
  });

  // src/index.ts
  var import_vanilla_list_view = __toESM(require_dist(), 1);
  var colors = ["blue", "yellow", "red", "purple", "green", "orange"];
  var listView = new import_vanilla_list_view.ListView({
    itemBuilder: (idx) => {
      const div = document.createElement("div");
      div.innerText = `Hello ${idx} ${Math.random()}`;
      div.style.height = `${100 + Math.random() * 400}px`;
      div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      return div;
    },
    itemCount: 100,
    numOfItemsCanBeModifiedAtOnce: 5,
    numOfItemsToRender: 20,
    cacheLimit: 50,
    triggerIndexToUpdateElements: 5,
    height: "50vh"
  });
  document.body.appendChild(listView);
})();
