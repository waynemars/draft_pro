const passed=[];
const check=(condition,message)=>{if(!condition)throw Error(message);};
const near=(actual,expected,message)=>check(Math.abs(actual-expected)<=1.25,`${message}: ${actual} != ${expected}`);
const frame=()=>new Promise(resolve=>setTimeout(resolve,0));
const command='pdo2 -M -bns group.example.all -y -q -show row -r 50 "grep -i error ./log/service.log" --note long-command-for-horizontal-scroll-testing-0123456789';
const fixture='call error:\n\n'+Array.from({length:24},(_,i)=>`${i+1} ${command}\n`).join('\n')+'\n中文和 English 😀 emoji\n\tTab 与缩进\n\ncurl -s https://example.com/api\n';
const note={id:'isolated-editor-layout',title:'Editor layout fixture',content:fixture,language:'shell',kind:'draft',tags:[],sourceIDs:[],createdAt:1,updatedAt:1};
S.notes=[note];S.active=note.id;S.open=[note.id];S.preview=false;S.section='draft';
rpc=async(action,args)=>action==='saveNote'?args.note:true;
render();const cm=codeEditor;cm.focus();cm.setOption('cursorBlinkRate',0);await frame();
function glyphRect(line,column,length=1){
  const text=cm.getLine(line),normalized=text.replace(/\t/g,'    '),pre=[...cm.getWrapperElement().querySelectorAll('.CodeMirror-code pre.CodeMirror-line')].find(el=>el.textContent.replace(/\u00a0/g,' ')===normalized);
  check(pre,'Expected visible line '+line);
  const walker=document.createTreeWalker(pre,NodeFilter.SHOW_TEXT);let node,offset=text.slice(0,column).replace(/\t/g,'    ').length;
  while((node=walker.nextNode())){
    if(offset<node.length){const range=document.createRange();range.setStart(node,offset);range.setEnd(node,Math.min(node.length,offset+length));return range.getBoundingClientRect();}offset-=node.length;
  }
  throw Error('Missing visible glyph '+line+':'+column);
}
async function verifyCaret(line,ch){
  cm.setCursor({line,ch,sticky:'after'});cm.scrollIntoView({line,ch},40);await frame();
  const cursor=cm.getWrapperElement().querySelector('.CodeMirror-cursor').getBoundingClientRect();
  const length=cm.getLine(line).codePointAt(ch)>0xffff?2:1,glyph=glyphRect(line,ch,length);
  near(cursor.left,glyph.left,`actual caret x ${line}:${ch}`);
  near(cursor.top,glyph.top,`actual caret top ${line}:${ch}`);
  near(cursor.height,glyph.height,`actual caret height ${line}:${ch}`);
  // Hit testing must resolve the position beside the displayed character.
  const position=cm.coordsChar({left:glyph.left+.2,top:(glyph.top+glyph.bottom)/2},'page');
  check(position.line===line&&position.ch===ch,`click resolves to ${position.line}:${position.ch}, expected ${line}:${ch}`);
}
await verifyCaret(2,7);await verifyCaret(24,35);await verifyCaret(48,50);
cm.scrollTo(100000,100000);await frame();await verifyCaret(48,70);
check(cm.getScrollInfo().width>cm.getScrollInfo().clientWidth,'fixture must exercise horizontal scrolling');
passed.push('实际显示的光标与字符边缘、基线及字高一致，长命令双向滚动后点击定位准确');
for(const ch of [0,2,6,12,15])await verifyCaret(50,ch);
await verifyCaret(51,1);
passed.push('中文、英文、emoji 和 Tab 的真实光标尺寸与字符位置一致');
S.wrap=true;rememberCursor();render();await frame();
await verifyCaret(48,70);await verifyCaret(50,2);
$('editor-host').style.width='340px';cm.refresh();await frame();await verifyCaret(48,70);await verifyCaret(50,12);
passed.push('自动换行和缩窄窗口后光标尺寸、点击位置与显示文字一致');
$('editor-host').style.width='';S.wrap=false;note.language='markdown';note.content='# Heading ffi =>\n中文😀 mixed\n\n';S.cursors={};render();cm.refresh();await frame();
await verifyCaret(0,2);await verifyCaret(1,0);await verifyCaret(1,2);
passed.push('Markdown 标题和混排字体不改变光标与字高的对应关系');
cm.setCursor({line:1,ch:2});cm.replaceSelection('输入测试','end','+input');
check(note.content==='# Heading ffi =>\n中文输入测试😀 mixed\n\n','insertion must reach note at visible cursor');
check($('cursor-position').textContent==='行 2，列 7','status must follow actual selection');
cm.undo();check(note.content==='# Heading ffi =>\n中文😀 mixed\n\n','undo must update note');
cm.redo();check(note.content.includes('中文输入测试😀'),'redo must restore input');
passed.push('光标处输入、撤销、重做及状态栏同步到同一份正文');
$('find-input').value='输入测试';S.findIndex=0;findNext(0);check(cm.getSelection()==='输入测试','find selection');
$('replace-input').value='替换';replace();check(note.content.includes('中文替换😀'),'replace selection');cm.undo();check(note.content.includes('中文输入测试😀'),'replacement undo');
cm.setCursor({line:1,ch:2});rememberCursor();const stored={...S.cursors[note.id]};
const other={...note,id:'other-note',content:'另一个草稿',title:'Another'};S.notes.push(other);S.active=other.id;render();cm.setCursor({line:0,ch:2});rememberCursor();
S.active=note.id;render();check(cm.getCursor().line===1&&cm.getCursor().ch===2,'restore per-note cursor');
check(S.cursors[note.id].start===stored.start,'other note cannot overwrite cursor');
cm.undo();check(!note.content.includes('输入测试'),'per-note undo history survives tab switches');
passed.push('查找替换可撤销，切换草稿后独立恢复光标和撤销历史');
const unsafe='<img src=x onerror=alert(1)>\n<script>alert(1)</script>';
note.content=unsafe;S.cursors={};render();check(cm.getValue()===unsafe,'HTML must remain literal text');
check(!cm.getWrapperElement().querySelector('img,script'),'editor must not interpret note as HTML');
note.trashed=true;render();check(cm.getOption('readOnly')===true,'trash must remain read-only');
passed.push('文本注入隔离与废纸篓只读状态保留');
await flushAll();return passed;
