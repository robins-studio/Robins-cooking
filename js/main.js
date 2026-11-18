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

// Meals page: filters and full list
const all=el("all");
if(all){
  const cats=["All",...new Set(recipes.map(r=>r.c))];
  let cat="All";
  const render=()=>{
    all.innerHTML=recipes.filter(r=>cat==="All"||r.c===cat).map(card).join("");
    el("filters").innerHTML=cats.map(c=>`<button aria-pressed="${c===cat}" data-cat="${c}">${c}</button>`).join("");
  };
  el("filters").addEventListener("click",e=>{const b=e.target.closest("button");if(b){cat=b.dataset.cat;render();}});
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

// Contact page: messages are emailed to Robin via FormSubmit
const EMAIL="robin.studio2@gmail.com";
const form=el("form");
if(form){
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const ok=el("ok"),btn=form.querySelector("button[type=submit]");
    const data=Object.fromEntries(new FormData(form));
    data._subject="New message from Robin Cook’s website";
    data._template="table";
    btn.disabled=true;btn.textContent="Sending…";
    try{
      const res=await fetch("https://formsubmit.co/ajax/"+EMAIL,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify(data)
      });
      const j=await res.json();
      if(!res.ok||j.success==="false"||j.success===false) throw new Error(j.message||"failed");
      ok.classList.remove("err");
      ok.textContent="Thanks, "+data.name+". Your message has been sent and I’ll get back to you soon.";
      form.reset();
    }catch(err){
      ok.classList.add("err");
      ok.textContent="Sorry, your message couldn’t be sent. Please try again, or email "+EMAIL+" directly.";
    }
    ok.classList.add("show");
    btn.disabled=false;btn.textContent="Send message";
  });
}
