"""Local fixture: verifies protocol mapping, auth and redaction without user data."""
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        assert self.path.endswith('/models')
        assert self.headers.get('Authorization') == 'Bearer fixture-key'
        custom = self.headers.get('comate_custom_header')
        if custom:
            assert json.loads(custom)['source'] == ''
        status = 200
        result = {'data': [{'id': 'zeta-model'}, {'id': 'test-model'}, {'id': 'alpha-model'}, {'id': 'test-model'}, {'id': ''}, {'name': 'ignored'}]}
        if self.path == '/v1/empty/models':
            result = {'data': []}
        elif self.path == '/v1/unauthorized/models':
            status, result = 401, {'error': {'message': 'invalid fixture token'}}
        elif self.path == '/v1/invalid/models':
            result = {'data': {'wrong': 'shape'}}
        elif self.path == '/v1/invalid-items/models':
            result = {'data': [None, 'wrong', {'id': 123}]}
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        if body.get('model') == 'error-model':
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b'{"error":{"message":"invalid fixture token"}}')
            return
        assert self.headers.get('Authorization') == 'Bearer fixture-key'
        raw = json.dumps(body, ensure_ascii=False)
        assert 'sensitive-test-secret' not in raw, 'secret leaked to model'
        if self.path == '/v1/messages':
            assert self.headers.get('anthropic-version') == '2023-06-01'
            assert body['max_tokens'] == 8192
            assert all(m['role'] != 'system' for m in body['messages'])
        elif self.path == '/v1/responses':
            assert 'input' in body and body['store'] is False
        else:
            assert self.path == '/v1/chat/completions'
            assert 'messages' in body
        if 'retrieved_notes' in raw:
            content = '先用 pdo2 检索错误日志，再对照请求标识核查。[1]'
        elif '请回复 OK' in raw:
            content = 'OK'
        else:
            content = json.dumps({'title': '联调知识', 'summary': '依据排查草稿整理', 'tags': ['运维'], 'knowledge': '# 排查知识\n\n保留日志依据。', 'skill': '---\nname: log-troubleshooting\ndescription: 用于日志排查\n---\n\n# 步骤\n\n使用原始命令并验证错误码。'}, ensure_ascii=False)
        if self.path.endswith('/responses'):
            result = {'output': [{'type': 'message', 'content': [{'type': 'output_text', 'text': content}]}]}
        elif self.path.endswith('/messages'):
            result = {'content': [{'type': 'text', 'text': content}]}
        else:
            result = {'choices': [{'message': {'role': 'assistant', 'content': content}}]}
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result, ensure_ascii=False).encode())

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 18763
    print(f'Fixture ready: http://127.0.0.1:{port}/v1', flush=True)
    HTTPServer(('127.0.0.1', port), Handler).serve_forever()
