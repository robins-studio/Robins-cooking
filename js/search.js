// Site-wide search: recipes, guides and pages.
(function(){
  const PAGES=[
    {t:"Home",u:"index.html",d:"Simple, honest recipes for busy weeknights and lazy Sundays.",k:"home welcome latest"},
    {t:"Recipes",u:"meals.html",d:"Browse breakfast, dinner and dessert recipes.",k:"meals filters allergies dietary vegan vegetarian"},
    {t:"Guides",u:"guides.html",d:"Step-by-step how-tos for cooking basics.",k:"how to techniques tips"},
    {t:"Contact",u:"contact.html",d:"Get in touch with Robin Cook’s.",k:"email instagram message"},
    {t:"Privacy policy",u:"privacy.html",d:"How Robin Cook’s handles your information.",k:"cookies analytics data"},
    {t:"Terms and conditions",u:"terms.html",d:"The terms for using Robin Cook’s.",k:"legal rules"}
  ];
  const ITEMS=[].concat(
    recipes.map(r=>({type:"Recipe",t:r.t,u:"recipe.html?r="+slug(r.t),d:r.d,h:r.c+" "+r.i.join(" "),b:r.s.join(" ")})),
    guides.map(g=>({type:"Guide",t:g.t,u:"guide.html?g="+slug(g.t),d:g.d,h:g.c+" "+g.need.join(" "),b:g.s.concat(g.tips).join(" ")})),
    PAGES.map(p=>({type:"Page",t:p.t,u:p.u,d:p.d,h:p.k,b:""}))
  ).map(x=>({...x,lt:x.t.toLowerCase(),lh:x.h.toLowerCase(),ld:x.d.toLowerCase(),lb:x.b.toLowerCase()}));

  // Every word typed must match somewhere; title matches count most
  function find(q){
    const words=q.toLowerCase().split(/\s+/).filter(Boolean);
    if(!words.length) return [];
    return ITEMS.map(it=>{
      let sc=0;
      for(const w of words){
        const s=(it.lt.includes(w)?6:0)+(it.lh.includes(w)?3:0)+(it.ld.includes(w)?2:0)+(it.lb.includes(w)?1:0);
        if(!s) return null;
        sc+=s;
      }
      return {...it,sc};
    }).filter(Boolean).sort((a,b)=>b.sc-a.sc);
  }
  window.siteSearch=find;

  const input=document.getElementById("q"),box=document.getElementById("suggest");
  if(!input) return;
  const form=input.closest("form");
  let active=-1;
  input.setAttribute("role","combobox");
  input.setAttribute("aria-expanded","false");
  input.setAttribute("aria-controls","suggest");
  input.setAttribute("aria-autocomplete","list");
  box.setAttribute("role","listbox");

  function close(){box.hidden=true;box.innerHTML="";active=-1;input.setAttribute("aria-expanded","false");input.removeAttribute("aria-activedescendant");}
  function open(){
    const q=input.value.trim();
    if(!q){close();return;}
    const res=find(q).slice(0,6);
    box.innerHTML=(res.length
      ?res.map((r,i)=>`<a class="sg" role="option" id="sg${i}" href="${r.u}"><span class="tag">${r.type}</span><span class="t">${r.t}</span></a>`).join("")
       +`<a class="sg all" role="option" id="sg${res.length}" href="search.html?q=${encodeURIComponent(q)}">See all results</a>`
      :`<p class="none">No matches found. Try a different word, such as an ingredient.</p>`);
    box.hidden=false;active=-1;input.setAttribute("aria-expanded","true");
  }
  input.addEventListener("input",open);
  input.addEventListener("focus",open);
  input.addEventListener("keydown",e=>{
    const items=[...box.querySelectorAll("a.sg")];
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      if(!items.length) return;
      e.preventDefault();
      const n=items.length;
      active=e.key==="ArrowDown"?(active+1)%n:(active<=0?n-1:active-1);
      items.forEach((a,i)=>a.classList.toggle("on",i===active));
      input.setAttribute("aria-activedescendant",items[active].id);
    }else if(e.key==="Enter"&&active>=0){
      e.preventDefault();location.href=items[active].href;
    }else if(e.key==="Escape"){close();}
  });
  document.addEventListener("click",e=>{if(!form.contains(e.target))close();});

  // Search results page
  const out=document.getElementById("results");
  if(out){
    const q=(new URLSearchParams(location.search).get("q")||"").trim();
    const sum=document.getElementById("sq");
    input.value=q;
    if(!q){
      sum.textContent="Type something into the search bar to find recipes, guides and pages.";
    }else{
      const res=find(q);
      document.title="Search: "+q+" – Robin Cook’s";
      sum.textContent=res.length+(res.length===1?" result":" results")+" for “"+q+"”";
      out.innerHTML=res.length
        ?res.map(r=>`<a class="res" href="${r.u}"><span class="tag">${r.type}</span><h3>${r.t}</h3><p>${r.d}</p></a>`).join("")
        :`<p class="empty">Nothing matched. Try a different word, such as an ingredient or a technique.</p>`;
    }
  }
})();
