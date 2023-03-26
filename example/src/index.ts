import { ListView } from "vanilla-list-view"

const colors = ["blue", "yellow", "red", "purple", "green", "orange"]

const listView = new ListView({
    itemBuilder: (idx) => {
        const div = document.createElement("div")
        div.innerText = `Hello ${idx} ${Math.random()}`
        div.style.height = `${100 + (Math.random() * 400) }px`
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

        return div
    },
    itemCount: 100,
    numOfItemsCanBeModifiedAtOnce: 5,
    numOfItemsToRender: 20,
    cacheLimit: 50,
    triggerIndexToUpdateElements: 5,
    height: "50vh"
})

document.body.appendChild(listView)