(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const loader = $('#loader');
  const hideLoader = () => { if (loader) loader.classList.add('done'); };
  window.addEventListener('load', () => setTimeout(hideLoader, 450), {once:true});
  document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 1800), {once:true});
  setTimeout(hideLoader, 3200); // fail-safe if remote fonts/images delay load

  // Reveal on scroll, with a no-IntersectionObserver fallback.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:'0px 0px -35px 0px'});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  // Pointer aura and subtle hero parallax (desktop only).
  const aura = $('#cursorAura'), stage = $('#heroStage');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.addEventListener('pointermove', e => {
      if (aura) { aura.style.left = `${e.clientX}px`; aura.style.top = `${e.clientY}px`; aura.style.opacity = '.9'; }
      if (stage && e.clientY < innerHeight * 1.1) {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) / r.width;
        const y = (e.clientY - r.top - r.height/2) / r.height;
        stage.style.transform = `translate3d(${x*8}px,${y*7}px,0)`;
      }
    }, {passive:true});
    document.addEventListener('pointerleave', () => { if (aura) aura.style.opacity='0'; if(stage) stage.style.transform=''; });
  }

  // Mobile navigation.
  const navToggle = $('#navToggle'), navLinks = $('#navLinks');
  function closeNav(){ navLinks?.classList.remove('open'); navToggle?.setAttribute('aria-expanded','false'); navToggle?.setAttribute('aria-label','Open navigation'); }
  navToggle?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open'); navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open)); navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if(e.key === 'Escape'){closeNav();closeCart();closeModal();closeLightbox();} });
  $('#themeToggle')?.addEventListener('click', () => { document.body.classList.toggle('light-theme'); showToast(document.body.classList.contains('light-theme') ? 'Light mood, same good coffee.' : 'Back to the evening roast.'); });

  // Product menu. Images use remote Unsplash URLs; layout remains usable if a photo fails.
  const products = [
    ['Brown Butter Cloud Latte','coffee',280,'Double espresso, brown butter syrup and silky milk.','photo-1461023058943-07fcbe16d735','HOUSE SIGNATURE'],
    ['Velvet Cortado','coffee',220,'A short, balanced cup with a velvet finish.','photo-1511920170033-f8396924c348','BARISTA PICK'],
    ['House Espresso','coffee',180,'Short, bold and full of character.','photo-1517701604599-bb29b565090c','PURE COFFEE'],
    ['Honey Cinnamon Cappuccino','coffee',250,'Warm cinnamon, local honey and airy foam.','photo-1501339847302-ac426a4a7cbb','COMFORT CUP'],
    ['Spanish Latte','coffee',270,'Espresso meets creamy condensed milk.','photo-1461023058943-07fcbe16d735','SWEET SPOT'],
    ['Tiramisu Latte','coffee',290,'Mascarpone-inspired foam and cacao dust.','photo-1495474472287-4d71bcdd2085','SIGNATURE'],
    ['Flat White','coffee',230,'A double shot and beautifully textured milk.','photo-1511920170033-f8396924c348','THE CLASSIC'],
    ['Maple Sea Salt Mocha','coffee',300,'Dark chocolate, maple and a tiny salt finish.','photo-1509042239860-f550ce710b93','RICH & ROUND'],
    ['Midnight Cold Brew','cold',240,'18-hour steep, cacao and orange peel.','photo-1517701604599-bb29b565090c','SLOW STEEP'],
    ['Vanilla Cloud Iced Coffee','cold',250,'Chilled espresso under a soft vanilla cloud.','photo-1461023058943-07fcbe16d735','COOL FAVOURITE'],
    ['Salted Caramel Frappe','cold',280,'Blended coffee, caramel and sea salt.','photo-1461023058943-07fcbe16d735','BLENDED'],
    ['Espresso Tonic','cold',230,'Bright espresso over tonic and citrus.','photo-1511920170033-f8396924c348','BRIGHT & BOLD'],
    ['Vietnamese Iced Coffee','cold',250,'Strong coffee, condensed milk and plenty of ice.','photo-1509042239860-f550ce710b93','BOLD & SWEET'],
    ['Coconut Shakerato','cold',260,'Shaken espresso with chilled coconut notes.','photo-1517701604599-bb29b565090c','SHAKEN FRESH'],
    ['Ceremonial Matcha Latte','tea',270,'Stone-ground matcha, whisked slowly.','photo-1515823064-d6e0c04616a7','GREEN GOODNESS'],
    ['Strawberry Matcha','tea',290,'Earthy matcha layered over strawberry milk.','photo-1515823064-d6e0c04616a7','TRENDING'],
    ['Peach Iced Tea','tea',190,'Black tea, peach, lemon and fresh mint.','photo-1556679343-c7306c1976bc','REFRESHING'],
    ['Masala Chai','tea',140,'Black tea simmered with ginger and spices.','photo-1571934811356-5cc061b6821f','COMFORT CLASSIC'],
    ['Almond Croissant','bakery',190,'Buttery layers with toasted almond frangipane.','photo-1555507036-ab1f4038808a','FRESH FROM THE OVEN'],
    ['Chocolate Babka','bakery',210,'Soft braided loaf with ribbons of dark chocolate.','photo-1608198093002-ad4e005484df','BAKER’S PICK'],
    ['Cinnamon Morning Roll','bakery',170,'Warm spice, brown sugar and vanilla glaze.','photo-1509365465985-25d11c17e812','MORNING FAVOURITE'],
    ['Blueberry Muffin','bakery',150,'Tender crumb with juicy blueberries.','photo-1607958996333-41aef7caefaa','BAKED DAILY'],
    ['Pesto Paneer Sandwich','food',290,'Grilled sourdough, basil pesto, paneer and greens.','photo-1528735602780-2552fd46c7af','VEGETARIAN'],
    ['Three-Cheese Melt','food',320,'Golden sourdough with a gooey cheese blend.','photo-1528735602780-2552fd46c7af','CHEESY FAVOURITE'],
    ['Roasted Veggie Panini','food',280,'Charred peppers, zucchini and herbed cream cheese.','photo-1553908636-9bf9f2e3a6c7','FRESH & SAVOURY'],
    ['Margherita Flatbread','food',340,'Tomato, mozzarella, basil and olive oil.','photo-1574071318508-1cdbab80d002','WOOD-FIRED STYLE'],
    ['Creamy Alfredo Pasta','food',360,'Parmesan cream, cracked pepper and herbs.','photo-1473093295043-cdd812d0e601','COMFORT FOOD'],
    ['Avocado Sourdough Toast','food',280,'Smashed avocado, lemon, chilli flakes and seeds.','photo-1525351484163-7529414344d8','BRUNCH FAVOURITE'],
    ['Buttermilk Pancakes','food',310,'Fluffy stacks with maple syrup and seasonal fruit.','photo-1528207776546-365bb710ee93','SLOW MORNING'],
    ['Tiramisu Jar','dessert',260,'Espresso-soaked sponge, cream and cocoa.','photo-1571877227200-a0d98ea607e9','COFFEE LOVERS'],
    ['Chocolate Lava Cake','dessert',280,'Warm chocolate cake with a molten centre.','photo-1606313564200-e75d5e30476c','WARM & GOOEY'],
    ['Basque Cheesecake','dessert',290,'Burnished top, creamy centre and a little tang.','photo-1533134242443-d4fd215305ad','HOUSE DESSERT'],
    ['Salted Brownie Bites','dessert',180,'Fudgy dark chocolate with flaky sea salt.','photo-1606313564200-e75d5e30476c','SHAREABLE'],
    ['Pistachio Tiramisu','dessert',310,'A nutty twist on a café favourite.','photo-1571877227200-a0d98ea607e9','LIMITED BATCH'],
    ['Dark Chocolate Cookie','bakery',120,'Crisp edges, soft centre, dark chocolate chunks.','photo-1499636136210-6f4ee915583e','COOKIE JAR'],
    ['Mango Yogurt Bowl','food',270,'Seasonal fruit, granola and honey yogurt.','photo-1511690743698-d9d85f2fbf38','FRESH START']
  ];
  const menuGrid = $('#menuGrid');
  const photoUrl = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
  products.forEach((p, i) => {
    const card=document.createElement('article'); card.className='menu-card'; card.dataset.cat=p[1]; card.dataset.name=p[0].toLowerCase(); card.style.animationDelay=`${(i%6)*35}ms`;
    const photo=document.createElement('div'); photo.className='menu-photo'; const img=document.createElement('img'); img.src=photoUrl(p[4]); img.alt=p[0]; img.loading='lazy'; img.onerror=()=>{img.style.opacity='.15';img.alt=`Photo unavailable: ${p[0]}`}; photo.append(img);
    const tag=document.createElement('span');tag.className='menu-tag';tag.textContent=p[5];photo.append(tag);
    const info=document.createElement('div');info.className='menu-info';const titleRow=document.createElement('div');titleRow.className='menu-title-row';const title=document.createElement('h3');title.textContent=p[0];const price=document.createElement('strong');price.textContent=money(p[2]);titleRow.append(title,price);
    const desc=document.createElement('p');desc.textContent=p[3];const bottom=document.createElement('div');bottom.className='menu-card-bottom';const cat=document.createElement('span');cat.textContent=`${p[1].toUpperCase()} · MADE FRESH`;const add=document.createElement('button');add.className='menu-add';add.type='button';add.textContent='ADD +';add.addEventListener('click',()=>addToCart(p[0],p[2],p[1]));bottom.append(cat,add);info.append(titleRow,desc,bottom);card.append(photo,info);menuGrid.append(card);
  });
  $('#menuCount').textContent=`${products.length} items`;
  let activeFilter='all';
  function filterMenu(){const q=$('#menuSearch').value.trim().toLowerCase();let count=0;$$('.menu-card',menuGrid).forEach(card=>{const match=(activeFilter==='all'||card.dataset.cat===activeFilter)&&(!q||card.dataset.name.includes(q)||card.textContent.toLowerCase().includes(q));card.hidden=!match;if(match)count++;});$('#menuCount').textContent=`${count} item${count===1?'':'s'}`;$('#menuEmpty').hidden=count!==0;}
  $('#menuFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;$$('button',$('#menuFilters')).forEach(x=>x.classList.toggle('active',x===b));filterMenu();});
  $('#menuSearch').addEventListener('input',filterMenu);
  $('#resetMenu').addEventListener('click',()=>{$('#menuSearch').value='';activeFilter='all';$$('button',$('#menuFilters')).forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));filterMenu();});

  // Cart drawer with quantities, subtotal and demo checkout.
  let cart=[];const drawer=$('#cartDrawer'), backdrop=$('#cartBackdrop');
  function renderCart(){const count=cart.reduce((n,x)=>n+x.qty,0);$('#cartCount').textContent=count;$('#drawerCount').textContent=`(${count})`;$ ('#cartTotal').textContent=money(cart.reduce((sum,x)=>sum+x.price*x.qty,0));const root=$('#cartItems');root.replaceChildren();if(!cart.length){const empty=document.createElement('div');empty.className='cart-empty';empty.innerHTML='<span>☕</span><p>Your bag is waiting for a good coffee.</p><a href="#menu" id="browseMenu">Find your favourite ↗</a>';root.append(empty);$('#browseMenu').addEventListener('click',closeCart);return;}cart.forEach(item=>{const line=document.createElement('div');line.className='cart-line';const details=document.createElement('div');const h=document.createElement('h4');h.textContent=item.name;const sm=document.createElement('small');sm.textContent=item.meta||'Made fresh to order';details.append(h,sm);const right=document.createElement('div');right.className='cart-line-right';const price=document.createElement('strong');price.textContent=money(item.price*item.qty);const controls=document.createElement('div');controls.className='qty-controls';const minus=document.createElement('button');minus.textContent='−';minus.setAttribute('aria-label',`Decrease ${item.name}`);minus.onclick=()=>changeQty(item.key,-1);const qty=document.createElement('span');qty.textContent=item.qty;const plus=document.createElement('button');plus.textContent='+';plus.setAttribute('aria-label',`Increase ${item.name}`);plus.onclick=()=>changeQty(item.key,1);controls.append(minus,qty,plus);right.append(price,controls);line.append(details,right);root.append(line);});}
  function addToCart(name,price,meta='Made fresh'){const key=`${name}|${meta}`;const item=cart.find(x=>x.key===key);if(item)item.qty++;else cart.push({key,name,price:Number(price),meta,qty:1});renderCart();showToast(`${name} added to your bag ✳`);openCart();}
  function changeQty(key,delta){const item=cart.find(x=>x.key===key);if(!item)return;item.qty+=delta;if(item.qty<1)cart=cart.filter(x=>x.key!==key);renderCart();}
  function openCart(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');backdrop.classList.add('open');document.body.classList.add('drawer-open');$('#cartClose').focus();}
  function closeCart(){drawer?.classList.remove('open');drawer?.setAttribute('aria-hidden','true');backdrop?.classList.remove('open');document.body.classList.remove('drawer-open');}
  $('#cartOpen').addEventListener('click',openCart);$('#cartClose').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);$('#clearCart').addEventListener('click',()=>{cart=[];renderCart();});
  $$('.add-round').forEach(b=>b.addEventListener('click',()=>{const [name,price]=b.dataset.add.split('|');addToCart(name,price,'House signature');}));
  $('#checkout').addEventListener('click',()=>{if(!cart.length){showToast('Your bag is empty — find something lovely first.');return;}const count=cart.reduce((s,x)=>s+x.qty,0),total=money(cart.reduce((s,x)=>s+x.price*x.qty,0));closeCart();showModal('Your order, in spirit.',`${count} item(s) · ${total}. This is a demo checkout only; no payment was taken.`);});
  let toastTimer;function showToast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2300);}
  renderCart();

  // Coffee lab live pricing and preview colour.
  const baseSelect=$('#baseSelect'),milkSelect=$('#milkSelect'),sizeSelect=$('#sizeSelect'),extraShot=$('#extraShot');let sweetLevel=1;
  function updateLab(){const base=baseSelect.selectedOptions[0],milk=milkSelect.selectedOptions[0],size=sizeSelect.selectedOptions[0];const total=Number(base.dataset.price)+Number(milk.dataset.price)+Number(size.dataset.price)+(extraShot.checked?50:0)+[0,0,10,20][sweetLevel];$('#labPrice').textContent=money(total);$('#previewLiquid').style.background=base.value==='Matcha Latte'?'radial-gradient(ellipse,#b2b87b,#53603b 80%)':base.value==='Cold Brew'?'radial-gradient(ellipse,#9b5c35,#241109 80%)':'radial-gradient(ellipse,#c98b51,#3a1c10 80%)';$('#previewLiquid span').textContent=base.value==='Matcha Latte'?'❋':'✺';return {name:`Custom ${base.value}`,price:total,meta:`${milk.value} · ${['no sweetness','a little sweet','balanced sweetness','dessert-level sweetness'][sweetLevel]} · ${size.value}${extraShot.checked?' · extra shot':''}`};}
  [baseSelect,milkSelect,sizeSelect,extraShot].forEach(el=>el.addEventListener('change',updateLab));
  $('#sweetness').addEventListener('click',e=>{const b=e.target.closest('[data-sweet]');if(!b)return;sweetLevel=Number(b.dataset.sweet);$$('button',$('#sweetness')).forEach(x=>x.classList.toggle('active',x===b));updateLab();});
  $('#addCustom').addEventListener('click',()=>{const c=updateLab();addToCart(c.name,c.price,c.meta);});updateLab();

  // Interactive bean-to-cup story chapters.
  const rituals=[
    {image:'photo-1447933601403-0c6688de566e',alt:'Coffee beans at origin',caption:'THE ORIGIN — GOOD THINGS GROW SLOWLY'},
    {image:'photo-1514432324607-a09d9b4aefdd',alt:'Coffee roasting and brewing tools',caption:'THE ROAST — CHARACTER, NOT SHORTCUTS'},
    {image:'photo-1559525839-b184a4d698c7',alt:'Freshly ground coffee',caption:'THE GRIND — THE DETAILS MATTER'},
    {image:'photo-1495474472287-4d71bcdd2085',alt:'A cup being prepared by hand',caption:'THE POUR — THE MOMENT IS YOURS'}
  ];
  const ritualImage=$('#ritualImage');
  $$('.ritual-step').forEach((b,i)=>b.addEventListener('click',()=>{ $$('.ritual-step').forEach(x=>x.classList.toggle('active',x===b));const r=rituals[i];const visual=$('.ritual-visual');visual.classList.add('changing');setTimeout(()=>{ritualImage.src=photoUrl(r.image);ritualImage.alt=r.alt;$('#ritualNo').textContent=`0${i+1}`;$('#ritualCaption').textContent=r.caption;$('#ritualProgress').style.width=`${(i+1)*25}%`;visual.classList.remove('changing');},180);}));

  // Gallery lightbox.
  const gallery=[...$$('.gallery-item')].map(b=>({src:$('img',b).src,alt:$('img',b).alt,caption:b.querySelector('span')?.textContent.replace('↗','').trim()||''}));let galleryIndex=0;const lightbox=$('#lightbox');
  function showGallery(i){galleryIndex=(i+gallery.length)%gallery.length;$('#lightboxImage').src=gallery[galleryIndex].src;$('#lightboxImage').alt=gallery[galleryIndex].alt;$('#lightboxCaption').textContent=gallery[galleryIndex].caption;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');}
  function closeLightbox(){lightbox?.classList.remove('open');lightbox?.setAttribute('aria-hidden','true');}
  $$('.gallery-item').forEach((b,i)=>b.addEventListener('click',()=>showGallery(i)));$('#lightboxClose').addEventListener('click',closeLightbox);$('#lightboxPrev').addEventListener('click',()=>showGallery(galleryIndex-1));$('#lightboxNext').addEventListener('click',()=>showGallery(galleryIndex+1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});

  // Reservation and newsletter forms show a demo confirmation only.
  const dateInput=$('#reserveDate');if(dateInput){const today=new Date();dateInput.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;}
  const modal=$('#successModal');function showModal(title,text){$('#modalTitle').textContent=title;$('#modalText').textContent=text;modal.classList.add('open');modal.setAttribute('aria-hidden','false');$('#modalOkay').focus();}
  function closeModal(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');}
  $('#reservationForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);showModal('Your table request is ready.',`${data.get('name')}, your demo request for ${data.get('guests')} on ${data.get('date')} at ${data.get('time')} has been prepared. No real booking was sent.`);e.currentTarget.reset();});
  $('#newsletterForm').addEventListener('submit',e=>{e.preventDefault();const email=$('#newsletterEmail').value;$('#newsletterMessage').textContent=`Thanks — ${email} has been added to this demo signup. No email was sent or stored.`;e.currentTarget.reset();});
  $('#modalClose').addEventListener('click',closeModal);$('#modalOkay').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});

  // Smooth anchor fallback and keyboard focus visibility.
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href');if(id==='#'||id.length<2)return;const target=$(id);if(target){e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'',id);closeNav();if(id==='#menu')closeCart();}});

  // Signature combo builder: calculates pairing totals and adds a single line to the bag.
  const comboDrinkInputs=[...document.querySelectorAll('input[name="comboDrink"]')];
  const comboAddons=[...document.querySelectorAll('.combo-addon')];
  function updateCombo(){
    const drink=comboDrinkInputs.find(x=>x.checked)||comboDrinkInputs[0];
    if(!drink)return;
    const extras=comboAddons.filter(x=>x.checked);
    const total=Number(drink.dataset.price||0)+extras.reduce((sum,x)=>sum+Number(x.dataset.price||0),0);
    const names=[drink.value,...extras.map(x=>x.value)];
    $('#comboTitle').textContent=extras.length?`${drink.value} & a little something.`:`${drink.value} & a moment.`;
    $('#comboSummary').textContent=names.join(' · ');
    $('#comboTotal').textContent=`₹${total}`;
    return {name:`Ritual Pairing: ${names.join(' + ')}`,price:total};
  }
  comboDrinkInputs.forEach(x=>x.addEventListener('change',updateCombo));comboAddons.forEach(x=>x.addEventListener('change',updateCombo));updateCombo();
  $('#addCombo')?.addEventListener('click',()=>{const combo=updateCombo();if(combo){addToCart(combo.name,combo.price);showToast('Your ritual pairing is in the bag ✳');}});

  // Ritual Passport persists locally in this browser; it is not an account or real rewards programme.
  const passportKey='brewBeanRitualStamps_v1';
  function readStamps(){try{return Math.max(0,Math.min(6,Number(localStorage.getItem(passportKey)||0)));}catch(e){return 0;}}
  function paintPassport(){const count=readStamps();$$('.passport-stamp').forEach((stamp,i)=>stamp.classList.toggle('collected',i<count));$('#passportCount').textContent=count;$('#passportProgress').style.width=`${count/6*100}%`;$('#passportReward').textContent=count>=6?'SIX MOMENTS. ONE LITTLE REWARD.':`${6-count} MORE ${6-count===1?'MOMENT':'MOMENTS'} TO GO`;$('html').style.setProperty('--passport-stamp-count',count);}
  $('#passportStamp')?.addEventListener('click',()=>{const current=readStamps();if(current>=6){showToast('Your passport is full. Start a fresh ritual ✳');return;}try{localStorage.setItem(passportKey,String(current+1));}catch(e){}paintPassport();showToast(current===5?'Passport complete — lovely work! ☕':'A new moment collected ✳');});
  $('#passportReset')?.addEventListener('click',()=>{try{localStorage.removeItem(passportKey);}catch(e){}paintPassport();showToast('A fresh little beginning.');});paintPassport();

  // Thin scroll progress meter; no continuous animation loop.
  const progressBar=$('#scrollProgressBar');let scrollTick=false;
  function updateScrollProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;progressBar.style.width=`${max>0?Math.min(100,window.scrollY/max*100):0}%`;scrollTick=false;}
  window.addEventListener('scroll',()=>{if(!scrollTick){window.requestAnimationFrame(updateScrollProgress);scrollTick=true;}},{passive:true});updateScrollProgress();

  // Seasonal art direction switch changes CSS variables only; no audio or tracking.
  const seasonSwitch=$('#seasonSwitch');
  seasonSwitch?.addEventListener('click',()=>{const active=document.body.classList.toggle('seasonal-summer');seasonSwitch.setAttribute('aria-pressed',String(active));seasonSwitch.innerHTML=active?'☼ <span>SUMMER MOOD ON</span>':'☼ <span>SUMMER MOOD</span>';showToast(active?'Sunlit café atmosphere on ☼':'Back to the signature espresso mood.');});

})();


(()=>{'use strict';const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
// Pointer-responsive coffee universe.
const universe=$('.universe-art');universe?.addEventListener('pointermove',e=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const r=universe.getBoundingClientRect();universe.style.transform=`rotateX(${(e.clientY-r.top-r.height/2)/-28}deg) rotateY(${(e.clientX-r.left-r.width/2)/28}deg)`});universe?.addEventListener('pointerleave',()=>universe.style.transform='');
const latteNotes={'♥':'A little heart, poured with care.','❧':'A rosetta for the curious coffee soul.','✿':'A tulip, one layer at a time.'};$$('[data-latte]').forEach(b=>b.addEventListener('click',()=>{$$('[data-latte]').forEach(x=>x.classList.toggle('active',x===b));$('.latte-pattern').textContent=b.dataset.latte;$('.latte-pattern').style.animation='none';requestAnimationFrame(()=>$('.latte-pattern').style.animation='latteBloom .7s ease both');$('#latteCaption').textContent=latteNotes[b.dataset.latte]}));
const origins={brazil:['Brazil · Cerrado','Chocolate, toasted nuts and a rounded sweetness. A comforting everyday cup.'],ethiopia:['Ethiopia · Yirgacheffe','Floral aroma, citrus brightness and a tea-like finish. Light, vivid and fragrant.'],colombia:['Colombia · Huila','Caramel sweetness, red fruit and a balanced, juicy finish.']};$$('[data-origin]').forEach(b=>b.addEventListener('click',()=>{$$('[data-origin]').forEach(x=>x.classList.toggle('active',x===b));$('#originName').textContent=origins[b.dataset.origin][0];$('#originText').textContent=origins[b.dataset.origin][1]}));
$$('[data-taste]').forEach(b=>b.addEventListener('click',()=>{$$('[data-taste]').forEach(x=>x.disabled=true);$('#tasteResult').textContent=b.dataset.taste==='chocolate'?'Correct! Dark chocolate, cocoa and a warm finish. You have a thoughtful palate.':'Good guess! This mystery cup leans toward dark chocolate and cocoa. Try another tasting flight next time.';b.style.background='#c18c5c';b.style.color='#20150f'}));
$$('[data-color]').forEach(b=>b.addEventListener('click',()=>{$$('[data-color]').forEach(x=>x.classList.toggle('selected',x===b));$('#designerCup').style.background=b.dataset.color;$('#designerCup').style.color=['#293b32','#24201e'].includes(b.dataset.color)?'#f5e7d5':'#432a1b'}));$('#cupMessage')?.addEventListener('input',e=>$('#cupMessagePreview').textContent=e.target.value||'your ritual');$('#shareCup')?.addEventListener('click',async()=>{const text=`My BREW & BEAN cup says: “${$('#cupMessage').value||'your ritual'}” ☕`;try{await navigator.clipboard.writeText(text);$('#cupShareStatus').textContent='Cup card caption copied — share your little ritual!'}catch{$('#cupShareStatus').textContent=text+' (Select and copy this caption.)'}});
const personas={'The Slow Starter':'Calm · considered · coffee first','The Night Owl':'Curious · bold · after-hours energy','The Creative Pour':'Playful · expressive · always experimenting'};$$('[data-mood]').forEach(b=>b.addEventListener('click',()=>{$$('[data-mood]').forEach(x=>x.classList.toggle('active',x===b));$('#personaName').textContent=b.dataset.mood;$('#shareResult small').textContent=personas[b.dataset.mood]}));$('#sharePersona')?.addEventListener('click',async()=>{const t=`My coffee persona is ${$('#personaName').textContent} — ${$('#shareResult small').textContent}. ☕ #BrewAndBean`;try{await navigator.clipboard.writeText(t);$('#shareStatus').textContent='Copied! Share your coffee identity with a friend.'}catch{$('#shareStatus').textContent=t}});
const ringNotes=['Some things are better when you slow down.','A good day can begin with one very good cup.','Leave room for one more little moment.','Coffee tastes better when the conversation is good.'];let ringIndex=0;$('#coffeeRingButton')?.addEventListener('click',()=>{ringIndex=(ringIndex+1)%ringNotes.length;$('#coffeeRingMessage').textContent=ringNotes[ringIndex];$('#coffeeRingButton').style.transform=`rotate(${ringIndex*90}deg)`});
$('#addWeekly')?.addEventListener('click',()=>{const add=$('#addCombo');if(add){document.querySelector('#coffee-combo')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>add.click(),450)}else{const menuLink=document.querySelector('a[href="#menu"]');menuLink?.click()}});
// Illustrative counters are explicitly demo data, not connected to a POS system.
const served=$('#servedCount');if(served){const base=248;let sessionCups=0;document.addEventListener('click',e=>{if(e.target.closest('#addWeekly, #addCombo, .add-to-cart, [data-add]')){sessionCups++;served.textContent=String(base+sessionCups)}},{passive:true})}
})();
