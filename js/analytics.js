// Google Analytics 4, loaded only after the visitor accepts.
// 1. In Google Analytics go to Admin > Data streams > your web stream and copy the Measurement ID.
// 2. Paste it below in place of G-XXXXXXXXXX.
const GA_ID="G-XXXXXXXXXX";

(function(){
  const KEY="analytics-consent";
  const read=()=>{try{return localStorage.getItem(KEY)}catch(e){return null}};
  const save=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
  const clear=()=>{try{localStorage.removeItem(KEY)}catch(e){}};

  function loadGA(){
    if(!/^G-[A-Z0-9]+$/.test(GA_ID)||GA_ID==="G-XXXXXXXXXX") return; // not set up yet
    const s=document.createElement("script");
    s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+GA_ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag("js",new Date());
    gtag("config",GA_ID,{anonymize_ip:true});
  }

  function showBanner(){
    if(document.getElementById("cookie-banner")) return;
    const b=document.createElement("div");
    b.id="cookie-banner";b.setAttribute("role","dialog");b.setAttribute("aria-label","Cookie consent");
    b.innerHTML='<p>We’d like to use Google Analytics cookies to see which recipes are popular. No analytics run unless you accept. <a href="privacy.html">Privacy policy</a></p><div><button class="btn" data-c="yes">Accept</button><button class="btn alt" data-c="no">Decline</button></div>';
    b.addEventListener("click",e=>{
      const c=e.target.dataset&&e.target.dataset.c;if(!c)return;
      const was=read();save(c);b.remove();
      if(c==="yes")loadGA();else if(was==="yes")location.reload();
    });
    document.body.appendChild(b);
  }

  const c=read();
  if(c==="yes")loadGA();else if(c===null)showBanner();

  document.addEventListener("click",e=>{
    if(e.target.id==="cookie-settings"){e.preventDefault();clear();showBanner();}
  });
})();
