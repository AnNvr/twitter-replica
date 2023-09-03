import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener("click", (e) => {
  const likeIcon = e.target.dataset.like
  const retweetIcon = e.target.dataset.retweet
  const replyIcon = e.target.dataset.reply

  if (likeIcon){
    handleLikeClick(likeIcon)
  } else if (retweetIcon){
    handleRetweetClick(retweetIcon)
  } else if (replyIcon){
    handleReplyClick(replyIcon)
  } else if (e.target.id === "tweet-btn"){
    handleTweetBtnClick()
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
    render()
}


function handleRetweetClick(tweetId){
  const targetTweetObj = tweetsData.filter((tweet) => tweet.uuid === tweetId)[0]

  if (targetTweetObj){
    if(targetTweetObj.isRetweeted){
      targetTweetObj.retweets--
    } else {
      targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
  }
  render()
}

function handleReplyClick(replyId){
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
}

function handleTweetBtnClick(){
  const tweetInput = document.getElementById("tweet-input")
  if (tweetInput.value){
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
    render()
  } else {
    window.alert("Tweet something first!")
  }


}

function getFeedHtml(){
  let feedHtml = ""
  tweetsData.forEach((tweet) => {

    let likeIconClass = tweet.isLiked ? "fa-solid fa-heart liked" : "fa-solid fa-heart"
    let retweetIconClass = tweet.isRetweeted ? "fa-solid fa-retweet retweeted" : "fa-solid fa-retweet"
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
              </div>   
          </div>            
      </div>

      <div id="replies-${tweet.uuid}" class="hidden">
        ${repliesHtml}
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