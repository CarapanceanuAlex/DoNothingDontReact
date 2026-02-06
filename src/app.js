import client from "./convex.js";
import { api } from "../convex/_generated/api.js";

function hide(id){
        const element = document.getElementById(id)
        element.classList.add('hidden')
        element.classList.remove('flex')
}
function show(id){
        const element = document.getElementById(id)
        element.classList.remove('hidden')
        element.classList.add('flex')
}
function showLogin(){
        hide('loginButton');
        show('loginForm');
}
function hideLogin(){
        show('loginButton');
        hide('loginForm');
}
function showAccountForm(){
        hide('loginForm');
        show('accountForm');
}
function hideAccountForm(){
        show('loginForm');
        hide('accountForm');
}
function leaveTimer(){
        hide('timer');
        show('loggedInButtons');
        isGameActive = false;
}
function mainMenu(){
        show('loggedInButtons');
        hide('loginForm');
        hide('accountForm');
}
function logout(){
        hide('loggedInButtons');
        hide('loginForm');
        hide('accountForm');
        show('loginButton');
        currentUser = null;
        getLeaderboard();
}

let startTime;
let timerInterval;
let isGameActive = false;
function startGame(){
        hide('loggedInButtons');
        hide('accountForm');
        hide('loginForm');
        show('timer');
        isGameActive = true;
        startTime = Date.now();
        updateTimer();
        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('click', resetTimer);
        document.addEventListener('keydown', resetTimer);
        document.addEventListener('scroll', resetTimer);
        document.addEventListener('touchstart', resetTimer);
        document.addEventListener('visibilitychange', resetTimer);
        document.addEventListener('mouseleave', resetTimer);
        window.addEventListener('blur', resetTimer);

        playRandomSound();  
}
function updateTimer(){
        timerInterval = setInterval(() => {
            if (!isGameActive) return;
            // If tab is hidden, reset to 0
            if (document.hidden) {
                startTime = Date.now();
                document.getElementById('timerDisplay').textContent = 0;
                return;
            }
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('timerDisplay').textContent = elapsed;
        }, 100)
}
async function resetTimer() {
        if (!isGameActive) return;
        let score = parseInt(document.getElementById('timerDisplay').textContent)
        await client.mutation(api.users.updateScore, { id:currentUser._id, score:score });
        getLeaderboard();
        startTime = Date.now();
}

let currentUser = null;
async function login() {
    const username = document.querySelector('#loginForm input[type="text"]').value;
    const password = document.querySelector('#loginForm input[type="password"]').value;
    const user = await client.query(api.users.login, { username, password });
    if (user) {
        currentUser = user;
        mainMenu();
        getLeaderboard();
    } else {
        alert("Invalid username or password");
    }
}
async function createAccount(){
    const username = document.querySelector('#accountForm input[type="text"]').value;
    const passwords = document.querySelectorAll('#accountForm input[type="password"]');
    const password = passwords[0].value;
    const confirmPassword = passwords[1].value;

    if (password !== confirmPassword){
        alert("Passwords are different!")
        return;
    }

    try {
        await client.mutation(api.users.createUser, { username, password });
        alert("Account created");
        showLogin();
        hideAccountForm();
        getLeaderboard();
    } catch (e) {
        alert(e.message);
    }

}
async function getLeaderboard(){
    let leaderboard = await client.query(api.users.getLeaderboard);

    const items = document.querySelectorAll('#leaderboard li');
    leaderboard.forEach((user, index) => {
        if(items[index]){
            items[index].textContent = `${user.username}: ${user.highestScore}`;
        }
    });

    for(let i = leaderboard.length; i < items.length; i++){
        items[i].textContent = '---'
    }

    if(currentUser){
        const updatedUser = await client.query(api.users.getUserByID, {id: currentUser._id});
        if (updatedUser){
            currentUser = updatedUser;
            document.querySelector('#leaderboard p').textContent = updatedUser.highestScore;
        }
    } else {
        document.querySelector('#leaderboard p').textContent = '0';
    }
}
function playRandomSound(){
    if (!isGameActive) return;

    const delay = Math.random() * 240000 + 60000;

    setTimeout(() => {

        const randSoundNum = Math.floor(Math.random() * 9) + 1;
        const audio = new Audio(`/sounds/sound${randSoundNum}.mp3`)
        audio.play();

        playRandomSound();
        console.log(`played sound${randSoundNum}`)
    }, delay)
}

getLeaderboard();
window.showLogin = showLogin;
window.hideLogin = hideLogin;
window.showAccountForm = showAccountForm;
window.hideAccountForm = hideAccountForm;
window.login = login;
window.createAccount = createAccount;
window.mainMenu = mainMenu;
window.logout = logout;
window.startGame = startGame;
window.leaveTimer = leaveTimer;