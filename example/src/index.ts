// import { ListView } from "vanilla-list-view"
import { ListView } from "../../src/index";

const colors = ["blue", "yellow", "red", "purple", "green", "orange"]

let itemCount = 11

const listView = new ListView({
  itemBuilder: (idx) => {
    const div = document.createElement("div")
    div.innerText = `Hello ${idx} ${Math.random()}`
    div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    
    const img = document.createElement("img")
    const dimensions = {
      width: Math.floor(Math.random()*100 + 100),
      height: Math.floor(Math.random() * 100 + 100)
    }
    
    // div.style.height = `${100 + (Math.random() * 400)}px`
    img.src = `https://picsum.photos/${dimensions.width}/${dimensions.height}`

    div.appendChild(img)

    return div
  },
  itemCount: itemCount,
  numOfItemsCanBeModifiedAtOnce: 5,
  numOfItemsToRender: 20,
  cacheLimit: 100,
  triggerIndexToUpdateElements: 5,
  height: "80vh"
})


const itemCountElem = document.createElement("div")
itemCountElem.textContent = itemCount.toString()


const incrementButton = document.createElement("button")

incrementButton.textContent = "increment + 10"

incrementButton.addEventListener("click", () => {
  itemCount += 10
  itemCountElem.textContent = itemCount.toString()
  listView.updateItemCount(itemCount)
})
const decrementButton = document.createElement("button")

decrementButton.textContent = "decrement - 10"

decrementButton.addEventListener("click", () => {
  itemCount -= 10
  listView.updateItemCount(itemCount)
  itemCountElem.textContent = itemCount.toString()
})

document.body.append(incrementButton, itemCountElem, decrementButton, listView)

