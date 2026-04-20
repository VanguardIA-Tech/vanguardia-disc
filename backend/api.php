<?php
/**
 * Vanguardia DISC - API REST
 * PHP 8.x + MariaDB | Sem dependências externas
 *
 * Endpoints:
 *   POST   /api/auth/login
 *   GET    /api/projects
 *   POST   /api/projects
 *   DELETE /api/projects/{id}
 *   GET    /api/assessments[?project_id=&search=]
 *   POST   /api/assessments
 *   DELETE /api/assessments/{id}
 *   DELETE /api/assessments          (bulk, requer ?project_id= ou ?all=1)
 */

// ─── CORS ────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────
$DB_HOST = getenv('DB_HOST') ?: 'mariadb';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'disc_vanguardia';
$DB_USER = getenv('DB_USER') ?: 'disc_user';
$DB_PASS = getenv('DB_PASS') ?: '';
$JWT_SECRET = getenv('JWT_SECRET') ?: 'vanguardia-disc-secret-key-2024';
$ADMIN_USER = getenv('ADMIN_USERNAME') ?: 'admin';
$ADMIN_PASS = getenv('ADMIN_PASSWORD') ?: 'Vanguardia@2024';

// ─── DATABASE ────────────────────────────────────────────────────────────────
function getDB(): PDO {
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// ─── JWT (HS256, sem dependências) ───────────────────────────────────────────
function b64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwtEncode(array $payload, string $secret): string {
    $header  = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = b64url(json_encode($payload));
    $sig     = b64url(hash_hmac('sha256', "$header.$payload", $secret, true));
    return "$header.$payload.$sig";
}

function jwtDecode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = b64url(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
    if (!$data || ($data['exp'] ?? 0) < time()) return null;
    return $data;
}

function requireAuth(): void {
    global $JWT_SECRET;
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
        jsonError(401, 'Token de autenticação necessário');
    }
    $decoded = jwtDecode($m[1], $JWT_SECRET);
    if (!$decoded) {
        jsonError(401, 'Token inválido ou expirado');
    }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function jsonOut(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Strip /api prefix if called directly or via alias
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/') ?: '/';

// POST /auth/login
if ($method === 'POST' && $uri === '/auth/login') {
    $b = body();
    $user = trim($b['username'] ?? '');
    $pass = $b['password'] ?? '';

    if ($user !== $ADMIN_USER || $pass !== $ADMIN_PASS) {
        jsonError(401, 'Usuário ou senha incorretos');
    }

    $token = jwtEncode([
        'sub'  => $user,
        'role' => 'admin',
        'iat'  => time(),
        'exp'  => time() + 7200, // 2h
    ], $JWT_SECRET);

    jsonOut(['token' => $token, 'expires_in' => 7200]);
}

// GET /projects
if ($method === 'GET' && $uri === '/projects') {
    $rows = getDB()
        ->query('SELECT * FROM projects ORDER BY created_at ASC')
        ->fetchAll();
    jsonOut($rows);
}

// POST /projects
if ($method === 'POST' && $uri === '/projects') {
    requireAuth();
    $b = body();
    $name = trim($b['name'] ?? '');
    if ($name === '') jsonError(400, 'Nome do projeto é obrigatório');

    $stmt = getDB()->prepare(
        'INSERT INTO projects (name, description) VALUES (:name, :desc)'
    );
    $stmt->execute(['name' => $name, 'desc' => $b['description'] ?? null]);
    $id = (int) getDB()->lastInsertId();

    $row = getDB()->prepare('SELECT * FROM projects WHERE id = ?');
    $row->execute([$id]);
    jsonOut($row->fetch(), 201);
}

// DELETE /projects/{id}
if ($method === 'DELETE' && preg_match('#^/projects/(\d+)$#', $uri, $m)) {
    requireAuth();
    $stmt = getDB()->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->execute([(int)$m[1]]);
    jsonOut(['deleted' => $stmt->rowCount()]);
}

// GET /assessments
if ($method === 'GET' && $uri === '/assessments') {
    requireAuth();
    $pid    = isset($_GET['project_id']) ? (int)$_GET['project_id'] : null;
    $search = trim($_GET['search'] ?? '');

    $where = [];
    $params = [];

    if ($pid) {
        $where[]  = 'a.project_id = ?';
        $params[] = $pid;
    }
    if ($search !== '') {
        $where[]  = '(a.candidate_name LIKE ? OR a.candidate_email LIKE ?)';
        $like     = "%$search%";
        $params[] = $like;
        $params[] = $like;
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "SELECT a.*, p.name AS project_name
            FROM disc_assessments a
            LEFT JOIN projects p ON p.id = a.project_id
            $whereClause
            ORDER BY a.created_at DESC";

    $stmt = getDB()->prepare($sql);
    $stmt->execute($params);
    jsonOut($stmt->fetchAll());
}

// POST /assessments
if ($method === 'POST' && $uri === '/assessments') {
    $b = body();

    $required = ['candidate_name', 'candidate_email', 'score_d', 'score_i', 'score_s', 'score_c', 'dominant_profile'];
    foreach ($required as $field) {
        if (!isset($b[$field]) || $b[$field] === '') {
            jsonError(400, "Campo obrigatório: $field");
        }
    }

    $stmt = getDB()->prepare("
        INSERT INTO disc_assessments
            (project_id, candidate_name, candidate_email, candidate_phone,
             candidate_position, candidate_department,
             score_d, score_i, score_s, score_c, dominant_profile, answers)
        VALUES
            (:project_id, :candidate_name, :candidate_email, :candidate_phone,
             :candidate_position, :candidate_department,
             :score_d, :score_i, :score_s, :score_c, :dominant_profile, :answers)
    ");

    $stmt->execute([
        'project_id'          => $b['project_id'] ?? null,
        'candidate_name'      => $b['candidate_name'],
        'candidate_email'     => $b['candidate_email'],
        'candidate_phone'     => $b['candidate_phone'] ?? null,
        'candidate_position'  => $b['candidate_position'] ?? null,
        'candidate_department'=> $b['candidate_department'] ?? null,
        'score_d'             => (int)$b['score_d'],
        'score_i'             => (int)$b['score_i'],
        'score_s'             => (int)$b['score_s'],
        'score_c'             => (int)$b['score_c'],
        'dominant_profile'    => $b['dominant_profile'],
        'answers'             => isset($b['answers']) ? json_encode($b['answers']) : null,
    ]);

    $id = (int) getDB()->lastInsertId();
    jsonOut(['id' => $id, 'message' => 'Avaliação salva com sucesso'], 201);
}

// DELETE /assessments/{id}
if ($method === 'DELETE' && preg_match('#^/assessments/(\d+)$#', $uri, $m)) {
    requireAuth();
    $stmt = getDB()->prepare('DELETE FROM disc_assessments WHERE id = ?');
    $stmt->execute([(int)$m[1]]);
    jsonOut(['deleted' => $stmt->rowCount()]);
}

// DELETE /assessments  (bulk)
if ($method === 'DELETE' && $uri === '/assessments') {
    requireAuth();
    if (isset($_GET['all'])) {
        getDB()->exec('DELETE FROM disc_assessments');
        jsonOut(['deleted' => 'all']);
    } elseif (isset($_GET['project_id'])) {
        $stmt = getDB()->prepare('DELETE FROM disc_assessments WHERE project_id = ?');
        $stmt->execute([(int)$_GET['project_id']]);
        jsonOut(['deleted' => $stmt->rowCount()]);
    } else {
        jsonError(400, 'Parâmetro obrigatório: project_id ou all');
    }
}

// 404
jsonError(404, 'Endpoint não encontrado');
