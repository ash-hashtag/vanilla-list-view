export interface ListViewOptions {
    /** this function gets executed for every element that is going to be inserted in list view */
    itemBuilder: (index: number) => HTMLElement
    /** 
     * total length of the list,
     * this is to make sure itemBuilder doesn't go out of range,
     * can be modified later with ListView.updateItemCount(newItemCount)
     */
    itemCount: number,
    /** number of elements that are going to be on DOM
     * ofcourse should be less than itemCount and greater than 0,
     * try to take a value that fills up atleast twice the viewport for better results
     */
    numOfItemsToRender: number,
    /** 
     * number of elements that are going it to be added and removed at a time, keeping the same numOfItemsToRender
     * try to use as little fraction of numOfItemsToRender as possible, anything < numOfItemsToRender / 4 is better
     * for example, if numOfItemsCanBeModifiedAtOnce = 5, then when the ListView triggers for update,
     * it will remove 5 elements and 5 elements back
     */
    numOfItemsCanBeModifiedAtOnce: number,
    /**
     * use values less than < numOfItemsCanBeModifiedAtOnce for better results
     * when the ListView hits this element index in it's virtual scroll, then it will trigger update, that is change its offset
     * for example, if triggerIndexToUpdateElements = 5 and numOfItemsToRender = 20,
     * on every 5th index of its range element becomes visible, it will try to render the top elements,
     * and on every 15th index element, it will try to render the bottom elements
     * that is when it hits 15th element, it will add 5 more elements(16, 17, 18, 19, 20) and remove 5 elements(0, 1, 2, 3, 4)
     * same goes for 30th, 45th, 60th, element.
     */
    triggerIndexToUpdateElements: number,
    /**
     * if the cacheLimit is anything other than -1, ListView will cache upto 'cacheLimit' elements, and avoids unnecessary itemBuilder calls.
     * pass -1 to cacheLimit for no caching,
     * you can also try your own caching for unnecessary Element Constructions, by making itemBuilder to return your own cached elements.
     * use ListView.clearCache() to clear cache manually
     */
    cacheLimit: number,

    /**
     * height, this is going to be ListView container height, use a css string, as it is going to be in style.height property
     */
    height: string
}

export class ListView extends HTMLElement {
    private readonly itemBuilder: (index: number) => HTMLElement
    private itemCount: number
    private readonly itemExtent: number
    private readonly numOfItemsCanBeModifiedAtOnce: number
    private readonly threshold: number
    private readonly cacheLimit: number

    private cachedElements: Map<number, HTMLElement>

    static readonly indexAttribute = "list-index"

    constructor(options: ListViewOptions) {
        super()

        this.style.height = options.height

        if (options.cacheLimit == -1) {
            this.itemBuilder = (idx) => {
                const elem = options.itemBuilder(idx)
                elem.setAttribute(ListView.indexAttribute, `${idx}`)
                return elem
            }
        } else {
            this.itemBuilder = (idx) => {
                let elem = this.cachedElements.get(idx)
                if (elem) {
                    return elem
                }
                elem = options.itemBuilder(idx)
                elem.setAttribute(ListView.indexAttribute, `${idx}`)
                this.updateCache(idx, elem)
                return elem
            }
        }
        this.itemCount = options.itemCount
        this.itemExtent = options.numOfItemsToRender
        this.threshold = options.triggerIndexToUpdateElements
        this.numOfItemsCanBeModifiedAtOnce = options.numOfItemsCanBeModifiedAtOnce
        this.cacheLimit = options.cacheLimit
        this.cachedElements = new Map()

        this.render()

        this.addEventListener("scroll", this.onScroll)

        this.lastScrollOffset = this.scrollTop
    }

    private render() {
        for (var i = 0; i < this.itemExtent; i++) {
            this.appendChild(this.itemBuilder(i))
        }
    }

    private lastScrollOffset = 0

    private onScroll() {

        const children = this.children
        const scrollTop = this.scrollTop

        if (children.length > this.threshold) {
            if (scrollTop < this.lastScrollOffset) {

                if (this.firstElementChild!.getAttribute(ListView.indexAttribute) == "0") {
                    return
                }

                const upperThresholdElement = children[this.threshold] as HTMLElement
                const rect = upperThresholdElement.getBoundingClientRect()
                const containerRect = this.getBoundingClientRect()

                if (rect.y > containerRect.top) {
                    console.log("adding elements on top")
                    this.addTopElements()
                }

            } else if (scrollTop > this.lastScrollOffset) {
                const lowerThresholdElement = children[children.length - this.threshold] as HTMLElement
                const rect = lowerThresholdElement.getBoundingClientRect()
                const containerRect = this.getBoundingClientRect()

                if (rect.y < containerRect.bottom) {
                    console.log("adding elements on bottom")
                    this.addBottomElements()
                }
            }
        }

        this.lastScrollOffset = scrollTop
    }

    private addBottomElements() {
        const lastIndex = Number(this.lastElementChild!.getAttribute(ListView.indexAttribute)) + 1
        for (var i = 0; i < this.numOfItemsCanBeModifiedAtOnce; i++) {
            if (i + lastIndex >= this.itemCount) {
                break;
            }
            const elem = this.itemBuilder(i + lastIndex)
            this.removeChild(this.firstElementChild!)
            this.append(elem)
        }
    }

    private addTopElements() {
        const firstIndex = Number(this.firstElementChild!.getAttribute(ListView.indexAttribute)) - 1

        for (var i = 0; i < this.numOfItemsCanBeModifiedAtOnce; i++) {
            if (firstIndex - i < 0) {
                break;
            }
            const elem = this.itemBuilder(firstIndex - i)
            this.insertAdjacentElement("afterbegin", elem)
            this.removeChild(this.lastElementChild!)
        }
    }

    /** update item count, itemCount must be greater than 0 */
    updateItemCount(itemCount: number, clearCache = false) {
        if (this.itemCount > itemCount) {
            let lastIndex = Number(this.lastElementChild!.getAttribute(ListView.indexAttribute))
            if (lastIndex > itemCount) {
                let firstIndex = Number(this.firstElementChild!.getAttribute(ListView.indexAttribute))
                if (firstIndex > itemCount) {
                    let children: HTMLElement[] = []
                    for (var i = 0; i < this.itemExtent; i++) {
                        let index = itemCount - this.itemExtent + i
                        if (index < 0) {
                            break
                        }
                        children.push(this.itemBuilder(index))
                    }
                    this.replaceChildren(...children)
                } else {
                    while (true) {
                        lastIndex = Number(this.lastElementChild!.getAttribute(ListView.indexAttribute))
                        if (lastIndex < itemCount) { break }

                        this.removeChild(this.lastElementChild!)

                        firstIndex = Number(this.firstElementChild!.getAttribute(ListView.indexAttribute))
                        if (firstIndex > 0) {
                            this.insertAdjacentElement("afterbegin", this.itemBuilder(firstIndex - 1))
                        }
                    }

                }
            }
        }
        this.itemCount = itemCount
        if (clearCache) { this.cachedElements.clear() }
    }

    clearCache() {
        this.cachedElements.clear()
    }

    private updateCache(index: number, element: HTMLElement) {
        if (this.cachedElements.size > this.cacheLimit) {
            const firstElementIndex = Number(this.firstElementChild!.getAttribute(ListView.indexAttribute))
            const lastElementIndex = Number(this.lastElementChild!.getAttribute(ListView.indexAttribute))
            const middleElementIndex = Math.floor((lastElementIndex - firstElementIndex) / 2)
            const keys = Array.from(this.cachedElements.keys()).sort()
            const firstCachedIndex = keys[0]
            const lastCachedIndex = keys[keys.length - 1]
            if (Math.abs(middleElementIndex - firstCachedIndex) > Math.abs(middleElementIndex - lastCachedIndex)) {
                this.cachedElements.delete(firstCachedIndex)
            } else {
                this.cachedElements.delete(lastCachedIndex)
            }
        }

        this.cachedElements.set(index, element)
    }
}

const _main = () => {
    const style = document.createElement("style")
    const css = 
    `
    list-view {
        display: block;
        overflow-y: scroll;
      }

      list-view::-webkit-scrollbar {
        display: none;
      }
    `

    style.textContent = css

    document.head.appendChild(style)
    customElements.define("list-view", ListView)
}

_main()

