import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// load tweets from localStorage  
function loadTweetsFromLocalStorage(){
  const savedTweets = localStorage.getItem("tweetsData")
  if (savedTweets){
    const parsedTweets = JSON.parse(savedTweets)

    // Check if the existing tweetsData array is empty
    if (tweetsData.length === 0) {
      // If it's empty, simply assign the parsed tweets to it
      tweetsData.push(...parsedTweets);
    } else {
      // If it's not empty, merge the parsed tweets with the existing ones
      // ensure no duplicates by checking UUIDs
      parsedTweets.forEach((parsedTweet) => {
        const existingTweetIndex = tweetsData.findIndex((tweet) => tweet.uuid === parsedTweet.uuid);
        if (existingTweetIndex === -1) {
          // Tweet with this UUID doesn't exist in the current data, add it
          tweetsData.push(parsedTweet);
        } else {
          // Tweet with this UUID already exists, update its properties
          Object.assign(tweetsData[existingTweetIndex], parsedTweet);
        }
      });
    }
  }
}

// save tweets to localStorage
function saveTweetsToLocalStorage(){
  localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
}

// Call the loadTweetsFromLocalStorage function to load tweets when the script runs
loadTweetsFromLocalStorage();

document.addEventListener("click", (e) => {
  const likeIcon = e.target.dataset.like
  const retweetIcon = e.target.dataset.retweet
  const replyIcon = e.target.dataset.reply
  const replyTweet = e.target.dataset.tweetid
  const deleteTweet = e.target.dataset.delete


  if (likeIcon){
    handleLikeClick(likeIcon)
  } else if (retweetIcon){
    handleRetweetClick(retweetIcon)
  } else if (replyIcon){
    handleReplyClick(replyIcon)
  } else if (e.target.id === "tweet-btn"){
    handleTweetBtnClick()
  } else if (replyTweet){
    handleReplyToTweet(replyTweet)
  } else if (deleteTweet){
    handleDeleteClick(deleteTweet)
  }
})

function handleLikeClick(tweetId){
  // Find the tweet object with the matching uuid
  const targetTweetObj = tweetsData.filter((tweet) =>
    // test: if uuid of the filtered tweet === uuid held by tweet's icon I clicked, store it.
    tweet.uuid === tweetId)[0]

    // increment / decrement mechanics
    
    // check if the like icon is clicked and isLiked is set to false (default)
    if (targetTweetObj){
      // check if the tweet is already liked (isLiked = true)
      if (targetTweetObj.isLiked){
        // if it's already liked, decrement
        targetTweetObj.likes--
      } else {
        // if it's not liked yet, increment
        targetTweetObj.likes++
      }
      targetTweetObj.isLiked = !targetTweetObj.isLiked
    }
    saveTweetsToLocalStorage()
    render()
}


function handleRetweetClick(tweetId){
  const targetTweetObj = tweetsData.filter((tweet) => tweet.uuid === tweetId)[0]

  targetTweetObj.isRetweeted ? targetTweetObj.retweets-- : targetTweetObj.retweets++;
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted

  saveTweetsToLocalStorage()
  render()
}

function handleReplyClick(replyId){
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
  document.getElementById(`reply-input-${replyId}`).value = "" // Clear the reply input field
}

function handleTweetBtnClick(){
  const tweetInput = document.getElementById("tweet-input")
  if (tweetInput.value){
    // Create a new tweet object and push it to tweetsData
    tweetsData.unshift(
      {
        handle: `@AnnoyingMinion`,
        profilePic: `images/minion.jpg`,
        likes: 0,
        retweets: 0,
        tweetText: tweetInput.value,
        replies: [],
        isLiked: false,
        isRetweeted: false,
        uuid: uuidv4(),
      }
    )
    tweetInput.value = ""
    saveTweetsToLocalStorage()
    render()
  } else {
    window.alert("Tweet something first!")
  }
}

function handleReplyToTweet(tweetId){
  // find the target tweet object by its uuid
  const targetTweetObj = tweetsData.find((tweet) => tweet.uuid === tweetId)

  // check if the target tweet exists and if the reply input has content
  const replyInput = document.getElementById(`reply-input-${tweetId}`)
  // add trim() for good practice to handle potential user input errors
  const replyText = replyInput.value.trim()

    if (targetTweetObj && replyText){
      // create the new object
      const reply = {
        profilePic:"images/minion.jpg",
        handle: " AnnoyingMinion",
        tweetText: replyText,
        uuid: uuidv4()
      }
      // add the reply to the replies array
      targetTweetObj.replies.push(reply)
      replyInput.value = ""

      saveTweetsToLocalStorage()
      render()
    }
}

function handleDeleteClick(tweetId){
  // find the index of target tweet by its uuid
  const tweetIndex = tweetsData.findIndex(tweet => tweet.uuid === tweetId)
  // remove the tweet from the tweetsData array
  tweetsData.splice(tweetIndex, 1)
  // Save the updated tweets to local storage and render
  saveTweetsToLocalStorage()
  render()
}

function getFeedHtml(){
  let feedHtml = ""
  tweetsData.forEach((tweet) => {

    let likeIconClass = tweet.isLiked ? "fa-solid fa-heart liked" : "fa-solid fa-heart"
    let retweetIconClass = tweet.isRetweeted ? "fa-solid fa-retweet retweeted" : "fa-solid fa-retweet"
    
    // variable to store the value of the replies boiler template
    let repliesHtml = ""

    if (tweet.replies.length > 0){
      tweet.replies.forEach((reply) => {
        repliesHtml += `
          <div class="tweet-reply">
            <div class="tweet-inner">
              <img src="${reply.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${reply.handle}</p>
                    <p class="tweet-text">${reply.tweetText}</p>
                </div>
            </div>
          </div>
        `
      })
    }

    feedHtml += `
      <div class="tweet">
      <div class="tweet-inner">
          <img src="${tweet.profilePic}" class="profile-pic">
          <div>
              <p class="handle">${tweet.handle}</p>
              <p class="tweet-text">${tweet.tweetText}</p>
              <div class="tweet-details">
                  <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
                      ${tweet.replies.length}
                  </span>
                  <span class="tweet-detail">
                    <i class="${likeIconClass}" data-like=${tweet.uuid}></i>
                      ${tweet.likes}
                  </span>
                  <span class="tweet-detail">
                    <i class="${retweetIconClass}" data-retweet=${tweet.uuid}></i>
                      ${tweet.retweets}
                  </span>
                  <span class="tweet-detail">
                    <i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i>
                  </span>
              </div>
          </div>            
      </div>

      <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
        <div>
          <textarea
            class="reply-input"
            id="reply-input-${tweet.uuid}"
            placeholder="Reply to this tweet..."
            ></textarea>
          <button class="reply-btn" data-tweetid="${tweet.uuid}">Reply</button>
        </div>
      </div>

  </div>
  `
  })
  return feedHtml
}


function render(){
  const feedEl = document.getElementById("feed")
  feedEl.innerHTML = getFeedHtml()
}

render()