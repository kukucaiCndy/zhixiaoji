#!/bin/bash
# ============================================
# 知晓记管理后台 - 快速启动入口
# ============================================
# 本脚本为便捷入口，实际逻辑委托到 scripts/ 下
#
# 用法:
#   ./start.sh             启动开发服务器
#   ./start.sh build       编译构建
#   ./start.sh restart     重启开发服务器
#   ./start.sh status      查看服务状态
#   ./start.sh logs        查看实时日志
#   ./start.sh debug       启动调试模式
#   ./start.sh help        显示帮助
# ============================================

set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

SCRIPTS_DIR="$PROJECT_DIR/scripts"
MODE="${1:-start}"

show_help() {
  echo "知晓记管理后台 - 快速启动"
  echo ""
  echo "用法: ./start.sh [命令]"
  echo ""
  echo "开发命令:"
  echo "  (默认)    启动开发服务器"
  echo "  start     同默认，启动开发服务器"
  echo "  restart   重启开发服务器"
  echo "  stop      停止开发服务器"
  echo "  status    查看服务状态"
  echo "  logs      查看实时日志"
  echo "  debug     启动调试模式（Chrome + DevTools + CDP）"
  echo ""
  echo "编译命令:"
  echo "  build     类型检查 + 生产构建"
  echo "  check     类型检查 + 构建验证"
  echo ""
  echo "常用: ./start.sh          # 启动开发服务器"
  echo "      ./start.sh debug    # 启动调试模式"
  echo ""
  echo "详细脚本请见 scripts/ 目录"
}

case "$MODE" in
  start|dev)
    bash "$SCRIPTS_DIR/webapp-manager.sh" start
    ;;
  stop)
    bash "$SCRIPTS_DIR/webapp-manager.sh" stop
    ;;
  restart)
    bash "$SCRIPTS_DIR/webapp-manager.sh" restart
    ;;
  status)
    bash "$SCRIPTS_DIR/webapp-manager.sh" status
    ;;
  logs)
    bash "$SCRIPTS_DIR/webapp-manager.sh" logs
    ;;
  debug)
    bash "$SCRIPTS_DIR/webapp-manager.sh" debug
    ;;
  build)
    bash "$SCRIPTS_DIR/build.sh" build
    ;;
  check)
    bash "$SCRIPTS_DIR/build.sh" check
    ;;
  clean)
    bash "$SCRIPTS_DIR/build.sh" clean
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "❌ 未知命令: $MODE"
    show_help
    exit 1
    ;;
esac
