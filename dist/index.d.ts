export interface ListViewOptions {
    itemBuilder: (index: number) => HTMLElement;
    itemCount: number;
    numOfItemsToRender: number;
    numOfItemsCanBeModifiedAtOnce: number;
    triggerIndexToUpdateElements: number;
    cacheLimit: number;
    height: string;
}
export declare class ListView extends HTMLElement {
    private readonly itemBuilder;
    private itemCount;
    private readonly itemExtent;
    private readonly numOfItemsCanBeModifiedAtOnce;
    private readonly threshold;
    private readonly cacheLimit;
    private cachedElements;
    static readonly indexAttribute = "list-index";
    constructor(options: ListViewOptions);
    private render;
    private lastScrollOffset;
    private onScroll;
    private addBottomElements;
    private addTopElements;
    updateItemCount(itemCount: number, clearCache?: boolean): void;
    clearCache(): void;
    private updateCache;
}
