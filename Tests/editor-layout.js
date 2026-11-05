const passed=[];
const check=(condition,message)=>{if(!condition)throw Error(message);};
// WebKit can round a glyph edge by one CSS pixel across separate color runs.
const near=(actual,expected,message)=>check(Math.abs(actual-expected)<=1.25,`${message}: ${actual} != ${expected}`);
const editor=$('editor'),highlightLayer=$('highlight'),viewport=$('highlight-viewport'),gutter=$('line-number-content');
const command='pdo2 -M -bns group.flow-example-go-common.pandora.all -y -q -show row -r 50 "grep -i anti_center ./log/service/service.log.wf.20260803*"';
const fixture='call anti_center error:\n\n'+Array(6).fill(command+'\n').join('\n')+'\ncurl -s \'https://example.com/service/inbound?method=updateUsefulTag&format=json\' \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"result":"测试中文😀","score":7}\'\n';
const note={id:'isolated-editor-layout',title:'Editor layout fixture',content:fixture,language:'shell',kind:'draft',tags:[],sourceIDs:[],createdAt:1,updatedAt:1};
S.notes=[note];S.active=note.id;S.open=[note.id];S.preview=false;S.section='draft';
rpc=async(action,args)=>action==='saveNote'?args.note:true;
const textOfHighlight=()=>[...highlightLayer.children].map(line=>line.textContent).join('\n');
function verifyScroll(){
  const transform=new DOMMatrix(getComputedStyle(highlightLayer).transform),numbers=new DOMMatrix(getComputedStyle(gutter).transform);
  near(viewport.clientWidth,editor.clientWidth,'highlight viewport width');
  near(viewport.clientHeight,editor.clientHeight,'highlight viewport height');
  near(transform.m41,-editor.scrollLeft,'horizontal scroll');near(transform.m42,-editor.scrollTop,'vertical scroll');
  near(numbers.m42,-editor.scrollTop,'gutter scroll');
}
function textRect(root,index,length=1){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,offset=index;
  while((node=walker.nextNode())){if(offset<node.length){const range=document.createRange();range.setStart(node,offset);range.setEnd(node,Math.min(node.length,offset+length));return range.getBoundingClientRect();}offset-=node.length;}
  throw Error('Missing rendered character '+index);
}
function verifyTextGeometry(){
  check(textOfHighlight()===editor.value,'highlight must preserve every character and newline');
  const style=getComputedStyle(editor),mirror=document.createElement('div');
  for(const property of ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','tabSize','whiteSpace','overflowWrap','wordBreak','fontKerning','fontVariantLigatures','padding','textAlign'])mirror.style[property]=style[property];
  Object.assign(mirror.style,{position:'absolute',left:'-10000px',top:'0',width:editor.clientWidth+'px',height:'auto',boxSizing:'border-box'});
  mirror.textContent=editor.value+'\u200b';document.body.append(mirror);
  try{
    const origin=mirror.getBoundingClientRect(),highlightOrigin=highlightLayer.getBoundingClientRect();
    let offset=0;for(const [lineIndex,line] of editor.value.split('\n').entries()){
      const rendered=highlightLayer.children[lineIndex];
      near(gutter.children[lineIndex].getBoundingClientRect().height,rendered.getBoundingClientRect().height,'gutter row height');
      for(let column=0;column<line.length;column++){
        const length=line.codePointAt(column)>0xffff?2:1;
        const actual=textRect(rendered,column,length),expected=textRect(mirror,offset+column,length);
        near(actual.x-highlightOrigin.x,expected.x-origin.x,`column ${lineIndex+1}:${column+1}`);
        near(actual.y-highlightOrigin.y,expected.y-origin.y,`baseline ${lineIndex+1}:${column+1}`);
        column+=length-1;
      }offset+=line.length+1;
    }
    near(editor.scrollHeight,Math.max(editor.clientHeight,mirror.getBoundingClientRect().height),'native textarea content height');
  }finally{mirror.remove();}
}
render();
for(const [left,top] of [[0,0],[80,35],[100000,100000]]){editor.scrollLeft=left;editor.scrollTop=top;syncScroll();verifyScroll();verifyTextGeometry();}
check(editor.scrollWidth>editor.clientWidth,'fixture must exercise native horizontal scrolling');
passed.push('长命令、横向滚动条及滚动到底时的光标层、高亮层和行号同步');
S.wrap=true;render();verifyScroll();verifyTextGeometry();
check(editor.wrap==='soft','native textarea must enable wrapping');
passed.push('自动换行时中英文、emoji 和长命令逐字位置一致');
document.querySelector('.code-surface').style.flex='0 0 340px';updateLineNumbers();verifyScroll();verifyTextGeometry();
editor.scrollTop=100000;syncScroll();verifyScroll();verifyTextGeometry();
passed.push('缩窄窗口后换行高度、行号和滚动范围同步');
S.wrap=false;note.language='markdown';note.content='# Markdown heading with ffi =>\n\t缩进与中文😀\n\n```sh\ncurl -H \'X-Test: 1\' https://example.com\n```\n';render();verifyTextGeometry();verifyScroll();
passed.push('Markdown 标题、Tab、空行和末尾换行不改变字体宽度');
editor.focus();const position=editor.value.indexOf('curl');editor.setSelectionRange(position,position);editor.setRangeText('test-',position,position,'end');editor.dispatchEvent(new Event('input',{bubbles:true}));
check(editor.value.slice(position,position+9)==='test-curl','insertion must occur at the selected text position');verifyScroll();verifyTextGeometry();
passed.push('指定位置插入文本后正文、高亮和光标保持一致');
return passed;
