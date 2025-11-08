
console.log("Lets start Javascript")
let currentsong = new Audio();
let songs;
let currfolder = "";

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Pad with leading zero if needed
    let formattedMinutes = String(minutes).padStart(2, "0");
    let formattedSeconds = String(secs).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    //fetching the songs from server
    const baseURL = window.location.origin;
    let a = await fetch(`${baseURL}/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
        let clean = decodeURIComponent(element.getAttribute("href")).replace(/\\/g, "/");
        songs.push(clean.split("/").pop());
    }
}




    //get the name os the every song present int the folder
    let songUl = document.querySelector(".playlistmagazine")
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<div class="playlist">
                        <div class="musicsvg"><img src="music.svg" alt="music"></div>
                        <div class="musicinfo">
                            <span>${song}</span>
                            <span>Artist: Zain</span>
                        </div>
                        <div class="playbutton">
                            <span>Play Now</span>
                        <img src="play2.svg" alt="play"></div>
                    </div>
                </div>`
    }
    //eventlistner to select song on click
    Array.from(document.querySelectorAll(".playlist")).forEach(e => {
        e.addEventListener("click", () => {
            document.querySelector(".circle").style.left = "0%";
            console.log(e.querySelector(".musicinfo").firstElementChild.innerHTML)
            playMusic(e.querySelector(".musicinfo").firstElementChild.innerHTML)
        })
    })

    return songs;
}

//Play the current song we click

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    currentsong.load()
    currentsong.addEventListener("loadedmetadata", () => {
        let total = formatTime(currentsong.duration);
        document.querySelector(".time").innerHTML = `00:00/${total}`;
    }, { once: true });
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".time").innerHTML = "00:00/00:00"
    let songplaybar = document.querySelector(".musicplayer").querySelector(".musicinfo")
    songplaybar.innerHTML = track
}

async function displayalbums() {
    const baseURL = window.location.origin;
    let a = await fetch(`${baseURL}/songs/`);
    let response = await a.text();
    response = response.replace(/%5C/g, "/");
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let musicplaylist = document.querySelector(".musicplaylist")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the 
            const baseURL = window.location.origin;
            let meta = await fetch(`${baseURL}/songs/${folder}/info.json`);
            let res = await meta.json();
            musicplaylist.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 25 25" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="cardimage">
                        <img src="/songs/${folder}/cover.jpg" alt="cover">
                    </div>
                    <div class="cardinfo">${res.title}</div>
                    <div class="cardcontent">${res.description}</div>
                </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            console.log("fetching songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            // playMusic(songs[0], true);
        });
    });
}


async function main() {

    //play the first songs
    await getsongs("songs/ncs");
    playMusic(songs[0], true);

    //display all the albums on the page
    displayalbums();

    //add event listener to previous and next
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        // decode to make sure %20 and others match your songs array
        let current = decodeURIComponent(currentsong.src.split(`/${currfolder}/`).slice(-1)[0]);
        let index = songs.indexOf(current);

        if (index > 0) {
            document.querySelector(".circle").style.left = "0%";
            playMusic(songs[index - 1]);
        } else {
            console.warn("No previous song available");
        }
    });

    next.addEventListener("click", () => {
        console.log("Next clicked");
        let current = decodeURIComponent(currentsong.src.split(`/${currfolder}/`).slice(-1)[0]);
        let index = songs.indexOf(current);

        if (index < songs.length - 1) {
            document.querySelector(".circle").style.left = "0%";
            playMusic(songs[index + 1]);
        } else {
            console.warn("No next song available");
        }
    });



    //Attch eventlistner to the play button

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    //replay the song after end
    currentsong.addEventListener("ended", () => {
        play.src = "play.svg";
        document.querySelector(".circle").style.left = "0%";
        currentsong.currentTime = 0;
    });

    //event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.transition = "all .5s"
        document.querySelector(".left").style.left = "0"
    })

    //event listner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.transition = "all .5s"
        document.querySelector(".left").style.left = "-100%"
    })


    //time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        let percent = (currentsong.currentTime / currentsong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    })

    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = currentsong.duration * percent / 100;
    })



    //add event listener to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target)
        currentsong.volume = parseInt(e.target.value) / 100
        console.log(document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg"));
    })

    //add event listner to volue for mute

    document.querySelector(".volume>img").addEventListener("click", (e) => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })



}
main();