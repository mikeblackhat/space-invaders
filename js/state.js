let gameLoopId;
let score = 0;
let highScore = localStorage.getItem('space-invaders-highscore') || 0;
let level = 1;
let lives = 5;
let frames = 0;
let isGameOver = false;
let keys = {};

// Use var to ensure they are accessible globally across scripts
var player;
var bullets = [];
var enemyBullets = [];
var aliens = [];
var particles = [];
var powerUps = [];
var shields = [];
var ufo = null;
var boss = null;
var alienDirection = 1;
var alienStepCooldown = 60;
var alienStepTimer = 0;
var ufoTimer = 0;

// Update UI initially
document.getElementById('highScoreEl').innerText = highScore;
