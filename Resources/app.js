'use strict';

const ICONS = {
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  notebook:'<path d="M5 3h14v18H5zM2 7h5M2 12h5M2 17h5M10 7h5M10 11h5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  sparkles:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4M18 4h4"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  file:'<path d="M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h6"/>',
  book:'<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1ZM12 5v15"/>',
  code:'<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>',
  chat:'<path d="M21 11.5a9 9 0 0 1-9 9c-1.6 0-3.1-.4-4.4-1.1L2 21l1.6-5.6A9 9 0 1 1 21 11.5Z"/><path d="M7 11h10M7 15h6"/>',
  settings:'<path d="M18.84 9.17L19.21 10.34L21.28 10.53L21.28 13.47L19.21 13.66L18.84 14.83L18.28 15.92L19.60 17.53L17.53 19.60L15.92 18.28L14.83 18.84L13.66 19.21L13.47 21.28L10.53 21.28L10.34 19.21L9.17 18.84L8.08 18.28L6.47 19.60L4.40 17.53L5.72 15.92L5.16 14.83L4.79 13.66L2.72 13.47L2.72 10.53L4.79 10.34L5.16 9.17L5.72 8.08L4.40 6.47L6.47 4.40L8.08 5.72L9.17 5.16L10.34 4.79L10.53 2.72L13.47 2.72L13.66 4.79L14.83 5.16L15.92 5.72L17.53 4.40L19.60 6.47L18.28 8.08Z"/><circle cx="12" cy="12" r="3"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-2L20 8M4 16l2.4 3A7 7 0 0 0 18 17"/>',
  folder:'<path d="M3 5h6l2 3h10v12H3V5Z"/>',
  save:'<path d="M4 3h13l4 4v14H3V3h1ZM7 3v6h9V3M7 21v-8h10v8"/>',
  pin:'<path d="m16 3 5 5-4 1-4 5v4l-7-7h4l5-4 1-4ZM9 15l-6 6"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  arrowRight:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  up:'<path d="m6 15 6-6 6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  archive:'<path d="M3 3h18v5H3zM5 8v13h14V8M9 12h6"/>',
  history:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
  link:'<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(0 0) scale(.9)"/>',
  check:'<path d="m5 12 4 4L19 6"/>', send:'<path d="m22 2-7 20-4-9L2 9l20-7ZM11 13 22 2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.file}</svg>`;}
const $=id=>document.getElementById(id);
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
const pendingRPC=new Map();let rpcIndex=0;
function rpc(action,args={}){return new Promise((resolve,reject)=>{const id=String(++rpcIndex);pendingRPC.set(id,{resolve,reject});if(!window.webkit?.messageHandlers?.native){pendingRPC.delete(id);reject(Error('请在拾页 Mac 应用中打开。'));return;}window.webkit.messageHandlers.native.postMessage({id,action,args});});}
window.nativeReply=message=>{const p=pendingRPC.get(message.id);if(!p)return;pendingRPC.delete(message.id);message.error?p.reject(Error(message.error)):p.resolve(message.result);};
window.nativeEvent=async event=>{if(event.name==='filesOpened'){await refresh();toast(`已打开 ${event.data.count} 篇文本`);if(event.data.skipped.length)showSkipped(event.data.skipped);}if(event.name==='error')toast(event.data.message,true);};
const S={notes:[],active:null,open:[],section:'draft',settings:{},preview:false,wrap:false,bulk:false,selected:new Set(),dirty:new Set(),timers:new Map(),chains:new Map(),versions:new Map(),cursors:{},chat:[],chatBusy:false,findIndex:0,findMatches:[],searchSeq:0,extractionSeq:0,modalType:null,proposal:null,proposalTab:'knowledge',archiveIDs:[],quickIndex:0,quickResults:[],dataDirectory:'',sublimeImport:null,batchPlan:null};
let codeEditor=null,editorRendering=false;
const editorDocuments=new Map();
const editorModes={shell:'text/x-sh',sql:'text/x-sql',json:'application/json',markdown:'text/x-markdown',python:'text/x-python',javascript:'text/javascript',text:'text/plain'};
const labels={draft:'草稿本',knowledge:'知识库',skill:'Skills',archived:'已归档草稿',trash:'废纸篓',search:'搜索',chat:'与知识对话'};
const kindIcons={draft:'file',knowledge:'book',skill:'code'};
function current(){return S.notes.find(n=>n.id===S.active);}
function noteByID(id){return S.notes.find(n=>n.id===id);}
function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function date(value,full=false){const d=new Date(value*1000);return d.toLocaleDateString('zh-CN',{month:'short',day:'numeric',...(full?{year:'numeric'}:{})});}
function toast(message,error=false){$('toast').textContent=message;$('toast').className=error?'error':'';$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,error?6500:3000);}
function guarded(fn){return (...args)=>Promise.resolve().then(()=>fn(...args)).catch(error=>{toast(error.message,true);console.error(error.message);});}
function sortedNotes(notes){return [...notes].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updatedAt-a.updatedAt);}
function visibleNotes(){return sortedNotes(S.notes.filter(n=>{if(S.section==='trash')return n.trashed;if(n.trashed)return false;if(S.section==='archived')return n.kind==='draft'&&n.archived;if(S.section==='draft')return n.kind==='draft'&&!n.archived;if(S.section==='knowledge'||S.section==='skill')return n.kind===S.section;return S.open.includes(n.id);}));}
function count(kind){return S.notes.filter(n=>!n.trashed&&n.kind===kind&&(kind!=='draft'||!n.archived)).length;}
function renderNav(){const nav=[['draft','notebook','草稿本',count('draft')],['knowledge','book','知识库',count('knowledge')],['skill','code','Skills',count('skill')],['chat','chat','与知识对话',''],['archived','archive','已归档草稿',S.notes.filter(n=>!n.trashed&&n.archived&&n.kind==='draft').length]];$('navigation').innerHTML=nav.map(([id,ic,title,num])=>`<button class="nav-button ${S.section===id?'active':''}" data-action="section" data-id="${id}">${icon(ic)}<span>${title}</span><span class="nav-count">${num||''}</span></button>`).join('');$('section-name').textContent=labels[S.section]||'草稿本';}
function renderFiles(){const notes=visibleNotes();$('files-label').textContent=(S.section==='chat'||S.section==='search')?'已打开 / OPEN FILES':S.section==='draft'?'草稿 / OPEN FILES':labels[S.section]+' / '+notes.length;$('file-list').innerHTML=notes.length?notes.map(n=>`<div class="file-item ${S.active===n.id?'active':''}" data-action="${S.bulk?'selectNote':'openNote'}" data-id="${esc(n.id)}" role="button" tabindex="0" aria-label="${esc(n.title)}">${S.bulk?`<input type="checkbox" ${S.selected.has(n.id)?'checked':''} tabindex="-1" aria-label="选择 ${esc(n.title)}">`:`<span class="file-icon">${icon(n.pinned?'pin':kindIcons[n.kind])}</span>`}<div class="file-copy"><div class="file-title">${esc(n.title)}</div><div class="file-summary">${esc((n.summary||n.content.replace(/^#+\s*/gm,'').trim()||'空白的一页').slice(0,80))}</div></div>${S.dirty.has(n.id)?'<span class="tiny-dot"></span>':''}</div>`).join(''):`<div class="list-empty">${S.section==='draft'?'留一点空白，给下一个想法。<br>按 ⌘N 新建草稿。':S.section==='knowledge'||S.section==='skill'?'归档草稿后，沉淀会出现在这里。':'这里还没有内容。'}</div>`;$('bulk-bar').hidden=!S.bulk;$('selection-count').textContent=`已选 ${S.selected.size} 篇`;$('bulk-select-all').textContent=notes.length&&notes.every(n=>S.selected.has(n.id))?'取消全选':'全选';$('bulk-select-all').setAttribute('aria-label',notes.length&&notes.every(n=>S.selected.has(n.id))?'取消全选当前列表':'全选当前列表');document.querySelector('[data-action=bulk]').classList.toggle('active',S.bulk);}
function renderTabs(){$('tabs').innerHTML=S.open.filter(id=>noteByID(id)&&!noteByID(id).trashed).map(id=>{const n=noteByID(id);return `<div class="tab ${id===S.active&&!['chat','search'].includes(S.section)?'active':''}" data-action="openNote" data-id="${esc(id)}" role="button" tabindex="0">${icon(kindIcons[n.kind])}<span class="tab-title">${esc(n.title)}</span><button class="close-tab" data-action="closeTab" data-id="${esc(id)}" aria-label="关闭 ${esc(n.title)}">${S.dirty.has(id)?'•':'×'}</button></div>`;}).join('')+`<button class="tab new-tab" data-action="new" title="新建草稿">${icon('plus')}</button>`;}
function render(){$('resume-batch').hidden=!S.batchPlan;renderNav();renderFiles();renderTabs();const n=current();$('editor-panel').hidden=!n||['search','chat'].includes(S.section);$('empty-panel').hidden=!!n||['search','chat'].includes(S.section);$('search-panel').hidden=S.section!=='search';$('chat-panel').hidden=S.section!=='chat';$('top-title').textContent=n&&!['search','chat'].includes(S.section)?n.title:S.section==='chat'?'从自己的记录里，找到答案':S.section==='search'?'连接零散的线索':'新的想法，从这里开始';document.querySelector('.top-actions [data-action=archive]').disabled=!n||S.section==='chat'||S.section==='search'||n.trashed;document.querySelector('.top-actions [data-action=saveFile]').disabled=!n||S.section==='chat'||S.section==='search';if(n&&!['search','chat'].includes(S.section))renderEditor(n);}
function ensureEditor(){
  if(codeEditor)return codeEditor;
  codeEditor=CodeMirror($('editor-host'),{
    value:'',mode:'text/plain',theme:'shiye',lineNumbers:true,lineWrapping:S.wrap,
    indentUnit:4,tabSize:4,indentWithTabs:false,inputStyle:'textarea',
    screenReaderLabel:'草稿正文',spellcheck:false,autocorrect:false,autocapitalize:false,
    // Measure the caret from the actual glyph, including CJK/emoji fallback fonts.
    singleCursorHeightPerLine:false,cursorHeight:1,
    extraKeys:{
      Tab:cm=>cm.somethingSelected()?cm.indentSelection('add'):cm.replaceSelection('    ','end','+input'),
      'Shift-Tab':cm=>cm.indentSelection('subtract'),
      'Cmd-/':cm=>cm.toggleComment({lineComment:['javascript','json'].includes(current()?.language)?'//':'#',indent:true}),
      'Cmd-F':()=>showFind(),'Cmd-G':()=>findNext(1),'Shift-Cmd-G':()=>findNext(-1)
    }
  });
  codeEditor.on('changes',()=>{if(!editorRendering)changed();});
  codeEditor.on('cursorActivity',()=>{if(!editorRendering){updateStatus();rememberCursor();}});
  codeEditor.on('scroll',()=>{if(!editorRendering)rememberCursor();});
  return codeEditor;
}
function loadEditor(n){
  const cm=ensureEditor(),mode=editorModes[n.language]||'text/plain';
  let doc=editorDocuments.get(n.id);
  editorRendering=true;
  try{
    if(!doc){doc=new CodeMirror.Doc(n.content,mode);editorDocuments.set(n.id,doc);}
    else if(doc.getValue()!==n.content)doc.setValue(n.content);
    cm.operation(()=>{
      if(cm.getDoc()!==doc)cm.swapDoc(doc);
      cm.setOption('mode',mode);cm.setOption('readOnly',!!n.trashed);cm.setOption('lineWrapping',S.wrap);
      cm.refresh();
      const cursor=S.cursors[n.id];
      if(cursor){
        const start=doc.posFromIndex(cursor.start||0),end=doc.posFromIndex(cursor.end||0);
        doc.setSelection(cursor.backward?end:start,cursor.backward?start:end,{scroll:false});
        cm.scrollTo(cursor.left||0,cursor.top||0);
      }
    });
  }finally{editorRendering=false;}
}
function editorValue(){return codeEditor?.getValue()??current()?.content??'';}
function editorSelection(){
  if(!codeEditor)return {start:0,end:0};
  const doc=codeEditor.getDoc();
  return {start:doc.indexFromPos(doc.getCursor('from')),end:doc.indexFromPos(doc.getCursor('to'))};
}
function renderEditor(n){$('note-title').value=n.title;$('language').value=n.language;$('doc-eyebrow').textContent=n.trashed?'废纸篓 · 可在更多操作中恢复':n.kind==='knowledge'?'KNOWLEDGE · 从草稿中，留下可复用的结论':n.kind==='skill'?'SKILL · 把经验变成下一次的起点':n.archived?'已归档 · 原始记录始终保留':'DRAFT · 随手记下，让知识留下';$('tags').innerHTML=n.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('');$('document-date').textContent=`${date(n.createdAt,true)} 创建`;$('pin-button').classList.toggle('active',n.pinned);$('source-links').innerHTML=n.sourceIDs.map(id=>{const source=noteByID(id);return source?`<button class="source-link" data-action="openNote" data-id="${esc(id)}">${icon('link')}来源：${esc(source.title)}${source.trashed?'（废纸篓）':''}</button>`:'';}).join('');$('file-path').textContent=n.sourcePath||(n.sublimeOrigin?'Sublime 导入 · 独立副本':'');$('file-path').title=n.sourcePath||n.sublimeOrigin?.file||'';$('note-title').readOnly=n.trashed;$('wrap-status').textContent=S.wrap?'自动换行':'不换行';$('preview-toggle').textContent=S.preview?'返回编辑':'预览';$('editor-body').hidden=S.preview;$('markdown-preview').hidden=!S.preview;if(S.preview)$('markdown-preview').innerHTML=markdown(n.content);loadEditor(n);updateStatus();}
function rememberCursor(){
  const n=current();if(!n||!codeEditor||editorRendering||codeEditor.getDoc()!==editorDocuments.get(n.id))return;
  const selection=editorSelection(),scroll=codeEditor.getScrollInfo(),doc=codeEditor.getDoc();
  S.cursors[n.id]={...selection,top:scroll.top,left:scroll.left,backward:doc.indexFromPos(doc.getCursor('head'))===selection.start&&selection.start!==selection.end};
}
function updateStatus(){const n=current();if(!n)return;const prefix=editorValue().slice(0,editorSelection().start);$('cursor-position').textContent=`行 ${prefix.split('\n').length}，列 ${(prefix.split('\n').pop()||'').length+1}`;$('char-count').textContent=`${n.content.length.toLocaleString()} 字符`;$('save-status').textContent=S.dirty.has(n.id)?'正在保存…':'已保存到本机';$('save-dot').className='local-dot'+(S.dirty.has(n.id)?' dirty':'');}
function changed(){const n=current();if(!n||n.trashed)return;n.content=editorValue();n.title=$('note-title').value||'未命名草稿';n.language=$('language').value;n.updatedAt=Date.now()/1000;S.versions.set(n.id,(S.versions.get(n.id)||0)+1);S.dirty.add(n.id);clearTimeout(S.timers.get(n.id));S.timers.set(n.id,setTimeout(()=>guarded(flush)(n.id),450));if(codeEditor)codeEditor.setOption('mode',editorModes[n.language]||'text/plain');updateStatus();renderFiles();renderTabs();$('top-title').textContent=n.title;if(!$('find-bar').hidden)computeMatches();}
async function flush(id){clearTimeout(S.timers.get(id));S.timers.delete(id);if(!S.dirty.has(id))return S.chains.get(id);const n=noteByID(id);if(!n)return;const snapshot=JSON.parse(JSON.stringify(n));const version=S.versions.get(id);S.dirty.delete(id);const previous=S.chains.get(id)||Promise.resolve();const job=previous.catch(()=>{}).then(()=>rpc('saveNote',{note:snapshot})).then(saved=>{if(S.versions.get(id)===version){const i=S.notes.findIndex(n=>n.id===id);if(i>=0)S.notes[i]=saved;}renderFiles();renderTabs();updateStatus();return saved;}).catch(error=>{S.dirty.add(id);$('save-status').textContent='保存失败，请重试';$('save-dot').className='local-dot error';throw error;});S.chains.set(id,job);return job;}
async function flushAll(){for(const id of [...S.dirty])await flush(id);await Promise.all([...S.chains.values()]);await persistWorkspace();}
window.flushAllForClose=()=>{flushAll().then(()=>rpc('closeReady')).catch(e=>{toast(e.message,true);rpc('closeFailed');});return true;};
async function persistWorkspace(){rememberCursor();await rpc('saveWorkspace',{value:JSON.stringify({open:S.open,active:S.active,section:S.section,wrap:S.wrap,cursors:S.cursors})});}
async function refresh(){const data=await rpc('bootstrap');S.notes=data.notes;S.settings=data.settings;S.dataDirectory=data.dataDirectory;S.open=S.open.filter(id=>noteByID(id)&&!noteByID(id).trashed);if(!noteByID(S.active))S.active=null;render();return data;}
async function openNote(id){await flushAll();rememberCursor();const n=noteByID(id);if(!n)return;if(!S.open.includes(id))S.open.push(id);S.active=id;S.preview=n.kind!=='draft';S.section=n.trashed?'trash':n.kind==='draft'&&n.archived?'archived':n.kind;S.bulk=false;S.selected.clear();render();await persistWorkspace();}
async function newNote(content='',title='未命名草稿',language='text'){await flushAll();const now=Date.now()/1000;const note={id:uid(),title,content,kind:'draft',language,tags:[],summary:'',sourceIDs:[],pinned:false,archived:false,trashed:false,createdAt:now,updatedAt:now};const saved=await rpc('saveNote',{note});S.notes.unshift(saved);await openNote(saved.id);ensureEditor().focus();return saved;}
async function closeTab(id=S.active){if(!id)return;await flush(id);const index=S.open.indexOf(id);S.open=S.open.filter(i=>i!==id);if(S.active===id){S.active=S.open[Math.min(index,S.open.length-1)]||null;if(S.active){const n=current();S.section=n.archived&&n.kind==='draft'?'archived':n.kind;}}render();await persistWorkspace();}
async function switchSection(section){await flushAll();rememberCursor();S.section=section;S.bulk=false;S.selected.clear();if(section==='chat'){renderChat();}else if(section==='search'){renderSearch();}else{const notes=visibleNotes();if(!notes.some(n=>n.id===S.active)){S.active=notes[0]?.id||null;if(S.active&&!S.open.includes(S.active))S.open.push(S.active);}S.preview=section==='skill'||section==='knowledge';}render();await persistWorkspace();}
async function openFiles(){await flushAll();const result=await rpc('openFiles');if(result.cancelled)return;S.notes=result.notes;render();if(result.count){const newest=sortedNotes(S.notes)[0];if(newest)await openNote(newest.id);}toast(result.count?`已打开 ${result.count} 篇文本`:'没有新增文本，已有内容已自动去重');if(result.skipped.length)showSkipped(result.skipped);}
function sublimeImportModal(){
  S.sublimeImport={selected:new Set(),data:null,filter:'',request:0};
  modal('导入 Sublime 打开的文本',`<div class="info-box"><strong>把 Open Files 变成可沉淀的草稿</strong><br>读取所有 Sublime 窗口中的打开文本，包含未保存草稿与未保存的修改。导入为独立副本，保留来源，不改动 Sublime 原文。</div><div class="sublime-controls"><button class="primary" data-action="scanSublime">${icon('refresh')}实时读取当前内容</button><button class="quiet" data-action="scanSublimeSession">读取会话快照</button></div><p class="search-hint">首次实时读取会在 Sublime 中添加一个只导出打开文本的扩展。会话快照无需扩展，但可能落后于当前编辑内容。</p><div id="sublime-status" role="status" class="test-status">点击实时读取，预览当前打开的文本。</div><div id="sublime-results"></div>`,`<span class="proposal-footer-note" id="sublime-selection-caption">尚未读取</span><button class="quiet" data-action="closeModal">取消</button><button class="quiet" id="sublime-import-only" data-action="confirmSublimeImport" disabled>导入所选</button><button class="primary" id="sublime-import-archive" data-action="importSublimeAndArchive" disabled>导入并准备归档</button>`,true,'sublime');
}
async function scanSublime(mode='live'){
  const state=S.sublimeImport;if(!state||S.modalType!=='sublime')return;const request=++state.request;
  const status=$('sublime-status');status.className='test-status';status.textContent=mode==='live'?'正在读取 Sublime 当前打开的文本…':'正在读取 Sublime 会话快照…';
  document.querySelectorAll('.sublime-controls button').forEach(button=>button.disabled=true);
  $('sublime-import-only').disabled=true;$('sublime-import-archive').disabled=true;
  try{const data=await rpc('scanSublime',{mode});if(S.sublimeImport!==state||state.request!==request||S.modalType!=='sublime')return;
    state.data=data;state.selected=new Set(data.items.filter(item=>!item.duplicate).map(item=>item.id));
    status.textContent=`${data.mode==='live'?'实时内容':'会话快照'} · ${new Date(data.capturedAt*1000).toLocaleString('zh-CN')} · ${data.windowCount} 个窗口、${data.total} 个打开文本，${data.items.length} 篇可导入。${data.empty?`已忽略 ${data.empty} 篇空白。`:''}${data.mode==='session'?'快照可能未包含最近的编辑，请核对后导入。':''}`;
    $('sublime-results').innerHTML=`<div class="sublime-filter"><input id="sublime-filter" aria-label="筛选 Sublime 文本" placeholder="按标题、文件名或内容线索筛选…"><button class="quiet" data-action="sublimeSelectAll">全选筛选结果</button><button class="quiet" data-action="sublimeSelectNone">清空选择</button></div><div id="sublime-items" class="sublime-items"></div>${data.skipped.length?`<details class="import-skipped"><summary>${data.skipped.length} 项未能读取</summary>${data.skipped.map(text=>`<p>${esc(text)}</p>`).join('')}</details>`:''}`;
    $('sublime-filter').addEventListener('input',()=>{state.filter=$('sublime-filter').value;renderSublimeItems();});renderSublimeItems();
  }catch(error){if(S.sublimeImport!==state||state.request!==request||S.modalType!=='sublime')return;status.className='test-status error';status.textContent=error.message;updateSublimeSelection();}
  finally{if(S.sublimeImport===state&&S.modalType==='sublime')document.querySelectorAll('.sublime-controls button').forEach(button=>button.disabled=false);}
}
function filteredSublimeItems(){const state=S.sublimeImport,q=state.filter.trim().toLowerCase();return(state.data?.items||[]).filter(item=>!q||(item.title+' '+item.file+' '+item.excerpt).toLowerCase().includes(q));}
function renderSublimeItems(){
  const state=S.sublimeImport;$('sublime-items').innerHTML=filteredSublimeItems().map(item=>`<label class="sublime-item"><input type="checkbox" data-sublime-id="${esc(item.id)}" ${state.selected.has(item.id)?'checked':''}><div><div class="sublime-item-heading"><strong>${esc(item.title)}</strong>${item.unsaved?'<span class="tag">未保存</span>':''}${item.duplicate?'<span class="tag">已导入</span>':''}</div><div class="sublime-item-meta">窗口 ${item.window} · ${item.characters.toLocaleString()} 字符${item.file?' · '+esc(item.file):' · 未命名草稿'}</div><p>${esc(item.excerpt)}</p></div></label>`).join('')||'<div class="list-empty">没有匹配的文本。</div>';
  $('sublime-items').querySelectorAll('[data-sublime-id]').forEach(input=>input.addEventListener('change',()=>{input.checked?state.selected.add(input.dataset.sublimeId):state.selected.delete(input.dataset.sublimeId);updateSublimeSelection();}));updateSublimeSelection();
}
function updateSublimeSelection(){const state=S.sublimeImport,count=state?.selected.size||0;$('sublime-selection-caption').textContent=`已选 ${count} 篇 · 导入在本机完成`;$('sublime-import-only').disabled=!count;$('sublime-import-archive').disabled=!count;}
async function confirmSublimeImport(prepareArchive=false){
  const state=S.sublimeImport;if(!state?.data||!state.selected.size)return;await flushAll();
  $('sublime-import-only').disabled=true;$('sublime-import-archive').disabled=true;
  try{const result=await rpc('importSublime',{token:state.data.token,ids:[...state.selected]});S.notes=result.notes;closeModal();S.sublimeImport=null;
    const drafts=result.ids.filter(id=>{const note=noteByID(id);return note&&!note.archived&&!note.trashed;});S.section='draft';S.selected=new Set(drafts);S.bulk=!!drafts.length;
    if(drafts.length){S.active=drafts[0];if(!S.open.includes(S.active))S.open.push(S.active);S.preview=false;}
    render();await persistWorkspace();toast(`已导入 ${result.count} 篇，复用 ${result.duplicates} 篇已有副本`);
    if(prepareArchive&&drafts.length)await prepareBatchArchive(drafts);else if(prepareArchive)toast('所选内容已归档，可到「已归档草稿」查看');
  }catch(error){if(S.modalType==='sublime'){updateSublimeSelection();$('sublime-status').className='test-status error';$('sublime-status').textContent=error.message;}else throw error;}
}
async function prepareBatchArchive(ids){
  await flushAll();const plan=await rpc('planArchive',{ids});S.batchPlan={...plan,index:0};$('resume-batch').hidden=false;batchArchiveModal();
}
function batchArchiveModal(){const plan=S.batchPlan;if(!plan)return;const batch=plan.batches[plan.index],configured=!!(S.settings.baseURL&&S.settings.model);
  modal('分批归档',`<div class="archive-summary"><span class="large-icon">${icon('layers')}</span><div><strong>${plan.sourceCount} 篇草稿，分 ${plan.batches.length} 批提炼</strong><p>当前第 ${plan.index+1} / ${plan.batches.length} 批 · ${batch.count} 个文本片段 · ${batch.characters.toLocaleString()} 字符<br>超长文本已连续分段；每批先预览，确认后生成知识和 Skill。</p></div></div><div class="info-box">${configured?`使用 <strong>${esc(S.settings.model)}</strong> · ${esc(new URL(S.settings.baseURL).host)}<br>只发送当前批次内容${S.settings.redactSecrets?'，已开启常见凭证隐藏':''}。`:'请先配置公司模型，或使用本地规则生成待完善模板。'}<br>原稿完整保留。长文本的最后一段完成后，原稿才会标为已归档。</div><div class="archive-source-list">${batch.titles.map(title=>`<div>${icon('file')}${esc(title)}</div>`).join('')}</div>`,`<button class="quiet" data-action="closeModal">稍后继续</button><button class="quiet" data-action="batchLocal">本地整理模板</button>${configured?'<button class="primary" data-action="batchAI">'+icon('sparkles')+'提炼当前批次</button>':'<button class="primary" data-action="settings">配置公司模型</button>'}`,false,'batch');
}
async function extractBatch(local=false){
  const plan=S.batchPlan;if(!plan)return;const sequence=++S.extractionSeq,index=plan.index;
  modal('正在分批提炼',`<div class="loading-state"><div class="spinner"></div>正在整理第 ${index+1} / ${plan.batches.length} 批…<br><span class="search-hint">${local?'本地规则整理':'模型完成后显示预览；格式异常时自动修复重试 1 次'}，原始草稿已保存。</span></div>`,'',false,'loading');
  try{const result=await rpc('extractBatch',{token:plan.token,index,local});if(S.batchPlan!==plan||sequence!==S.extractionSeq||S.modalType!=='loading')return;S.proposal={...result,batchToken:plan.token,batchIndex:index};S.proposalTab='knowledge';proposalModal();}
  catch(error){if(S.batchPlan!==plan||sequence!==S.extractionSeq||S.modalType!=='loading')return;modal('本批提炼未完成',`<div class="info-box">${esc(error.message)}</div><p class="search-hint">本批原稿未被归档，已完成的产物保留。可重试本批，或返回调整。</p>`,`<button class="quiet" data-action="closeModal">稍后继续</button><button class="quiet" data-action="resumeBatch">返回当前批次</button><button class="primary" data-action="${local?'batchLocal':'batchAI'}">重试本批</button>`);}
}
function showSkipped(skipped){modal('打开结果',`<div class="info-box">以下文件未打开，其余内容已保存在草稿本。</div><div class="markdown">${skipped.map(s=>`<p>${esc(s)}</p>`).join('')}</div>`,`<button class="primary" data-action="closeModal">知道了</button>`);}
async function saveFile(saveAs=false){const n=current();if(!n)return;await flushAll();const result=await rpc('saveFile',{note:current(),saveAs});if(result.cancelled)return;S.notes[S.notes.findIndex(n=>n.id===S.active)]=result.note;render();toast('文本已保存：'+result.path.split('/').pop());}
async function mutate(fn){const n=current();if(!n)return;fn(n);S.versions.set(n.id,(S.versions.get(n.id)||0)+1);S.dirty.add(n.id);await flush(n.id);render();}
async function trash(){const n=current();if(!n)return;await mutate(n=>n.trashed=true);S.open=S.open.filter(id=>id!==n.id);S.active=visibleNotes()[0]?.id||null;render();closeModal();toast('已移到废纸篓，可在设置中恢复');}
function markdown(source){let content=String(source||'').replace(/\r\n/g,'\n');const blocks=[];content=content.replace(/```[^\n]*\n([\s\S]*?)```/g,(_,code)=>{blocks.push(`<pre><code>${esc(code.trimEnd())}</code></pre>`);return `\n\u0001${blocks.length-1}\u0001\n`;});if(content.startsWith('---\n'))content=content.replace(/^---\n([\s\S]*?)\n---/,(_,yaml)=>{blocks.push(`<pre class="frontmatter"><code>${esc(yaml)}</code></pre>`);return `\u0001${blocks.length-1}\u0001`;});const inline=text=>esc(text).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');let list=false,quote=false;const lines=content.split('\n'),out=[];for(const line of lines){const block=line.match(/^\u0001(\d+)\u0001$/);const li=line.match(/^\s*(?:[-*+] |\d+\. )(.*)$/);if(!li&&list){out.push('</ul>');list=false;}if(!line.startsWith('>')&&quote){out.push('</blockquote>');quote=false;}if(block){out.push(blocks[Number(block[1])]);continue;}if(/^#{1,6}\s/.test(line)){const m=line.match(/^(#{1,6})\s+(.*)$/);const level=Math.min(m[1].length,3);out.push(`<h${level}>${inline(m[2])}</h${level}>`);}else if(li){if(!list){out.push('<ul>');list=true;}out.push(`<li>${inline(li[1])}</li>`);}else if(line.startsWith('>')){if(!quote){out.push('<blockquote>');quote=true;}out.push(`<p>${inline(line.replace(/^>\s?/,''))}</p>`);}else if(/^---+$/.test(line.trim()))out.push('<hr>');else if(line.trim())out.push(`<p>${inline(line)}</p>`);}if(list)out.push('</ul>');if(quote)out.push('</blockquote>');return out.join('\n');}

let modelPicker=null;
function modal(title,body,footer='',wide=false,type='generic'){if(modelPicker){clearTimeout(modelPicker.timer);modelPicker=null;}$('modal-root').innerHTML=`<div class="modal-scrim"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${icon(type==='settings'?'settings':title.includes('归档')||title.includes('整理')?'sparkles':'notebook')}${esc(title)}</h2><button class="icon-button" data-action="closeModal" aria-label="关闭">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section></div>`;S.modalType=type;}
function closeModal(){if(modelPicker){clearTimeout(modelPicker.timer);modelPicker=null;}$('modal-root').innerHTML='';S.modalType=null;S.proposal=null;S.extractionSeq++;}
function settingsModal(){
  const p=S.settings;
  modal('模型与设置',`
    <section class="token-guide" aria-label="OneAPI 令牌使用引导"><strong>${p.hasKey?'管理你的 OneAPI 令牌':'首次连接公司 AI'}</strong><ol><li>打开 OneAPI 令牌页面，登录后获取个人令牌。</li><li>复制令牌，粘贴到下方并保存到本机。</li><li>从自动加载的列表选择模型，再保存设置。</li></ol><button class="quiet token-link" data-action="openTokenPage">${icon('link')}前往 OneAPI 获取令牌 ${icon('arrowRight')}</button><small>oneapi-comate.baidu-int.com/token</small></section>
    <div class="provider-presets"><button data-action="preset" data-id="company">公司 OneAPI</button><button data-action="preset" data-id="ollama">本机 Ollama</button></div>
    <label class="field">API 基础地址<input id="setting-url" placeholder="https://your-company-api.example.com/v1" value="${esc(p.baseURL)}" spellcheck="false"><small>支持 /v1 基础地址，也支持完整的 /chat/completions 地址。</small></label>
    <div class="field"><div class="token-caption"><label for="setting-key">API 令牌 / Token</label><span id="token-badge" class="token-badge ${p.hasKey?'saved':''}">${p.hasKey?'已保存到本机':'尚未保存'}</span></div><div class="token-input-row"><input id="setting-key" aria-label="API 令牌" type="password" placeholder="${p.hasKey?'已保存；留空继续使用，粘贴新令牌可替换':'粘贴从 OneAPI 获取的令牌'}" autocomplete="off" spellcheck="false"><button id="save-token" class="quiet" data-action="saveToken" disabled>${icon('save')}保存到本机</button></div><small id="token-storage-status" role="status" aria-live="polite">${p.hasKey?'令牌已保存在这台 Mac 的系统钥匙串，重启后会自动使用。':'点击「保存到本机」后，重启软件无需再次填写。令牌保存在系统钥匙串，不写入草稿和备份。本机 Ollama 可留空。'}</small></div>
    <div class="field"><label for="setting-model">模型</label><div class="model-picker"><select id="setting-model" aria-label="选择模型"></select><button id="refresh-models" class="quiet" data-action="refreshModels">${icon('refresh')}获取模型</button></div><small id="model-list-status" role="status" aria-live="polite">粘贴令牌后自动获取；请记得保存到本机，也可以点击「获取模型」。</small></div>
    <label class="field">接口格式<select id="setting-style"><option value="chat" ${p.apiStyle==='chat'||!p.apiStyle?'selected':''}>OpenAI · Chat Completions</option><option value="responses" ${p.apiStyle==='responses'?'selected':''}>OpenAI · Responses</option><option value="anthropic" ${p.apiStyle==='anthropic'?'selected':''}>Anthropic · Messages</option></select><small>OneAPI 透传原始协议，请选择该模型支持的接口。</small></label>
    <div class="field-row"><label class="field">用户名（可选）<input id="setting-username" value="${esc(p.username||'')}" placeholder="comate username"></label><label class="field">代码库（可选）<input id="setting-repo" value="${esc(p.repo||'')}" placeholder="repo"></label></div>
    <label class="check-label"><input id="setting-redact" type="checkbox" ${p.redactSecrets!==false?'checked':''}>调用模型前隐藏常见密钥、Authorization 和 Cookie。规则可能遗漏，请先检查草稿。</label>
    <label id="token-delete-option" class="check-label" ${p.hasKey?'':'hidden'}><input type="checkbox" id="setting-delete-key">删除本机保存的令牌</label>
    <button class="quiet" data-action="testConnection">${icon('link')}测试连接</button><div id="test-status" class="test-status"></div>
    <div class="divider"></div><div class="settings-tools"><button data-action="backup">${icon('save')}备份全部内容</button><button data-action="restore">${icon('history')}恢复备份</button><button data-action="trashView">${icon('trash')}废纸篓</button><button data-action="revealData">${icon('folder')}数据文件夹</button></div>
    <div class="settings-version">拾页 Shiye 1.1.0 · 本地 SQLite 存储<br>${esc(S.dataDirectory)}</div>`,
    `<button class="quiet" data-action="closeModal">取消</button><button id="save-settings" class="primary" data-action="saveSettings">保存设置</button>`,false,'settings');
  modelPicker={sequence:0,timer:null,models:[],loaded:false,busy:false,savingToken:false,baseURL:p.baseURL};
  renderModelOptions(modelPicker,p.model||'');
  for(const id of ['setting-url','setting-key','setting-username','setting-repo'])$(id).addEventListener('input',modelInputsChanged);
  $('setting-delete-key')?.addEventListener('change',modelInputsChanged);
  updateTokenState();
  if(p.hasKey||isLocalModelServer(p.baseURL))void refreshModels();
}
async function openTokenPage(){await rpc('openTokenPage');}
function updateTokenState(){
  const typed=$('setting-key').value.trim(),deleting=$('setting-delete-key')?.checked;
  const saved=S.settings.hasKey&&!deleting,busy=modelPicker?.savingToken;
  const badge=$('token-badge'),status=$('token-storage-status'),button=$('save-token');
  badge.className='token-badge'+(saved&&!typed?' saved':'');
  badge.textContent=busy?'正在保存…':typed?'新令牌待保存':saved?'已保存到本机':'尚未保存';
  status.className='';
  status.textContent=busy?'正在写入这台 Mac 的系统钥匙串…':typed?'新令牌尚未保存，点击「保存到本机」；底部「保存设置」也会保存令牌。':saved?'令牌已保存在这台 Mac 的系统钥匙串，重启后会自动使用。':deleting?'保存设置后会删除本机令牌。':'点击「保存到本机」后，重启软件无需再次填写。令牌保存在系统钥匙串，不写入草稿和备份。本机 Ollama 可留空。';
  button.disabled=busy||!typed||deleting;
}
async function saveToken(){
  const picker=modelPicker;if(!picker||picker.savingToken||S.modalType!=='settings')return;
  const key=$('setting-key').value.trim();if(!key)return;
  picker.savingToken=true;updateTokenState();$('save-settings').disabled=true;
  try{
    const result=await rpc('settings',{settings:readSettings(),key,deleteKey:false});
    S.settings=result;
    if(modelPicker!==picker||S.modalType!=='settings')return;
    if($('setting-key').value.trim()===key)$('setting-key').value='';
    picker.savingToken=false;updateTokenState();
    $('setting-key').placeholder='已保存；留空继续使用，粘贴新令牌可替换';
    $('workspace-caption').textContent=S.settings.model?'模型 · '+S.settings.model:'每一页，自动保存';
    toast('令牌已保存到本机，下次打开会自动使用');
    $('token-delete-option').hidden=false;
    void refreshModels();
  }catch(error){
    if(modelPicker!==picker||S.modalType!=='settings')return;
    picker.savingToken=false;updateTokenState();
    $('token-storage-status').className='error';$('token-storage-status').textContent='令牌未保存：'+error.message;
  }finally{
    if(modelPicker===picker&&S.modalType==='settings'){picker.savingToken=false;$('save-settings').disabled=false;$('save-token').disabled=!$('setting-key').value.trim()||$('setting-delete-key')?.checked;}
  }
}
function isLocalModelServer(baseURL){try{return ['localhost','127.0.0.1','[::1]'].includes(new URL(baseURL).hostname);}catch{return false;}}
function renderModelOptions(picker,selected=''){
  const select=$('setting-model');
  const previous=selected&&!picker.models.includes(selected)?`<option value="${esc(selected)}">${esc(selected)} · ${picker.loaded?'上次选择，列表未返回':'上次选择'}</option>`:'';
  select.innerHTML=`<option value="">${picker.busy?'正在获取模型…':picker.loaded&&!picker.models.length?'暂无可用模型':picker.models.length?'请选择模型':'请先获取模型列表'}</option>${previous}${picker.models.map(id=>`<option value="${esc(id)}">${esc(id)}</option>`).join('')}`;
  select.value=selected;
  select.disabled=!picker.models.length&&!selected;
  const button=$('refresh-models');button.disabled=picker.busy;
  button.innerHTML=`${icon('refresh')}${picker.busy?'获取中…':picker.loaded?'刷新模型':'获取模型'}`;
}
function modelInputsChanged(){
  const picker=modelPicker;if(!picker||S.modalType!=='settings')return;
  updateTokenState();
  clearTimeout(picker.timer);picker.sequence++;picker.busy=false;picker.loaded=false;picker.models=[];
  const baseURL=$('setting-url').value.trim(),selected=baseURL===picker.baseURL?$('setting-model').value:'';picker.baseURL=baseURL;
  renderModelOptions(picker,selected);$('test-status').textContent='';
  const status=$('model-list-status');status.className='';
  const sameServer=baseURL===S.settings.baseURL;
  const hasKey=$('setting-key').value.trim()||(S.settings.hasKey&&!$('setting-delete-key')?.checked&&sameServer);
  status.textContent=!sameServer&&!isLocalModelServer(baseURL)?'地址已更改，点击「获取模型」加载当前服务的列表。':hasKey||isLocalModelServer(baseURL)?'即将更新可用模型…':'粘贴令牌后自动获取；请记得保存到本机，也可以点击「获取模型」。';
  if((sameServer&&hasKey)||isLocalModelServer(baseURL))picker.timer=setTimeout(()=>void refreshModels(),650);
}
async function refreshModels(){
  const picker=modelPicker;if(!picker||S.modalType!=='settings')return;
  clearTimeout(picker.timer);const sequence=++picker.sequence;picker.busy=true;
  const args={settings:readSettings(),key:$('setting-key').value,deleteKey:$('setting-delete-key')?.checked||false};
  renderModelOptions(picker,$('setting-model').value);
  const status=$('model-list-status');status.className='';status.textContent='正在获取可用模型…';
  try{
    const models=await rpc('listModels',args);
    if(modelPicker!==picker||sequence!==picker.sequence||S.modalType!=='settings')return;
    picker.models=models;picker.loaded=true;picker.busy=false;
    renderModelOptions(picker,$('setting-model').value);
    status.textContent=models.length?`已获取 ${models.length} 个模型，选择后保存设置。`:'当前账号没有可用模型，请检查模型权限后刷新。';
  }catch(error){
    if(modelPicker!==picker||sequence!==picker.sequence||S.modalType!=='settings')return;
    picker.busy=false;renderModelOptions(picker,$('setting-model').value);status.className='error';status.textContent=error.message;
  }
}
function readSettings(){return {baseURL:$('setting-url').value.trim(),model:$('setting-model').value.trim(),redactSecrets:$('setting-redact').checked,hasKey:S.settings.hasKey,apiStyle:$('setting-style').value,username:$('setting-username').value.trim(),repo:$('setting-repo').value.trim()};}
async function saveSettings(){const settings=readSettings();S.settings=await rpc('settings',{settings,key:$('setting-key').value,deleteKey:$('setting-delete-key')?.checked||false});closeModal();$('workspace-caption').textContent=S.settings.model?'模型 · '+S.settings.model:'每一页，自动保存';toast(S.settings.hasKey?'设置已保存，令牌已保存在本机钥匙串':'模型设置已保存');}
async function testConnection(){const status=$('test-status');status.className='test-status';status.textContent='正在连接…';try{await rpc('testConnection',{settings:readSettings(),key:$('setting-key').value});status.textContent='连接成功，可以开始归档和对话。';}catch(e){status.className='test-status error';status.textContent=e.message;}}

async function archive(ids){await flushAll();S.archiveIDs=ids?.length?ids:[S.active].filter(Boolean);const notes=S.archiveIDs.map(noteByID).filter(n=>n&&!n.trashed);if(!notes.length){toast('请先写一篇草稿');return;}if(notes.length>20||notes.reduce((sum,n)=>sum+n.content.length,0)>44000)return prepareBatchArchive(notes.map(n=>n.id));const configured=!!(S.settings.baseURL&&S.settings.model);modal(notes.length>1?'聚合归档':'AI 归档',`<div class="archive-summary"><span class="large-icon">${icon('sparkles')}</span><div><strong>${notes.length>1?`把 ${notes.length} 篇草稿，串成一份经验。`:'把这页草稿，变成下一次的经验。'}</strong><p>提炼关键知识，沉淀可复用的操作流程。<br>生成后先预览，再决定归档内容。</p></div></div><div class="archive-options"><div class="archive-option"><span>${icon('book')}知识卡片</span><p>背景、结论、关键代码与待确认事项。方便以后搜索、问答。</p></div><div class="archive-option"><span>${icon('code')}SKILL.md</span><p>适用场景、前置条件、操作步骤与验证方法。可导出复用。</p></div></div><div class="info-box">${configured?`使用 <strong>${esc(S.settings.model)}</strong> · ${esc(new URL(S.settings.baseURL).host)}<br>发送所选草稿的标题和正文。${S.settings.redactSecrets?'已开启常见凭证隐藏。':'当前未开启凭证隐藏。'}`:'还没有配置公司模型。请在设置中获取并保存 OneAPI 令牌，再选择模型；也可以先使用本地整理模板。'}<br>原始文本保留，归档不会执行任何命令。</div><div class="section-eyebrow">本次来源 · ${notes.length} 篇</div><div class="archive-source-list">${notes.map(n=>`<div>${icon('file')}${esc(n.title)}<span class="tag">${n.content.length.toLocaleString()} 字符</span></div>`).join('')}</div>`,`<button class="quiet" data-action="extractLocal">本地整理模板</button>${configured?'<button class="primary" data-action="extractAI">'+icon('sparkles')+'开始 AI 提炼</button>':'<button class="primary" data-action="settings">配置公司模型</button>'}`,false,'archive');}
async function extract(local=false){const seq=++S.extractionSeq;const ids=[...S.archiveIDs];modal(local?'本地整理':'AI 正在提炼',`<div class="loading-state"><div class="spinner"></div>${local?'正在整理草稿线索…':'正在梳理知识与可复用的流程…'}<br><span class="search-hint">${local?'本地规则生成模板，不调用模型。':'复杂内容可能需要几分钟；格式异常时会自动修复重试 1 次。'}</span></div>`,'',false,'loading');try{const result=await rpc('extract',{ids,local});if(S.modalType!=='loading'||seq!==S.extractionSeq)return;S.proposal=result;S.proposalTab='knowledge';proposalModal();}catch(e){if(S.modalType!=='loading'||seq!==S.extractionSeq)return;modal('整理未完成',`<div class="info-box">${esc(e.message)}</div><p class="search-hint">草稿已保存。你可以调整模型设置，或先生成本地模板。</p>`,`<button class="quiet" data-action="extractLocal">本地整理模板</button><button class="primary" data-action="retryArchive">返回</button>`);}}
function proposalModal(){const result=S.proposal,p=result.proposal;modal('检查归档结果',`${result.batchToken?`<div class="batch-progress">第 ${result.batchIndex+1} / ${S.batchPlan.batches.length} 批 · 预览后归档</div>`:''}<h3 class="proposal-title">${esc(p.title)}</h3><div class="proposal-summary">${esc(p.summary)}</div><div>${p.tags.map(t=>`<span class="tag">${esc(t)}</span> `).join('')}<span class="tag">${p.method==='ai'?'AI 提炼':'本地规则 · 待完善模板'}</span></div><div class="proposal-tabs"><button data-action="proposalTab" data-id="knowledge" class="${S.proposalTab==='knowledge'?'active':''}">${icon('book')}知识卡片</button><button data-action="proposalTab" data-id="skill" class="${S.proposalTab==='skill'?'active':''}">${icon('code')}SKILL.md</button><button class="quiet" data-action="copyProposal" style="margin-left:auto">复制内容</button></div><article class="proposal-preview markdown">${markdown(p[S.proposalTab])}</article><div class="archive-checks"><label class="check-label"><input id="accept-knowledge" type="checkbox" checked>生成知识卡片</label><label class="check-label"><input id="accept-skill" type="checkbox" ${p.method==='ai'?'checked':''}>生成 Skill</label></div>`,`<span class="proposal-footer-note">${p.deferArchiveIDs?.length?'本批来源含长文本分段，后续片段完成后再标记原稿。':p.sourceIDs.length+' 篇原稿会标为已归档，并保留来源关联。'}</span><button class="quiet" data-action="closeModal">暂不归档</button><button class="primary" data-action="acceptProposal">${icon('check')}确认归档</button>`,true,'proposal');S.proposal=result;}
async function acceptProposal(){const knowledge=$('accept-knowledge').checked,skill=$('accept-skill').checked;if(!knowledge&&!skill){toast('至少选择一项归档产物',true);return;}await flushAll();const proposal=S.proposal,result=await rpc('acceptProposal',{token:proposal.token,knowledge,skill});S.notes=result.notes;closeModal();S.selected.clear();S.bulk=false;await openNote(result.created[0].id);toast(`已沉淀 ${result.created.length} 份内容，原稿已保留`);if(proposal.batchToken&&S.batchPlan?.token===proposal.batchToken){S.batchPlan.index++;if(S.batchPlan.index<S.batchPlan.batches.length)batchArchiveModal();else{S.batchPlan=null;$('resume-batch').hidden=true;toast('全部批次已完成，知识与 Skills 已保存');}}}

function renderSearch(){if($('search-panel').dataset.initialized)return;$('search-panel').dataset.initialized='true';$('search-panel').innerHTML=`<div class="search-content"><div class="section-eyebrow">FIND A THREAD. FOLLOW AN IDEA.</div><h1>那些记过的，都能再找到。</h1><div class="big-search">${icon('search')}<input id="global-search" aria-label="搜索全部内容" placeholder="搜索服务名、命令、会议关键词…" spellcheck="false"><kbd>ESC</kbd></div><div class="search-hint" id="search-caption">搜索草稿、知识和 Skills 的标题、正文与标签。支持中文关键词。</div><div id="search-results"></div></div>`;$('global-search').addEventListener('input',()=>{clearTimeout(renderSearch.timer);renderSearch.timer=setTimeout(guarded(runSearch),180);});setTimeout(()=>$('global-search').focus(),50);}
async function runSearch(){const query=$('global-search').value.trim(),seq=++S.searchSeq;if(!query){$('search-results').innerHTML='';$('search-caption').textContent='搜索草稿、知识和 Skills 的标题、正文与标签。支持中文关键词。';return;}const hits=await rpc('search',{query});if(seq!==S.searchSeq)return;$('search-caption').textContent=`找到 ${hits.length} 条相关内容 · 按匹配程度排序`;$('search-results').innerHTML=hits.length?hits.map(hit=>`<div class="search-result" data-action="openNote" data-id="${esc(hit.note.id)}" role="button" tabindex="0"><div class="result-heading">${icon(kindIcons[hit.note.kind])}<strong>${esc(hit.note.title)}</strong><span class="tag">${labels[hit.note.kind]}</span></div><p>${esc(hit.excerpt)}</p><div class="result-meta">${hit.note.tags.map(t=>`<span># ${esc(t)}</span>`).join('')}<span>${date(hit.note.updatedAt,true)}</span></div></div>`).join(''):'<div class="list-empty">没有找到相关内容。试试较短的关键词，或具体的命令名称。</div>';}
function renderChat(){const messages=S.chat.map((m,i)=>`<div class="message ${m.role}"><div class="message-label">${icon(m.role==='user'?'user':'sparkles')}${m.role==='user'?'你':m.mode==='retrieval'?'本地检索':'拾页 · 基于你的记录'}</div><div class="message-body ${m.role==='assistant'?'markdown':''}">${m.role==='user'?esc(m.content):markdown(m.content)}</div>${m.sources?.length?`<div class="message-sources">${m.sources.map((hit,j)=>`<button class="source-chip" data-action="openNote" data-id="${esc(hit.note.id)}">[${j+1}] ${esc(hit.note.title)}</button>`).join('')}</div>`:''}${m.error?'<button class="quiet" data-action="retryChat">重试</button>':''}</div>`).join('');$('chat-panel').innerHTML=`${S.chat.length?`<div class="chat-messages" id="chat-messages">${messages}${S.chatBusy?'<div class="message"><div class="message-label">'+icon('sparkles')+'正在检索与思考…</div></div>':''}</div>`:`<div class="chat-intro">${icon('sparkles')}<div class="section-eyebrow">YOUR NOTES. YOUR ANSWERS.</div><h1>问问过去的自己。</h1><p>从草稿、知识卡片和 Skills 中找回线索。<br>每个答案，都能回到记录它的那一页。</p><div class="prompt-chips"><button data-action="prompt" data-text="pdo2 日志排查">pdo2 日志排查</button><button data-action="prompt" data-text="curl 接口请求">curl 接口请求</button><button data-action="prompt" data-text="会议待办">会议里有哪些待办？</button></div></div>`}<div class="chat-compose"><div class="compose-box"><textarea id="chat-input" aria-label="向知识库提问" placeholder="在自己的记录中，找一个答案…" ${S.chatBusy?'disabled':''}></textarea><button class="primary" data-action="sendChat" aria-label="发送问题" ${S.chatBusy?'disabled':''}>${icon('send')}</button></div><div class="compose-caption"><span>${S.settings.model?esc(S.settings.model)+' · 发送问题和最多 6 篇匹配笔记'+(S.settings.redactSecrets?'，常见凭证自动隐藏':''):'本地检索可直接使用 · 配置公司模型后生成带来源的回答'}</span><span>↵ 发送 · ⇧↵ 换行</span></div>${S.chat.length?'<button class="text-button" data-action="clearChat" style="margin-top:9px">清空本次对话</button>':''}</div>`;$('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();guarded(sendChat)();}});if($('chat-messages'))$('chat-messages').scrollTop=$('chat-messages').scrollHeight;}
async function sendChat(question){if(S.chatBusy)return;question=(question||$('chat-input')?.value||'').trim();if(!question)return;await flushAll();const history=S.chat.filter(m=>!m.error).map(m=>({role:m.role,content:m.content}));S.chat.push({role:'user',content:question});S.chatBusy=true;renderChat();try{const result=await rpc('chat',{question,history});S.chat.push({role:'assistant',content:result.answer,sources:result.sources,mode:result.mode});}catch(e){S.chat.push({role:'assistant',content:e.message,error:true});}finally{S.chatBusy=false;renderChat();$('chat-input').focus();}}
function quickOpen(){S.quickIndex=0;modal('快速切换',`<input class="quick-input" id="quick-input" placeholder="输入标题、服务名或正文关键词…" aria-label="快速切换搜索"><div id="quick-list" class="quick-list"></div>`,'',false,'quick');$('quick-input').addEventListener('input',()=>{S.quickIndex=0;renderQuick();});$('quick-input').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();S.quickIndex=Math.max(0,Math.min(S.quickResults.length-1,S.quickIndex+(e.key==='ArrowDown'?1:-1)));renderQuick(false);}if(e.key==='Enter'&&S.quickResults[S.quickIndex]){const id=S.quickResults[S.quickIndex].id;closeModal();guarded(openNote)(id);}});renderQuick();$('quick-input').focus();}
function renderQuick(filter=true){if(filter){const q=$('quick-input').value.toLowerCase();S.quickResults=sortedNotes(S.notes.filter(n=>!n.trashed&&(!q||(n.title+' '+n.content+' '+n.tags.join(' ')).toLowerCase().includes(q)))).slice(0,40);}$('quick-list').innerHTML=S.quickResults.map((n,i)=>`<button class="quick-item ${i===S.quickIndex?'selected':''}" data-action="quickSelect" data-id="${esc(n.id)}">${icon(kindIcons[n.kind])}<span>${esc(n.title)}</span><small>${labels[n.kind]}</small></button>`).join('')||'<div class="list-empty">没有匹配的草稿</div>';document.querySelector('.quick-item.selected')?.scrollIntoView({block:'nearest'});}
function showFind(){$('find-bar').hidden=false;const selected=codeEditor?.getSelection();if(selected)$('find-input').value=selected;codeEditor?.refresh();$('find-input').focus();computeMatches();}
function computeMatches(){const query=$('find-input').value;S.findMatches=[];if(query){const text=editorValue().toLowerCase(),q=query.toLowerCase();let index=0;while((index=text.indexOf(q,index))>=0){S.findMatches.push(index);index+=q.length;}}S.findIndex=Math.max(0,Math.min(S.findIndex,S.findMatches.length-1));$('find-count').textContent=S.findMatches.length?`${S.findIndex+1} / ${S.findMatches.length}`:'0 个';}
function findNext(delta=1){computeMatches();if(!S.findMatches.length||!codeEditor)return;S.findIndex=(S.findIndex+delta+S.findMatches.length)%S.findMatches.length;const start=S.findMatches[S.findIndex],cm=codeEditor,doc=cm.getDoc();cm.focus();doc.setSelection(doc.posFromIndex(start),doc.posFromIndex(start+$('find-input').value.length));cm.scrollIntoView({from:doc.posFromIndex(start),to:doc.posFromIndex(start+$('find-input').value.length)},60);$('find-count').textContent=`${S.findIndex+1} / ${S.findMatches.length}`;updateStatus();}
function replace(all=false){
  if(!current()||current().trashed||!codeEditor)return;
  const q=$('find-input').value,r=$('replace-input').value;if(!q)return;
  const cm=codeEditor,doc=cm.getDoc();
  if(all){
    computeMatches();const matches=[...S.findMatches];
    cm.operation(()=>{for(let i=matches.length-1;i>=0;i--)doc.replaceRange(r,doc.posFromIndex(matches[i]),doc.posFromIndex(matches[i]+q.length),'replaceAll');});
  }else{
    if(cm.getSelection().toLowerCase()!==q.toLowerCase()){findNext(0);return;}
    cm.focus();cm.replaceSelection(r,'end','+input');
  }
  computeMatches();
}
function moreMenu(){document.querySelector('.menu-popover')?.remove();const n=current();if(!n)return;const menu=document.createElement('div');menu.className='menu-popover';menu.innerHTML=`<button data-action="saveAs">${icon('save')}${n.kind==='skill'?'导出 SKILL.md':'另存为文本'}</button><button data-action="history">${icon('history')}历史版本</button><button data-action="duplicate">${icon('layers')}复制为新草稿</button><button data-action="${n.trashed?'restoreNote':'trash'}" class="${n.trashed?'':'danger'}">${icon(n.trashed?'history':'trash')}${n.trashed?'从废纸篓恢复':'移到废纸篓'}</button>`;document.body.appendChild(menu);}
async function historyModal(){await flushAll();const revisions=await rpc('revisions',{id:S.active});S.revisions=revisions;modal('历史版本',`<div class="info-box">编辑前的内容会定期保留，最多 50 份。恢复会先保留当前内容。</div>${revisions.length?revisions.map((r,i)=>`<div class="revision-item"><div><span>${new Date(r.createdAt*1000).toLocaleString('zh-CN')}</span><button class="quiet" data-action="restoreRevision" data-id="${i}">恢复此版本</button></div><p>${esc(r.note.content.slice(0,800))}</p></div>`).join(''):'<p class="search-hint">还没有历史版本。继续编辑后会自动保留。</p>'}`);}
function tagsModal(){const n=current();if(!n)return;modal('编辑标签',`<label class="field">用逗号分隔<input id="tags-input" value="${esc(n.tags.join('，'))}" placeholder="运维排查，API，会议"><small>标签会参与本地搜索，AI 归档时也会自动提炼标签。</small></label>`,`<button class="quiet" data-action="closeModal">取消</button><button class="primary" data-action="saveTags">保存</button>`);$('tags-input').focus();}
function help(){modal('使用拾页',`<div class="markdown"><h2>先把它当成草稿本</h2><p>⌘N 新建、⌘O 打开文本、⌘S 保存到文件。所有草稿（包括未命名文本）也会自动保存在本机，重新打开应用可继续写。</p><h2>导入 Sublime</h2><p>点击侧栏「导入 Sublime」，实时读取所有窗口中的打开文本，包含未保存草稿。勾选后导入，或导入并准备分批归档。每批预览后确认，原稿保留。会话快照无需扩展，但可能有延迟。</p><h2>一键沉淀知识</h2><p>点击 AI 归档，预览提炼结果，再生成知识卡片和 Skill。点侧栏叠页图标，可以多选草稿聚合整理。原始记录保留在“已归档草稿”。</p><h2>找回线索</h2><p>⌘P 快速切换；⇧⌘F 搜索全部正文、标题与标签；⌘J 与知识对话。回答可点击来源回到原文。</p><h2>接入公司模型</h2><p>⌘, 点击设置里的「前往 OneAPI 获取令牌」，登录后获取并复制个人令牌。粘贴到软件并点击「保存到本机」，令牌保存在 Mac 系统钥匙串，重启后自动使用。随后从列表选择模型及其接口格式。支持 Chat Completions、Responses 和 Anthropic Messages。默认隐藏常见凭证。特殊鉴权或协议需额外适配，尚未连接时本地搜索照常可用。</p><h2>常用快捷键</h2><p>⌘F 查找替换 · ⇧⌘S 另存为 · ⇧⌘K AI 归档 · ⌘W 关闭标签 · Tab 缩进 · ⌘/ 切换行注释。</p><h2>数据与备份</h2><p>设置中可备份为 JSON、恢复备份或查看废纸篓。备份包含草稿和知识，不包含模型密钥。对话只保留在本次应用会话。</p></div>`,`<button class="primary" data-action="closeModal">开始使用</button>`,false,'help');}
async function sample(){await newNote('# 接口超时排查 · 随手记\n\n现象：请求偶发超时，先检查服务日志与上游响应。\n\n# 在实际环境中替换服务组和时间\npdo2 -M -bns <service-group> -y -q -show row -r 50 "grep -i \'timeout\' ./log/service/service.log.wf.<date>*"\n\n# 保留请求示例，密钥用环境变量提供\ncurl -s \'https://api.example.com/health\' \\\n  -H "Authorization: Bearer $API_TOKEN"\n\n排查线索：\n- 对照 access.log 的 request_id 查调用链\n- 记录错误码、发生时间和影响范围\n- 当前只是排查记录，根因还需要确认\n\n会议待办：\n- 补充超时监控阈值，负责人和日期待确认\n','接口超时排查 · 示例','shell');}

const actions={
  importSublime:sublimeImportModal,scanSublime:()=>scanSublime('live'),scanSublimeSession:()=>scanSublime('session'),
  sublimeSelectAll:()=>{filteredSublimeItems().forEach(item=>S.sublimeImport.selected.add(item.id));renderSublimeItems();},sublimeSelectNone:()=>{S.sublimeImport.selected.clear();renderSublimeItems();},confirmSublimeImport:()=>confirmSublimeImport(false),importSublimeAndArchive:()=>confirmSublimeImport(true),batchAI:()=>extractBatch(false),batchLocal:()=>extractBatch(true),resumeBatch:batchArchiveModal,
  new:()=>newNote(),sample,open:openFiles,saveFile:()=>saveFile(false),saveAs:()=>saveFile(true),
  openNote:el=>openNote(el.dataset.id),closeTab:el=>closeTab(el?.dataset?.id||S.active),
  section:el=>switchSection(el.dataset.id),search:async()=>{await switchSection('search');$('global-search').focus();},chat:()=>switchSection('chat'),
  settings:settingsModal,saveSettings,testConnection,refreshModels,openTokenPage,saveToken,
  preset:el=>{$('setting-url').value=el.dataset.id==='ollama'?'http://localhost:11434/v1':'https://oneapi-comate.baidu-int.com/v1';$('setting-style').value='chat';modelInputsChanged();},
  pin:()=>mutate(n=>n.pinned=!n.pinned),tags:tagsModal,saveTags:async()=>{const tags=$('tags-input').value.split(/[,，\n]/).map(t=>t.trim()).filter(Boolean);await mutate(n=>n.tags=tags);closeModal();},
  preview:()=>{rememberCursor();S.preview=!S.preview;render();},wrap:()=>{rememberCursor();S.wrap=!S.wrap;render();persistWorkspace();},
  archive:()=>archive(),archiveSelection:()=>archive([...S.selected]),retryArchive:()=>archive(S.archiveIDs),extractLocal:()=>extract(true),extractAI:()=>extract(false),
  bulk:()=>{S.bulk=!S.bulk;if(!S.bulk)S.selected.clear();renderFiles();},selectAll:()=>{const ids=visibleNotes().map(n=>n.id),all=ids.length&&ids.every(id=>S.selected.has(id));S.selected=all?new Set():new Set(ids);renderFiles();},selectNote:el=>{const id=el.dataset.id;S.selected.has(id)?S.selected.delete(id):S.selected.add(id);renderFiles();},
  proposalTab:el=>{const knowledge=$('accept-knowledge').checked,skill=$('accept-skill').checked;S.proposalTab=el.dataset.id;proposalModal();$('accept-knowledge').checked=knowledge;$('accept-skill').checked=skill;},
  acceptProposal,copyProposal:async()=>{await rpc('copy',{text:S.proposal.proposal[S.proposalTab]});toast('已复制');},closeModal,
  backup:async()=>{await flushAll();const r=await rpc('backup');if(!r.cancelled)toast('全部内容已备份');},restore:async()=>{await flushAll();const r=await rpc('restore');if(!r.cancelled){S.notes=r.notes;closeModal();render();toast(`已恢复 ${r.count} 篇内容，较新的本地版本已保留`);}},
  trashView:async()=>{closeModal();await switchSection('trash');},revealData:()=>rpc('revealData'),
  sendChat:()=>sendChat(),prompt:el=>sendChat(el.dataset.text),clearChat:()=>{S.chat=[];renderChat();},retryChat:()=>{const last=[...S.chat].reverse().find(m=>m.role==='user');if(last){S.chat.pop();S.chat.pop();return sendChat(last.content);}},
  quickOpen,quickSelect:async el=>{const id=el.dataset.id;closeModal();await openNote(id);},find:showFind,closeFind:()=>{$('find-bar').hidden=true;codeEditor?.refresh();codeEditor?.focus();},findPrevious:()=>findNext(-1),findNext:()=>findNext(1),replace:()=>replace(false),replaceAll:()=>replace(true),
  more:moreMenu,history:historyModal,trash,restoreNote:async()=>{await mutate(n=>n.trashed=false);const n=current();S.section=n.archived&&n.kind==='draft'?'archived':n.kind;render();toast('已恢复');},
  duplicate:async()=>{const n=current();if(n)await newNote(n.content,n.title+' · 副本',n.language);},
  restoreRevision:async el=>{const r=S.revisions[Number(el.dataset.id)];if(!r)return;const restored=await rpc('restoreRevision',{id:S.active,revisionID:r.id});S.notes[S.notes.findIndex(n=>n.id===S.active)]=restored;closeModal();render();toast('已恢复历史内容，编辑前版本也已保留');},help
};
window.appCommand=name=>{if(S.modalType&&name!=='settings'&&name!=='help')closeModal();return guarded(actions[name]||(()=>{}))();};
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');const menu=document.querySelector('.menu-popover');if(menu&&!e.target.closest('.menu-popover')&&!e.target.closest('[data-action=more]'))menu.remove();if(!el)return;e.preventDefault();e.stopPropagation();if(el.disabled)return;if(e.target.closest('.menu-popover'))menu?.remove();const action=actions[el.dataset.action];if(action)guarded(action)(el);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(S.modalType)closeModal();else if(!$('find-bar').hidden)$('find-bar').hidden=true;else if(S.section==='search')guarded(switchSection)('draft');document.querySelector('.menu-popover')?.remove();}if(e.key==='Enter'&&e.target.classList.contains('file-item')){e.preventDefault();guarded(openNote)(e.target.dataset.id);}});
$('note-title').addEventListener('input',changed);$('language').addEventListener('change',changed);
$('find-input').addEventListener('input',()=>{S.findIndex=0;computeMatches();});$('find-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findNext(e.shiftKey?-1:1);}});
window.addEventListener('resize',()=>codeEditor?.refresh());
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(codeEditor&&!S.preview)codeEditor.refresh();}).observe($('editor-host'));
window.addEventListener('unhandledrejection',e=>{e.preventDefault();toast(e.reason?.message||'操作未完成',true);});

async function boot(){fillIcons();try{const data=await rpc('bootstrap');S.notes=data.notes;S.settings=data.settings;S.dataDirectory=data.dataDirectory;let workspace={};try{workspace=JSON.parse(data.workspace);}catch{}S.open=(workspace.open||[]).filter(id=>noteByID(id)&&!noteByID(id).trashed);S.active=noteByID(workspace.active)?workspace.active:null;S.section=workspace.section||'draft';S.wrap=workspace.wrap||false;S.cursors=workspace.cursors||{};if(!S.active&&S.notes.some(n=>!n.trashed)){const n=sortedNotes(S.notes.filter(n=>!n.trashed))[0];S.active=n.id;S.open.push(n.id);S.section=n.kind;}S.preview=S.section==='knowledge'||S.section==='skill';if(S.section==='chat')renderChat();if(S.section==='search')renderSearch();$('workspace-caption').textContent=S.settings.model?'模型 · '+S.settings.model:'每一页，自动保存';render();}catch(e){toast(e.message,true);}}
boot();
