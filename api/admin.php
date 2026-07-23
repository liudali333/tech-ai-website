<?php
/**
 * admin.php — 简单管理后台（密码登录 + 留言/文章管理）v1.5
 */
session_start();

// 安全头
header('Content-Type: application/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

function auth() {
  if (!empty($_SESSION['admin'])) return true;
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['pwd'] === 'Admin@2026') {
    $_SESSION['admin'] = true;
    return true;
  }
  return false;
}

// ---------- 导出留言 CSV ----------
if ($_GET['action'] ?? '' === 'export-contacts') {
  if (!auth()) { http_response_code(401); echo 'unauthorized'; exit; }
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="contacts_' . date('Y-m-d') . '.csv"');
  echo "\xEF\xBB\xBF"; // UTF-8 BOM
  echo "ID,姓名,邮箱,公司,留言,IP,UA,时间\n";
  $contacts = json_decode(@file_get_contents(__DIR__ . '/../data/contacts.json'), true) ?: [];
  foreach ($contacts as $c) {
    echo sprintf('"%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
      $c['id'] ?? '',
      str_replace('"', '""', $c['name']    ?? ''),
      str_replace('"', '""', $c['email']   ?? ''),
      str_replace('"', '""', $c['company'] ?? ''),
      str_replace('"', '""', $c['message'] ?? ''),
      str_replace('"', '""', $c['ip']      ?? ''),
      str_replace('"', '""', $c['ua']      ?? ''),
      str_replace('"', '""', $c['time']    ?? '')
    );
  }
  exit;
}

// ---------- 导出新闻 CSV ----------
if ($_GET['action'] ?? '' === 'export-news') {
  if (!auth()) { http_response_code(401); echo 'unauthorized'; exit; }
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="news_' . date('Y-m-d') . '.csv"');
  echo "\xEF\xBB\xBF";
  echo "ID,标题,日期,内容\n";
  $news = json_decode(@file_get_contents(__DIR__ . '/../data/news.json'), true) ?: ['news'=>[]];
  foreach ($news['news'] as $n) {
    echo sprintf('"%s","%s","%s","%s"' . "\n",
      $n['id']      ?? '',
      str_replace('"', '""', $n['title']   ?? ''),
      str_replace('"', '""', $n['date']    ?? ''),
      str_replace('"', '""', $n['content'] ?? '')
    );
  }
  exit;
}

// ---------- 查看留言 ----------
if ($_GET['action'] ?? '' === 'contacts') {
  if (!auth()) { http_response_code(401); echo 'unauthorized'; exit; }
  header('Content-Type: application/json');
  echo @file_get_contents(__DIR__ . '/../data/contacts.json') ?: '[]';
  exit;
}

// ---------- 查看文章 ----------
if ($_GET['action'] ?? '' === 'news') {
  if (!auth()) { http_response_code(401); echo 'unauthorized'; exit; }
  header('Content-Type: application/json');
  echo @file_get_contents(__DIR__ . '/../data/news.json') ?: '{"news":[]}';
  exit;
}

// ---------- 登出 ----------
if ($_GET['action'] ?? '' === 'logout') {
  session_destroy();
  header('Location: ../admin/index.html');
  exit;
}

// ---------- 默认：输出管理后台 HTML ----------
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NexaAI 管理后台</title>
<style>
  :root { --bg:#0a0a1a; --cyan:#00f0ff; --text:#e8e8f0; --muted:#8888aa; }
  body { background:var(--bg); color:var(--text); font-family:monospace; margin:0; padding:40px; }
  .wrap { max-width:900px; margin:0 auto; }
  h1 { color:var(--cyan); margin-bottom:24px; }
  .card { background:#0f0f2a; border:1px solid rgba(0,240,255,.2); border-radius:10px; padding:20px; margin-bottom:20px; }
  input { background:#0f0f2a; border:1px solid rgba(0,240,255,.3); color:var(--text); padding:10px 14px; border-radius:6px; width:200px; }
  button { background:transparent; border:1px solid var(--cyan); color:var(--cyan); padding:10px 20px; border-radius:6px; cursor:pointer; margin-left:10px; margin-bottom:8px; }
  pre { max-height:400px; overflow:auto; font-size:.8rem; }
  .export-btn { font-size:.8rem; padding:6px 12px; }
  .stats { display:flex; gap:24px; margin-bottom:20px; flex-wrap:wrap; }
  .stat-item { background:#0f0f2a; border:1px solid rgba(0,240,255,.15); border-radius:8px; padding:16px 24px; }
  .stat-num { font-size:1.8rem; color:var(--cyan); font-weight:700; }
  .stat-label { color:var(--muted); font-size:.8rem; margin-top:4px; }
  a { color:var(--cyan); }
</style>
</head>
<body>
<div class="wrap">
  <h1>⚡ NexaAI 管理后台</h1>
  <?php if (!auth()): ?>
    <div class="card">
      <p style="color:var(--muted);margin-bottom:12px">请输入管理员密码</p>
      <form method="POST">
        <input type="password" name="pwd" placeholder="密码" required>
        <button type="submit">登录</button>
      </form>
    </div>
  <?php else: ?>
    <p style="margin-bottom:20px">
      <a href="?action=logout" style="color:var(--muted);font-size:.85rem">退出登录</a>
    </p>

    <!-- 统计概览 -->
    <div class="stats" id="stats"></div>

    <div class="card">
      <h3 style="color:var(--cyan);margin-bottom:12px">📬 最新留言
        <button class="export-btn" onclick="exportCSV('export-contacts')">导出 CSV</button>
      </h3>
      <pre id="contacts" style="white-space:pre-wrap;word-break:break-all">加载中…</pre>
    </div>
    <div class="card">
      <h3 style="color:var(--cyan);margin-bottom:12px">📰 新闻列表
        <button class="export-btn" onclick="exportCSV('export-news')">导出 CSV</button>
      </h3>
      <pre id="news" style="white-space:pre-wrap;word-break:break-all">加载中…</pre>
    </div>
    <script>
      // 统计概览
      fetch('../api/stats.php').then(r=>r.json()).then(d=>{
        document.getElementById('stats').innerHTML =
          '<div class="stat-item"><div class="stat-num">' + d.pv + '</div><div class="stat-label">PV</div></div>' +
          '<div class="stat-item"><div class="stat-num">' + d.uv + '</div><div class="stat-label">UV</div></div>';
      }).catch(() => {});

      // 留言 + 新闻
      function loadData(id, url) {
        fetch(url).then(r=>r.json()).then(d=>{
          document.getElementById(id).textContent = JSON.stringify(d, null, 2);
        }).catch(() => { document.getElementById(id).textContent = '加载失败'; });
      }
      loadData('contacts', '../api/admin.php?action=contacts');
      loadData('news', '../api/admin.php?action=news');

      // 导出 CSV
      function exportCSV(action) {
        window.location.href = '../api/admin.php?action=' + action;
      }
    </script>
  <?php endif; ?>
</div>
</body>
</html>
<?php
