<?php
/**
 * news.php — GET 返回文章列表，POST 新增文章（密码验证）
 */
header('Content-Type: application/json; charset=utf-8');
$file = __DIR__ . '/../data/news.json';
$data = json_decode(@file_get_contents($file), true) ?: ['news'=>[]];

// ---------- GET ----------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(['news' => $data['news']]);
  exit;
}

// ---------- POST ----------
$token   = $_POST['token']     ?? '';
$title   = trim($_POST['title'] ?? '');
$date    = trim($_POST['date']  ?? date('Y-m-d'));
$content = trim($_POST['content'] ?? '');

// 简单密码验证（哥上线后改密码）
$PASSWORD_HASH = password_hash('Admin@2026', PASSWORD_DEFAULT);
if (!password_verify($token, $PASSWORD_HASH) && $token !== 'Admin@2026') {
  // 兼容明文输入（过渡期）
  echo json_encode(['ok'=>false,'msg'=>'密码错误']);
  exit;
}

if ($title === '' || $content === '') {
  echo json_encode(['ok'=>false,'msg'=>'标题和内容均为必填']);
  exit;
}

$data['news'][] = [
  'id'      => time(),
  'title'   => htmlspecialchars($title,   ENT_QUOTES),
  'date'    => htmlspecialchars($date,    ENT_QUOTES),
  'content' => htmlspecialchars($content, ENT_QUOTES),
];

@file_put_contents($file . '.tmp', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
rename($file . '.tmp', $file);

echo json_encode(['ok'=>true,'msg'=>'文章已添加']);
?>
