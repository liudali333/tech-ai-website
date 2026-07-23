<?php
/**
 * contact.php — 接收联系表单 POST，写入 data/contacts.json (v1.4 最终版)
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'msg'=>'仅支持 POST']);
  exit;
}

// ---- 速率限制：每 IP 每 60 秒最多 5 次 ----
$rate_file = sys_get_temp_dir() . '/nexaai_contact_rate.json';
$rates     = @json_decode(@file_get_contents($rate_file), true) ?: [];
$ip        = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now       = time();
$rates     = array_filter($rates, fn($t) => $now - $t < 60);
$rates[$ip] = $now;
@file_put_contents($rate_file . '.tmp', json_encode($rates));
@rename($rate_file . '.tmp', $rate_file);
if (count($rates) > 5) {
  http_response_code(429);
  echo json_encode(['ok'=>false,'msg'=>'提交过于频繁，请稍后再试']);
  exit;
}

// ---- 收集并过滤输入 ----
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$company = trim($_POST['company'] ?? '');
$message = trim($_POST['message'] ?? '');
$captcha = trim($_POST['captcha']  ?? '');

if ($name === '' || $email === '' || $message === '' || $captcha === '') {
  echo json_encode(['ok'=>false,'msg'=>'所有字段均为必填']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok'=>false,'msg'=>'邮箱格式不正确']);
  exit;
}
// 防 XSS
if (preg_match('/(<script|javascript:|on\w+=|eval\()/i', $message)) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'msg'=>'留言内容包含不允许的字符']);
  exit;
}

$record = [
  'id'      => time() . rand(100, 999),
  'name'    => htmlspecialchars($name,    ENT_QUOTES, 'UTF-8'),
  'email'   => htmlspecialchars($email,   ENT_QUOTES, 'UTF-8'),
  'company' => htmlspecialchars($company, ENT_QUOTES, 'UTF-8'),
  'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
  'ip'      => $ip,
  'ua'      => substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 200),
  'time'    => date('Y-m-d H:i:s'),
];

$file = __DIR__ . '/../data/contacts.json';
$data = json_decode(@file_get_contents($file), true) ?: [];
$data[] = $record;

@file_put_contents($file . '.tmp', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
rename($file . '.tmp', $file);

echo json_encode(['ok'=>true,'msg'=>'提交成功']);
?>
