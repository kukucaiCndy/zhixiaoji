#!/bin/bash
# ============================================
# 知晓记管理后台 - 编译构建脚本
# ============================================
# 用法:
#   ./scripts/build.sh         编译项目
#   ./scripts/build.sh check   仅类型检查
#   ./scripts/build.sh clean   清理构建产物
# ============================================

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

print_banner() {
  echo ""
  echo "  ╔════════════════════════════════════╗"
  echo "  ║     知晓记管理后台 - Build         ║"
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
    echo "📦 依赖未安装，正在安装..."
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

run_build() {
  print_banner
  check_node
  install_deps
  echo ""

  echo "🔍 Step 1/2: TypeScript 类型检查..."
  npx vue-tsc --noEmit
  echo ""

  echo "📦 Step 2/2: Vite 生产构建..."
  npx vite build

  echo ""
  echo "════════════════════════════════════"
  echo "  ✅ 构建完成！"
  echo "  产出目录: dist/"
  echo "  文件数量: $(find dist -type f | wc -l)"
  echo "  总大小:   $(du -sh dist | cut -f1)"
  echo "════════════════════════════════════"
  echo ""
}

run_check() {
  print_banner
  check_node
  install_deps
  echo ""

  echo "🔍 TypeScript 类型检查..."
  npx vue-tsc --noEmit
  echo ""

  echo "📦 Vite 构建验证（dry-run）..."
  npx vite build --emptyOutDir

  echo ""
  echo "✅ 全部检查通过！"
}

run_clean() {
  echo ""
  echo "🧹 清理构建产物..."
  rm -rf dist .vite
  echo "✅ 已清理 dist/ 和 .vite/"
}

case "${1:-build}" in
  build)
    run_build
    ;;
  check)
    run_check
    ;;
  clean)
    run_clean
    ;;
  *)
    echo "用法: ./scripts/build.sh [build|check|clean]"
    exit 1
    ;;
esac
