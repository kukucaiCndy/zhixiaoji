#!/bin/bash
# ============================================
# 知晓记管理后台 - 自动编译与启动脚本
# ============================================
# 用法:
#   ./start.sh dev      启动开发服务器（默认，热更新）
#   ./start.sh build    生产构建 + 预览
#   ./start.sh check    仅类型检查
#   ./start.sh help     显示帮助
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

MODE="${1:-dev}"

print_banner() {
  echo ""
  echo "  ╔════════════════════════════════════╗"
  echo "  ║     知晓记管理后台                  ║"
  echo "  ║     zhixiaoji-admin v1.0.0         ║"
  echo "  ╚════════════════════════════════════╝"
  echo ""
}

check_node() {
  if ! command -v node &>/dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
  fi
  echo "   Node.js: $(node --version)"
  echo "   npm:     $(npm --version)"
}

install_deps() {
  if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
    echo "✅ 依赖安装完成"
  fi
}

run_typecheck() {
  echo ""
  echo "🔍 TypeScript 类型检查..."
  npx vue-tsc --noEmit
  echo "✅ 类型检查通过"
}

run_dev() {
  print_banner
  check_node
  install_deps
  echo ""
  echo "🚀 启动开发服务器 (http://localhost:3000)..."
  echo "   按 Ctrl+C 停止服务器"
  echo ""
  npx vite --host 0.0.0.0
}

run_build() {
  print_banner
  check_node
  install_deps
  echo ""
  echo "🔍 TypeScript 类型检查..."
  npx vue-tsc --noEmit
  echo ""
  echo "📦 生产构建..."
  npx vite build
  echo ""
  echo "✅ 构建完成！产出目录: dist/"
  echo ""
  echo "🚀 启动预览服务器 (http://localhost:4173)..."
  echo "   按 Ctrl+C 停止服务器"
  echo ""
  npx vite preview --host 0.0.0.0
}

run_check() {
  print_banner
  check_node
  install_deps
  echo ""
  echo "🔍 TypeScript 类型检查..."
  npx vue-tsc --noEmit
  echo ""
  echo "📦 生产构建验证..."
  npx vite build
  echo ""
  echo "✅ 全部检查通过！"
}

show_help() {
  echo "知晓记管理后台 - 启动脚本"
  echo ""
  echo "用法: ./start.sh [模式]"
  echo ""
  echo "可用模式:"
  echo "  dev      启动开发服务器（默认，热更新）"
  echo "  build    类型检查 + 生产构建 + 预览"
  echo "  check    类型检查 + 构建验证（不启动服务）"
  echo "  help     显示此帮助信息"
  echo ""
  echo "示例:"
  echo "  ./start.sh          # 启动开发服务器"
  echo "  ./start.sh dev      # 同上"
  echo "  ./start.sh build    # 生产构建并预览"
  echo "  ./start.sh check    # 仅验证编译"
}

case "$MODE" in
  dev)
    run_dev
    ;;
  build)
    run_build
    ;;
  check)
    run_check
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "❌ 未知模式: $MODE"
    show_help
    exit 1
    ;;
esac
