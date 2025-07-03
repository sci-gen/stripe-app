#!/usr/bin/env python3
"""
フロントエンド用の簡易HTTPサーバー
"""
import http.server
import socketserver
import os
from pathlib import Path

# フロントエンドディレクトリに移動
frontend_dir = Path(__file__).parent
os.chdir(frontend_dir)

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

print(f"フロントエンドサーバーをポート {PORT} で起動中...")
print(f"アクセスURL: http://localhost:{PORT}")
print("停止するには Ctrl+C を押してください")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを停止しました")
        httpd.shutdown()
