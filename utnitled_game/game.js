/* Heavily inspired by Trimps https://trimps.github.io/ */
const stat_numrobots = document.getElementById("stat_numrobots")
const pb_buildrobot = document.getElementById("pb_buildrobot")
let buildingrobot = false
const stats = {
    "robots": 0,
}

function buildrobot() {
    if (!buildingrobot) {
        buildingrobot = true
        let time = 3 // seconds
        pb_buildrobot.style.transitionDuration = `${time}s`
        pb_buildrobot.setAttribute("class", "a") // Set class "a" ( for 'active' )
        setTimeout(buildrobotcomplete, time*1000) // Do thing indicated by end of progress bar when animation completes
    }
}

function buildrobotcomplete() {
    pb_buildrobot.style.transitionDuration = "0s" // Instantly reset progress bar
    pb_buildrobot.setAttribute("class", "")
    stats.robots += 1
    stat_numrobots.innerText = stats.robots
    buildingrobot = false
}