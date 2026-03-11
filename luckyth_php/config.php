<?php
// ============================================================
// config.php — Database connection settings
// Edit these to match your phpMyAdmin / MySQL setup.
// ============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'luckyth_db');
define('DB_USER', 'root');       // change to your MySQL username
define('DB_PASS', '');           // change to your MySQL password
define('DB_CHARSET', 'utf8mb4');

// Session secret (change this to a random string)
define('SESSION_SECRET', 'luckyth_orderwise_2025');

// App base URL (no trailing slash)
define('APP_URL', 'http://localhost/luckyth_php');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data);
    exit;
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function sessionUser(): ?array {
    if (session_status() === PHP_SESSION_NONE) session_start();
    return $_SESSION['user'] ?? null;
}

function requireAuth(): array {
    $user = sessionUser();
    if (!$user) jsonResponse(['error' => 'Unauthorized'], 401);
    return $user;
}

function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonResponse(['error' => 'Forbidden'], 403);
    return $user;
}
