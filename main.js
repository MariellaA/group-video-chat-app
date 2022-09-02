const APP_ID = "b596491ec53e49cba27f9242fce5ff0f"
const TOKEN = "007eJxTYOD1l1fZ8qyh62LLrK4ZHYxBtlHuxhI1DYwT3zqu81z9SVSBIcnU0szE0jA12dQ41cQyOSnRyDzN0sjEKC051TQtzSDtIYtQcmKYcPLUA+ksjAwQCOKzMOQmZuYxMAAAujoeUA=="
const CHANNEL = "main"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'}) // creates the client object
// it is an interface for providing the local client with basic functions for 
// voice and video calls such as joinning a channel, publishing our tracks or subscribing to other tracks

let localTracks = []   // local video and audio tracks
let remoteUsers = {}   // remote users video and audio tracks

// function to toggle our local user to join a stream with our camera and audio track
// inside we call the join method from the client object
// this method takes in all our app credentials and adds our local user to the channel
// while returning back a uid
let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)

    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    // set the local tracks value that we created earlier to the return value of the 
    // create microphone and camera tracks method 
    // will prompt the user to access their camera and audio and hold these values inside 
    // of the local tracks variable 
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    // after the camera and audio tracks are created we need to create a place to display and
    // store our stream
    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>` 
    // once our element is created we will query the video streams container and add in this
    // new div into that container so it can be displayed
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    // the localTracks variable is now an array which hold the audio tracks in index 0 and 
    // the video tracks in index 1. We'll query the play method which creates a video element
    // and adds it inside of the html element which we specify by the id value
    localTracks[1].play(`user-${UID}`)

    // finally we take the method below to take our video and audio tracks and we publish
    // them so every user that is in this channel can hear and see us
    await client.publish([localTracks[0], localTracks[1]])

}

// we create another function that responds to the join button click
let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

// fires off locally anytime another user joins the same channel that we're in.
// When a user joins we'll add them to the remoteUsers object and will set the
// key as their UID and then set the value to the user object so we can make
// sure that this is unique. We'll also subscribe our local client object to the
// newly added user's video and audio tracks so this is how we can receive their 
// information. We then check the mediaType and respond accordingly.
// When it is a video - create a new video player and publish it, if the user already has a video player we want to simply 
// remove it and create a new one so there are no duplicates inside our browser.
// When check is complete we recreate a new html element to store the remote user's video
// track just like we did earlier in the joinAndDisplayLocalStreams. Once the player is set we again want to find the video
// stream's div and append the newly created video player. Refferencing the user object we can access the 
// video track attribute and call the play method to activate the video player.
// --- To trigger this function we go back to the joinAndDisplayLocalStream function and subscribe to this
// event by calling client.om and setting tghe vent to uer-published...
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType ==='video'){
        let player = document.getElementById('user-container-${user.uid')
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    // add in one more check for the mediaType and whenever this is audio, go ahead and play the
    // user's audio track with the play method.
    if (mediaType === 'audio'){
        user.audioTrack.play()
    }

}

document.getElementById('join-btn').addEventListener('click', joinStream)
