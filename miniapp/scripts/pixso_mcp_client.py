"""
Pixso MCP 客户端 - 直接连接 MCP 服务器
使用方式: python3 scripts/pixso_mcp_client.py [html_file_path]
"""
import json
import sys
import os
import urllib.request
import urllib.error
import re
import http.client

MESSAGE_URL = "http://127.0.0.1:3667/mcp"

class PixsoMCPClient:
    def __init__(self):
        self.session_id = None

    def _get_session_id(self, response_headers):
        """从响应头中提取 mcp-session-id"""
        for key, value in response_headers:
            if key.lower() == "mcp-session-id":
                return value
        return None

    def send_request(self, payload, return_raw=False):
        """发送 JSON-RPC 请求，自动处理 SSE 响应格式"""
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
        if self.session_id:
            headers["mcp-session-id"] = self.session_id

        req = urllib.request.Request(MESSAGE_URL, data=data, headers=headers)
        try:
            resp = urllib.request.urlopen(req)
            raw = resp.read().decode("utf-8")
            
            # 获取 session ID（仅在第一次请求时设置）
            if not self.session_id:
                sid = self._get_session_id(resp.getheaders())
                if sid:
                    self.session_id = sid
                    print(f"[MCP] Session ID: {sid}")
            
            if return_raw:
                return raw
            
            # 解析 SSE 格式响应
            # 格式: event: message\ndata: {...}\n\n
            result = None
            for line in raw.split("\n"):
                if line.startswith("data: "):
                    try:
                        result = json.loads(line[6:])
                    except json.JSONDecodeError:
                        pass
            if result:
                return result
            # Fallback: 尝试直接解析 JSON
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return {"raw": raw}
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8") if e.fp else ""
            return {"error": {"message": str(e), "body": body}}

    def initialize(self):
        """初始化 MCP 会话"""
        print("[MCP] 正在初始化会话...")
        resp = self.send_request({
            "jsonrpc": "2.0", "id": 1, "method": "initialize",
            "params": {
                "protocolVersion": "2025-06-18",
                "capabilities": {},
                "clientInfo": {"name": "pixso-mcp-client", "version": "1.0.0"}
            }
        })
        if "result" in resp:
            print(f"[MCP] ✓ 初始化成功")
        else:
            print(f"[MCP] ✗ 初始化失败: {resp.get('error', resp)}")
            return False
        
        # 发送 initialized 通知
        self.send_request({
            "jsonrpc": "2.0", "method": "notifications/initialized", "params": {}
        })
        return True

    def list_tools(self):
        """列出可用工具"""
        resp = self.send_request({
            "jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}
        })
        if "result" in resp:
            tools = [t["name"] for t in resp["result"].get("tools", [])]
            print(f"[MCP] ✓ 可用工具 ({len(tools)}):")
            for t in tools:
                print(f"       - {t}")
            return tools
        else:
            print(f"[MCP] ✗ 获取失败: {resp}")
            return []

    def code_to_design(self, html_content):
        """调用 code_to_design 生成设计"""
        print(f"[MCP] 正在调用 code_to_design (HTML 长度: {len(html_content)} 字符)...")
        sys.stdout.flush()
        
        resp = self.send_request({
            "jsonrpc": "2.0", "id": 3, "method": "tools/call",
            "params": {
                "name": "code_to_design",
                "arguments": {"htmlStr": html_content}
            }
        })
        
        if "result" in resp:
            print(f"[MCP] ✓ 设计稿已成功生成到 Pixso!")
            return True
        elif "error" in resp:
            print(f"[MCP] ✗ 调用失败: {resp['error']}")
            return False
        else:
            print(f"[MCP] ✗ 未知响应: {resp}")
            return False

    def run(self, html_content):
        """执行完整流程"""
        if not self.initialize():
            return False
        
        tools = self.list_tools()
        if "code_to_design" not in tools:
            print(f"[MCP] ⚠️ code_to_design 工具未找到!")
            return False
        
        return self.code_to_design(html_content)


# ============ HTML 页面 ============
PAGE_21_REVIEW = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>复习计划设置</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,'PingFang SC','Helvetica Neue',sans-serif;background:#F0F2F5;display:flex;justify-content:center;}
.phone{width:375px;min-height:812px;background:#F0F2F5;}
.status-bar{height:44px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 20px;}
.status-bar .time{font-size:14px;font-weight:600;color:#1C1C1E;}
.status-bar .icons{display:flex;gap:4px;}
.status-bar .icons div{width:18px;height:10px;border-radius:2px;background:#1C1C1E;opacity:0.4;}
.nav-bar{height:44px;background:#fff;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid rgba(0,0,0,0.05);}
.nav-bar .back{font-size:17px;color:#1C1C1E;width:40px;}
.nav-bar .title{flex:1;font-size:15px;font-weight:600;color:#1C1C1E;text-align:center;}
.nav-bar .save{font-size:13px;color:#4F46E5;font-weight:600;background:#EEF2FF;padding:6px 16px;border-radius:14px;}
.algo-intro{background:#fff;padding:20px;margin-bottom:8px;display:flex;align-items:center;gap:14px;}
.algo-intro .ai-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#EEF2FF,#E0E7FF);display:flex;align-items:center;justify-content:center;font-size:22px;}
.algo-intro .ai-info{flex:1;}
.algo-intro .ai-info .ai-name{font-size:15px;font-weight:600;color:#1C1C1E;}
.algo-intro .ai-info .ai-desc{font-size:12px;color:#8E8E93;line-height:1.5;}
.interval-section{background:#fff;padding:20px;margin-bottom:8px;}
.is-title{font-size:15px;font-weight:600;color:#1C1C1E;margin-bottom:14px;}
.interval-list{display:flex;flex-direction:column;gap:10px;}
.interval-item{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#FAFAFA;border-radius:12px;}
.interval-item .ii-order{width:28px;height:28px;border-radius:14px;background:#EEF2FF;color:#4F46E5;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;}
.interval-item .ii-info{flex:1;}
.interval-item .ii-info .ii-name{font-size:14px;font-weight:500;color:#1C1C1E;}
.interval-item .ii-info .ii-desc{font-size:11px;color:#8E8E93;margin-top:2px;}
.interval-item .ii-value{display:flex;align-items:center;gap:4px;}
.ii-value .ii-num{font-size:16px;font-weight:700;color:#4F46E5;min-width:20px;text-align:center;}
.ii-value .ii-unit{font-size:12px;color:#8E8E93;}
.ii-value .ii-btn{width:28px;height:28px;border-radius:14px;border:1px solid #E2E2E5;display:flex;align-items:center;justify-content:center;font-size:16px;color:#8E8E93;background:#fff;}
.toggle-section{background:#fff;padding:20px;margin-bottom:60px;}
.ts-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.04);}
.ts-item .ts-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;}
.ts-item .ts-info{flex:1;}
.ts-item .ts-info .ts-name{font-size:14px;font-weight:500;color:#1C1C1E;}
.ts-item .ts-info .ts-desc{font-size:11px;color:#8E8E93;margin-top:2px;}
.ts-item .ts-switch{width:44px;height:26px;border-radius:13px;position:relative;}
.ts-switch.on{background:#4F46E5;}
.ts-switch.off{background:#E2E2E5;}
.ts-switch .ts-knob{width:22px;height:22px;border-radius:11px;background:#fff;position:absolute;top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.1);}
.ts-switch.on .ts-knob{right:2px;}
.ts-switch.off .ts-knob{left:2px;}
.save-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:375px;background:#fff;border-top:1px solid rgba(0,0,0,0.05);padding:16px;}
.save-full{display:block;width:100%;padding:16px;border-radius:22px;background:#4F46E5;color:#fff;font-size:16px;font-weight:600;text-align:center;}
</style>
</head>
<body>
<div class="phone">
  <div class="status-bar"><div class="time">9:41</div><div class="icons"><div></div><div></div><div></div></div></div>
  <div class="nav-bar"><div class="back">{}</div><div class="title">复习计划</div><div class="save">保存</div></div>
  <div class="algo-intro"><div class="ai-icon">&#x1F9E0;</div><div class="ai-info"><div class="ai-name">艾宾浩斯遗忘曲线</div><div class="ai-desc">基于科学研究的最优复习间隔，帮助将知识牢固存入长期记忆。</div></div></div>
  <div class="interval-section">
    <div class="is-title">&#x23F1; 复习间隔设置</div>
    <div class="interval-list">
      <div class="interval-item"><div class="ii-order">1</div><div class="ii-info"><div class="ii-name">第一次复习</div><div class="ii-desc">学习完成后</div></div><div class="ii-value"><div class="ii-btn">-</div><span class="ii-num">1</span><div class="ii-btn">+</div><span class="ii-unit">天后</span></div></div>
      <div class="interval-item"><div class="ii-order">2</div><div class="ii-info"><div class="ii-name">第二次复习</div><div class="ii-desc">第一次复习后</div></div><div class="ii-value"><div class="ii-btn">-</div><span class="ii-num">3</span><div class="ii-btn">+</div><span class="ii-unit">天后</span></div></div>
      <div class="interval-item"><div class="ii-order">3</div><div class="ii-info"><div class="ii-name">第三次复习</div><div class="ii-desc">第二次复习后</div></div><div class="ii-value"><div class="ii-btn">-</div><span class="ii-num">7</span><div class="ii-btn">+</div><span class="ii-unit">天后</span></div></div>
      <div class="interval-item"><div class="ii-order">4</div><div class="ii-info"><div class="ii-name">第四次复习</div><div class="ii-desc">第三次复习后</div></div><div class="ii-value"><div class="ii-btn">-</div><span class="ii-num">14</span><div class="ii-btn">+</div><span class="ii-unit">天后</span></div></div>
      <div class="interval-item"><div class="ii-order">5</div><div class="ii-info"><div class="ii-name">第五次复习</div><div class="ii-desc">第四次复习后</div></div><div class="ii-value"><div class="ii-btn">-</div><span class="ii-num">30</span><div class="ii-btn">+</div><span class="ii-unit">天后</span></div></div>
    </div>
  </div>
  <div class="toggle-section">
    <div class="ts-item"><div class="ts-icon" style="background:#EEF2FF;">&#x1F514;</div><div class="ts-info"><div class="ts-name">复习提醒</div><div class="ts-desc">到达复习时间时推送通知</div></div><div class="ts-switch on"><div class="ts-knob"></div></div></div>
    <div class="ts-item"><div class="ts-icon" style="background:#FFF4E5;">&#x23F0;</div><div class="ts-info"><div class="ts-name">智能错峰</div><div class="ts-desc">避免同一天复习任务过多</div></div><div class="ts-switch on"><div class="ts-knob"></div></div></div>
    <div class="ts-item"><div class="ts-icon" style="background:#E8F8EF;">&#x1F4CA;</div><div class="ts-info"><div class="ts-name">复习统计</div><div class="ts-desc">每周生成复习完成度报告</div></div><div class="ts-switch off"><div class="ts-knob"></div></div></div>
  </div>
  <div class="save-bar"><div class="save-full">保存设置</div></div>
</div>
</body>
</html>"""

if __name__ == "__main__":
    if len(sys.argv) > 1:
        html_file = sys.argv[1]
        with open(html_file, "r", encoding="utf-8") as f:
            html_content = f.read()
        print(f"[INFO] 从文件加载 HTML: {html_file}")
    else:
        print("[INFO] 使用默认页面: #21 复习计划设置")
        html_content = PAGE_21_REVIEW
        print(f"[INFO] HTML 长度: {len(html_content)} 字符")

    # 取消代理环境变量
    for key in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(key, None)

    client = PixsoMCPClient()
    success = client.run(html_content)
    print(f"\n{'='*50}")
    print(f"[{'✓' if success else '✗'}] 结果: {'成功' if success else '失败'}")
    print(f"{'='*50}")
