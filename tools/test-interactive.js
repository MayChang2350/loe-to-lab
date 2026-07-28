/* Does anything invisible cover the page after the map is dismissed?
   This is the bug class that broke every button and slider once already:
   a transparent position:fixed inset:0 layer left in the document.
   Run: node tools/test-interactive.js */
/* Simulates the click-blocking question a browser would answer:
   after the map is dismissed, is there anything left covering the page?     */
const fs=require('fs'),path=require('path'),vm=require('vm');
const {makeDocument}=require('./domshim.js');
const root=path.join(__dirname,'..');
const doc=makeDocument(fs.readFileSync(path.join(root,'index.html'),'utf8'));
const store={};
const sb={document:doc,window:null,localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>store[k]=v},
 requestAnimationFrame:f=>{if(f&&f.name!=='animate')f();return 0;},cancelAnimationFrame:()=>{},setTimeout:f=>{f();return 1},clearTimeout:()=>{},
 matchMedia:()=>({matches:false}),console,Math,Date,JSON,Number,String,Array,Object,Intl,isFinite,parseInt,parseFloat,NaN,Infinity};
sb.window=sb;sb.self=sb;sb.addEventListener=()=>{};sb.removeEventListener=()=>{};
vm.createContext(sb);
['data/i18n.js','data/molecules.js','data/pathway.js','data/deepdive.js','data/dossierTemplates.js','data/protocol.js','data/protocolTemplates.js',
 'data/dosageforms.js','data/fluidbed.js','data/unitops.js','assets/forms.js','assets/app.js']
 .forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sb,{filename:f}));
doc.dispatchEvent({type:'DOMContentLoaded'});
const $=s=>doc.querySelector(s);

const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
// classes that pin an element over the entire viewport
const blockers=[...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  .filter(m=>/position\s*:\s*fixed/.test(m[2]) && /inset\s*:\s*0/.test(m[2]))
  .map(m=>({sel:m[1].trim(), clickThrough:/pointer-events\s*:\s*none/.test(m[2])}));
console.log('full-viewport fixed layers declared in CSS:');
blockers.forEach(b=>console.log('  '+b.sel.padEnd(12), b.clickThrough?'click-through':'CAPTURES CLICKS'));

function surveyAfter(label){
  const present=[];
  blockers.forEach(b=>{
    const cls=b.sel.replace(/^\./,'');
    const nodes=doc.querySelectorAll('.'+cls);
    nodes.forEach(n=>{
      const shown=n.classList.contains('show');
      // .map-ov captures clicks only while .show is set
      const capturing = !b.clickThrough || shown;
      if(capturing) present.push(b.sel+(shown?'.show':''));
    });
  });
  console.log(`\n${label}\n  layers capturing clicks: ${present.length? present.join(', ') : 'none'}`);
  return present.length;
}

const open=surveyAfter('1. on load, map open');
$('#mapOverlay .map-skip').click();
const closed=surveyAfter('2. after clicking Skip');

// now prove the controls are actually reachable and responsive
const before=$('#fbThermo').textContent;
const sl=doc.querySelectorAll('#fbSliders input')[3];
sl.value=+sl.getAttribute('max'); sl.dispatchEvent({type:'input',target:sl});
const sliderWorks=$('#fbThermo').textContent!==before;
const t0=$('#molBody tr:nth-child(1)').textContent;
doc.querySelectorAll('#presets .chip')[1].click();
const buttonWorks=$('#molBody tr:nth-child(1)').textContent!==t0;

console.log('\n3. controls after dismissal');
console.log('  slider changes readouts :', sliderWorks?'yes':'NO');
console.log('  preset button re-ranks  :', buttonWorks?'yes':'NO');
console.log('  overlay still in DOM    :', $('#mapOverlay')?'YES — would block everything':'no');
const ok = open===1 && closed===0 && sliderWorks && buttonWorks && !$('#mapOverlay');
console.log('\n'+(ok?'PASS — page is interactive once the map is dismissed':'FAIL'));
process.exit(ok?0:1);
