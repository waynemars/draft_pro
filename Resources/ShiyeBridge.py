"""Export only open text buffers to Shiye. Never changes a view or saves a file."""
import json
import os
import time
import sublime
import sublime_plugin


class ShiyeExportOpenFilesCommand(sublime_plugin.ApplicationCommand):
    def run(self, destination, request_id):
        windows = []
        for window in sublime.windows():
            buffers, seen = [], set()
            for view in window.views():
                if view.settings().get('is_widget') or view.buffer_id() in seen:
                    continue
                seen.add(view.buffer_id())
                content = view.substr(sublime.Region(0, view.size()))
                title = view.name() or (os.path.basename(view.file_name()) if view.file_name() else '')
                if not title:
                    title = next((line.strip()[:100] for line in content.splitlines() if line.strip()), '未命名草稿')
                buffers.append({'id': str(view.buffer_id()), 'title': title,
                                'file': view.file_name() or '', 'contents': content,
                                'syntax': view.settings().get('syntax') or '',
                                'dirty': view.is_dirty(), 'size': view.size()})
            windows.append({'id': str(window.id()), 'buffers': buffers})
        snapshot = {'format': 'shiye-sublime-v1', 'requestID': request_id,
                    'capturedAt': time.time(), 'windows': windows}
        temporary = destination + '.tmp'
        descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, 'w', encoding='utf-8') as output:
            json.dump(snapshot, output, ensure_ascii=False)
        os.replace(temporary, destination)
