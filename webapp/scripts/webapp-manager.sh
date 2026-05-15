#!/bin/bash
# ============================================
# 知晓记管理后台 - 应用管理脚本
# ============================================
# 用法:
#   ./scripts/webapp-manager.sh start    启动开发服务器
#   ./scripts/webapp-manager.sh stop     停止开发服务器
#   ./scripts/webapp-manager.sh restart  重启开发服务器
#   ./scripts/webapp-manager.sh status   查看服务状态
#   ./scripts/webapp-manager.sh logs     查看实时日志
#   ./scripts/webapp-manager.sh debug    启动调试模式（开启 Chrome DevTools）
# ============================================

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

PID_FILE="$PROJECT_DIR/.vite-server.pid"
LOG_FILE="$PROJECT_DIR/.vite-server.log"
PORT="${VITE_PORT:-3000}"
HOST="${VITE_HOST:-0.0.0.0}"

# ============================================
# 内部函数
# ============================================

get_pid() {
  if [ -f "$PID_FILE" ]; then
    cat "$PID_FILE" 2>/dev/null
  fi
}

is_running() {
  local pid
  pid=$(get_pid)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    return 0
  fi
  return 1
}

check_node() {
  if ! command -v node &>/dev/null; then
    echo "❌ 未找到 Node.js"
    exit 1
  fi
}

install_deps() {
  if [ ! -d "node_modules" ]; then
    echo "📦 依赖未安装，正在安装..."
    npm install
  fi
}

# ============================================
# 命令实现
# ============================================

cmd_start() {
  if is_running; then
    echo "⚠️  应用已在运行中（PID: $(get_pid), 端口: $PORT）"
    echo "   访问地址: http://localhost:$PORT"
    return 1
  fi

  check_node
  install_deps

  echo ""
  echo "  ╔════════════════════════════════════╗"
  echo "  ║     知晓记管理后台                  ║"
  echo "  ║     Dev Server                      ║"
  echo "  ╚════════════════════════════════════╝"
  echo ""
  echo "🚀 启动开发服务器..."
  echo "   本地访问: http://localhost:$PORT"
  echo "   网络访问: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'your-ip'):$PORT"
  echo ""

  # 后台启动并记录 PID 和日志
  nohup npx vite --host "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" > "$PID_FILE"

  # 等待服务器就绪
  local retries=0
  local max_retries=15
  while [ $retries -lt $max_retries ]; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
      echo "✅ 服务器启动成功！(PID: $pid)"
      echo "   日志文件: $LOG_FILE"
      echo "   使用 './scripts/webapp-manager.sh logs' 查看日志"
      echo "   使用 './scripts/webapp-manager.sh debug' 启动调试"
      return 0
    fi
    sleep 1
    retries=$((retries + 1))
  done

  echo "⚠️  服务器可能仍在启动中，请检查日志: $LOG_FILE"
}

cmd_stop() {
  local pid
  pid=$(get_pid)

  if [ -z "$pid" ]; then
    echo "ℹ️  未找到运行中的服务"
    cleanup_pid_file
    return 0
  fi

  echo "🛑 停止开发服务器 (PID: $pid)..."
  if kill "$pid" 2>/dev/null; then
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      echo "   进程未响应，强制终止..."
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
    fi
    echo "✅ 服务器已停止"
  else
    echo "   进程已不存在"
  fi

  cleanup_pid_file
}

cleanup_pid_file() {
  rm -f "$PID_FILE"
}

cmd_restart() {
  echo "🔄 重启应用..."
  cmd_stop
  sleep 2
  cmd_start
}

cmd_status() {
  echo ""
  echo "═══════════════════════════════"
  echo "  知晓记管理后台 - 服务状态"
  echo "═══════════════════════════════"

  if is_running; then
    local pid
    pid=$(get_pid)
    echo "  状态:    🟢 运行中"
    echo "  PID:     $pid"
    echo "  端口:    $PORT"
    echo "  地址:    http://localhost:$PORT"

    local uptime_seconds
    if command -v ps &>/dev/null; then
      uptime_seconds=$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d ' ' || echo '?')
      if [ -n "$uptime_seconds" ] && [ "$uptime_seconds" != "?" ]; then
        local hours=$((uptime_seconds / 3600))
        local minutes=$(((uptime_seconds % 3600) / 60))
        local seconds=$((uptime_seconds % 60))
        printf "  运行时间: %dh %dm %ds\n" "$hours" "$minutes" "$seconds"
      fi
    fi

    local mem_usage
    if command -v ps &>/dev/null; then
      mem_usage=$(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ' || echo '?')
      if [ -n "$mem_usage" ] && [ "$mem_usage" != "?" ]; then
        echo "  内存:    $((mem_usage / 1024)) MB"
      fi
    fi
  else
    echo "  状态:    🔴 未运行"
  fi

  if [ -f "$LOG_FILE" ]; then
    local log_size
    log_size=$(du -h "$LOG_FILE" 2>/dev/null | cut -f1)
    echo "  日志文件: $LOG_FILE ($log_size)"
  fi

  echo "═══════════════════════════════"
  echo ""
}

cmd_logs() {
  if [ -f "$LOG_FILE" ]; then
    echo "📜 实时日志 (Ctrl+C 退出)..."
    echo "═══════════════════════════════"
    tail -f "$LOG_FILE"
  else
    echo "ℹ️  暂无日志文件，请先启动服务"
  fi
}

cmd_debug() {
  check_node

  # 确保服务运行
  if ! is_running; then
    echo "📡 服务未启动，正在启动..."
    cmd_start
    sleep 2
  fi

  echo ""
  echo "══════════════════════════════════════════"
  echo "  🔍 前端 Debug 调试模式"
  echo "══════════════════════════════════════════"
  echo ""
  echo "  Dev Server: http://localhost:$PORT"
  echo ""

  # 方案一：chrome-devtools-mcp (推荐)
  echo "  ┌─ 方案一：chrome-devtools-mcp ──────────────────┐"
  echo "  │                                                  │"
  echo "  │  1. 在 Trae IDE 中配置 MCP 服务器:               │"
  echo "  │     {                                            │"
  echo "  │       \"chrome-devtools\": {                      │"
  echo "  │         \"command\": \"npx\",                      │"
  echo "  │         \"args\": [                               │"
  echo "  │           \"-y\",                                  │"
  echo "  │           \"chrome-devtools-mcp@latest\",          │"
  echo "  │           \"--browserUrl=http://localhost:9222\"   │"
  echo "  │         ]                                        │"
  echo "  │       }                                          │"
  echo "  │     }                                            │"
  echo "  │                                                  │"
  echo "  └──────────────────────────────────────────────────┘"
  echo ""

  # 检查 Chrome 路径
  local chrome_cmd=""
  if [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
    chrome_cmd="/c/Program Files/Google/Chrome/Application/chrome.exe"
  elif [ -f "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" ]; then
    chrome_cmd="/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  elif command -v google-chrome &>/dev/null; then
    chrome_cmd="google-chrome"
  elif command -v chrome &>/dev/null; then
    chrome_cmd="chrome"
  fi

  if [ -n "$chrome_cmd" ]; then
    echo "  🚀 正在启动 Chrome (CDP 调试端口: 9222)..."
    echo ""
    "$chrome_cmd" \
      --remote-debugging-port=9222 \
      --user-data-dir="$PROJECT_DIR/.chrome-debug-profile" \
      "http://localhost:$PORT" \
      > /dev/null 2>&1 &
    local chrome_pid=$!

    echo "  Chrome 已启动 (PID: $chrome_pid)"
    echo "  CDP 端点: http://localhost:9222/json"
    echo "  DevTools: chrome://inspect"
    echo ""
    echo "  ┌─ 方案二：手动调试 ─────────────────────────────┐"
    echo "  │                                                  │"
    echo "  │  浏览器访问 http://localhost:$PORT                   │"
    echo "  │  按 F12 打开 DevTools                             │"
    echo "  │  → Console 查看 SDK 日志 (enableLog: true)        │"
    echo "  │  → Network 查看 API 请求                          │"
    echo "  │  → Application > Local Storage 查看 Token         │"
    echo "  │                                                  │"
    echo "  └──────────────────────────────────────────────────┘"
    echo ""
    echo "  SDK 调试日志已开启 (setLoggerEnabled: true)"
    echo "  在 Console 中查找 [SDK Request] / [SDK Response]"
    echo ""
    echo "══════════════════════════════════════════"
  else
    echo "  ⚠️  未找到 Chrome，请手动打开浏览器访问:"
    echo "  http://localhost:$PORT"
    echo ""
    echo "  按 F12 → Console 查看 SDK 调试日志"
  fi
}

# ============================================
# 命令路由
# ============================================

case "${1:-}" in
  start)
    cmd_start
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_restart
    ;;
  status)
    cmd_status
    ;;
  logs)
    cmd_logs
    ;;
  debug)
    cmd_debug
    ;;
  *)
    echo "知晓记管理后台 - 应用管理"
    echo ""
    echo "用法: ./scripts/webapp-manager.sh <命令>"
    echo ""
    echo "命令:"
    echo "  start     启动开发服务器"
    echo "  stop      停止开发服务器"
    echo "  restart   重启开发服务器"
    echo "  status    查看服务状态"
    echo "  logs      查看实时日志"
    echo "  debug     启动调试模式（Chrome + DevTools）"
    echo ""
    echo "示例:"
    echo "  ./scripts/webapp-manager.sh start"
    echo "  ./scripts/webapp-manager.sh debug"
    echo "  ./scripts/webapp-manager.sh logs"
    exit 1
    ;;
esac
