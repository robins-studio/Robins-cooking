const el=id=>document.getElementById(id);
const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

// A recipe card that links to its own page
function card(r,i){
  const s=slug(r.t);
  return `<a class="card" href="recipe.html?r=${s}" style="--i:${i}">
  <div class="thumb" style="background:${r.bg};view-transition-name:thumb-${s}"><img src="${r.img}" alt="${r.t}" loading="lazy"></div>
  <div class="in"><h3>${r.t}</h3><p class="meta">${r.c}, ${r.time}</p><p>${r.d}</p>
  <span class="more">View recipe <span aria-hidden="true">→</span></span></div></a>`;
}

// Home page: latest recipes
const latest=el("latest");
if(latest) latest.innerHTML=recipes.slice(0,3).map(card).join("");

// Ingredient names: turn "200g plain flour" into "flour" so ingredients can be compared
const SYN={"eggs":"egg","lemons":"lemon","apples":"apple","garlic cloves":"garlic","cherry tomatoes":"tomatoes","chopped tomatoes":"tomatoes"};
function norm(s){
  let x=s.toLowerCase().replace(/^(handful|pinch) of\s+/,"").replace(/^[\d.\/]+\s*(kg|g|ml|l|tsp|tbsp|tins?)?\s+/,"");
  x=x.replace(/^(melted|soft|cold|chopped|whole|plain|rolled|dark|cherry)\s+/,"");
  return x.split(/\s+and\s+/).map(p=>SYN[p]||p);
}

// Major allergens and the ingredient words that trigger them
const ALLERGENS={
  "Celery":{re:/celery|celeriac/},
  "Crustaceans":{re:/prawn|shrimp|\bcrab\b|lobster|crayfish|langoustine/},
  "Eggs":{re:/^egg(?!plant)/},
  "Fish":{re:/fish|salmon|tuna|\bcod\b|anchov|haddock|mackerel|sardine|trout/},
  "Gluten":{re:/flour|spaghetti|pasta|oats|bread|barley|\brye\b|couscous|bulgur|semolina|noodles/},
  "Milk":{re:/\bbutter\b|buttermilk|yoghurt|cheese|cream|^milk$/,not:/peanut|almond|coconut|cocoa/},
  "Molluscs":{re:/mussel|oyster|\bclam|squid|scallop|snail|octopus|whelk/},
  "Mustard":{re:/mustard/},
  "Peanuts":{re:/peanut/},
  "Sesame":{re:/sesame|tahini/},
  "Soyabeans":{re:/\bsoy|tofu|edamame|miso|tempeh/},
  "Sulphur dioxide and sulphites":{re:/\bwine\b|raisin|sultana|dried apricot|dried fruit|prune|sulphite|sulfite|vinegar/},
  "Tree nuts":{re:/almond|walnut|cashew|hazelnut|pecan|pistachio|brazil nut|macadamia/}
};
const hasAllergen=(a,name)=>ALLERGENS[a].re.test(name)&&!(ALLERGENS[a].not&&ALLERGENS[a].not.test(name));
const MEAT=/\b(chicken|beef|pork|lamb|bacon|ham|sausages?|mince|turkey|duck|veal|venison|gelatine|lard)\b/;
const ANIMAL=/\b(honey|ghee|gelatine|lard)\b/;
recipes.forEach(r=>{
  r.names=r.i.flatMap(norm);
  r.allergens=Object.keys(ALLERGENS).filter(a=>r.names.some(n=>hasAllergen(a,n)));
  const meat=r.names.some(n=>MEAT.test(n))||["Fish","Crustaceans","Molluscs"].some(a=>r.allergens.includes(a));
  r.vegetarian=!meat;
  r.vegan=!meat&&!["Milk","Eggs"].some(a=>r.allergens.includes(a))&&!r.names.some(n=>ANIMAL.test(n));
});

// Meals page: category filters, "More filters" panel and full list
const all=el("all");
if(all){
  const cats=["All",...new Set(recipes.map(r=>r.c))];
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const ingredients=[...new Set(recipes.flatMap(r=>r.names))].sort();
  const chip=(t,v)=>`<label class="chip"><input type="checkbox" data-t="${t}" value="${v}"><span>${cap(v)}</span></label>`;
  let cat="All";
  const ex={a:new Set(),i:new Set(),d:new Set()};

  const bar=el("filters");
  bar.innerHTML=cats.map(c=>`<button data-cat="${c}" aria-pressed="${c===cat}">${c}</button>`).join("")
    +`<button class="more-btn" id="morebtn" aria-expanded="false" aria-controls="more">Allergies and dietary filters<span class="badge" hidden></span></button>`;

  const panel=document.createElement("div");
  panel.id="more";panel.className="fpanel";panel.hidden=true;
  panel.innerHTML=`<div class="fhead"><h3>Dietary needs and allergens</h3><button class="linkbtn" id="clear" type="button">Clear all</button></div>
    <p class="hint">Tick anything that applies. This is a guide based on each recipe’s ingredient list, so always check labels if you have an allergy.</p>
    <p class="sub">Show only recipes that are</p><div class="chips">${["Vegan","Vegetarian"].map(d=>chip("d",d)).join("")}</div>
    <p class="sub">Leave out recipes that contain</p><div class="chips">${Object.keys(ALLERGENS).map(a=>chip("a",a)).join("")}</div>
    <p class="fmore-wrap"><button class="linkbtn" id="showmore" type="button" aria-expanded="false" aria-controls="ing">Show more</button></p>
    <div class="fmore" id="ing" hidden><h3>Every ingredient on the site</h3><div class="chips">${ingredients.map(i=>chip("i",i)).join("")}</div></div>`;
  bar.after(panel);
  const count=document.createElement("p");
  count.className="count";count.setAttribute("aria-live","polite");
  panel.after(count);
  const badge=bar.querySelector(".badge");

  const render=()=>{
    const shown=recipes.filter(r=>(cat==="All"||r.c===cat)
      &&[...ex.d].every(d=>r[d.toLowerCase()])
      &&![...ex.a].some(a=>r.allergens.includes(a))
      &&![...ex.i].some(i=>r.names.includes(i)));
    all.innerHTML=shown.length?shown.map(card).join(""):`<p class="empty">No recipes match those filters. Try removing one.</p>`;
    count.textContent=`Showing ${shown.length} of ${recipes.length} recipes`;
    const n=ex.a.size+ex.i.size+ex.d.size;
    badge.hidden=!n;badge.textContent=n;
  };

  bar.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;
    if(b.id==="morebtn"){
      panel.hidden=!panel.hidden;
      b.setAttribute("aria-expanded",String(!panel.hidden));
    }else if(b.dataset.cat){
      cat=b.dataset.cat;
      bar.querySelectorAll("[data-cat]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
      render();
    }
  });
  panel.addEventListener("change",e=>{
    const t=e.target;if(!t.dataset.t)return;
    t.checked?ex[t.dataset.t].add(t.value):ex[t.dataset.t].delete(t.value);
    render();
  });
  panel.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;
    if(b.id==="showmore"){
      const ing=el("ing");ing.hidden=!ing.hidden;
      b.textContent=ing.hidden?"Show more":"Show less";
      b.setAttribute("aria-expanded",String(!ing.hidden));
    }else if(b.id==="clear"){
      panel.querySelectorAll("input").forEach(i=>i.checked=false);
      ex.a.clear();ex.i.clear();ex.d.clear();render();
    }
  });
  render();
}

// Recipe page: recipe.html?r=recipe-name
const page=el("recipe");
if(page){
  const key=new URLSearchParams(location.search).get("r");
  const r=recipes.find(x=>slug(x.t)===key);
  if(!r){
    page.innerHTML=`<div class="pagehead"><h1>Recipe not found</h1><p>Sorry, we couldn’t find that recipe.</p><p><a class="btn" href="meals.html">Back to all meals</a></p></div>`;
  }else{
    document.title=r.t+" – Robin Cook’s";
    const others=recipes.filter(x=>x!==r);
    const more=others.filter(x=>x.c===r.c).concat(others.filter(x=>x.c!==r.c)).slice(0,3);
    page.innerHTML=`<a class="back" href="meals.html">← All meals</a>
    <div class="thumb rhero" style="background:${r.bg};view-transition-name:thumb-${key}"><img src="${r.img}" alt="${r.t}"></div>
    <div class="rhead"><p class="meta">${r.c}, ${r.time}</p><h1>${r.t}</h1><p class="lede">${r.d}</p></div>
    <div class="rcols">
      <section><h2>Ingredients</h2><ul class="ings">${r.i.map((x,n)=>`<li style="--i:${n}">${x}</li>`).join("")}</ul></section>
      <section><h2>Method</h2><ol class="steps">${r.s.map((x,n)=>`<li style="--i:${n}">${x}</li>`).join("")}</ol></section>
    </div>
    <div class="sec"><h2>More to cook</h2><div class="grid">${more.map(card).join("")}</div></div>`;
  }
}

// Guide cards (link to guide.html?g=guide-name)
function gcard(g,i){
  const s=slug(g.t);
  return `<a class="card" href="guide.html?g=${s}" style="--i:${i}">
  <div class="thumb" style="background:${g.bg};view-transition-name:thumb-g-${s}"><img src="${g.img}" alt="${g.t}" loading="lazy"></div>
  <div class="in"><h3>${g.t}</h3><p class="meta">${g.c}, ${g.time}</p><p>${g.d}</p>
  <span class="more">Read guide <span aria-hidden="true">→</span></span></div></a>`;
}

// Guides page
const glist=el("guides");
if(glist) glist.innerHTML=guides.map(gcard).join("");

// Guide page: guide.html?g=guide-name
const gpage=el("guide");
if(gpage){
  const key=new URLSearchParams(location.search).get("g");
  const g=guides.find(x=>slug(x.t)===key);
  if(!g){
    gpage.innerHTML=`<div class="pagehead"><h1>Guide not found</h1><p>Sorry, we couldn’t find that guide.</p><p><a class="btn" href="guides.html">Back to all guides</a></p></div>`;
  }else{
    document.title=g.t+" – Robin Cook’s";
    const more=guides.filter(x=>x!==g).slice(0,3);
    const rel=g.rel&&recipes.find(r=>r.t===g.rel);
    gpage.innerHTML=`<a class="back" href="guides.html">← All guides</a>
    <div class="thumb rhero" style="background:${g.bg};view-transition-name:thumb-g-${key}"><img src="${g.img}" alt="${g.t}"></div>
    <div class="rhead"><p class="meta">${g.c}, ${g.time}</p><h1>${g.t}</h1><p class="lede">${g.d}</p></div>
    <div class="rcols">
      <section><h2>What you need</h2><ul class="ings">${g.need.map((x,n)=>`<li style="--i:${n}">${x}</li>`).join("")}</ul></section>
      <section><h2>Steps</h2><ol class="steps">${g.s.map((x,n)=>`<li style="--i:${n}">${x}</li>`).join("")}</ol></section>
    </div>
    <div class="tips"><h2>Top tips</h2><ul>${g.tips.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    ${rel?`<div class="sec"><h2>Try it in a recipe</h2><div class="grid">${card(rel,0)}</div></div>`:""}
    <div class="sec"><h2>More guides</h2><div class="grid">${more.map(gcard).join("")}</div></div>`;
  }
}
