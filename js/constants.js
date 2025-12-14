const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 24;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;

const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_WIDTH = 32;
const ALIEN_HEIGHT = 24;
const ALIEN_PADDING = 15;
const ALIEN_OFFSET_TOP = 80;
const ALIEN_OFFSET_LEFT = 50;

const BULLET_TYPE = {
    NORMAL: 0,
    FAST: 1, // Yellow
    SPREAD: 2, // Cyan, 3 way
    TRIPLE: 3, // Magenta, 3 parallel
    SHIELD: 4, // Blue, Protection
    FAST_SPREAD: 5,
    FAST_TRIPLE: 6
};
const POWERUP_COLORS = ['#ffff00', '#00ffff', '#ff00ff', '#0000ff'];
