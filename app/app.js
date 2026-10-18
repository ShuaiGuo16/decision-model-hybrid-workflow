// Website fixture data. The controller sees only rendered page content and controls.
const hotels = [
  {name:'Bairro Loft',city:'Lisbon',price:110,refundable:false,breakfast:true,area:'Bairro Alto'},
  {name:'Riverlight Hotel',city:'Lisbon',price:145,refundable:true,breakfast:true,area:'Riverside'},
  {name:'Alfama House',city:'Lisbon',price:135,refundable:true,breakfast:false,area:'Old town'},
  {name:'Avenida Suites',city:'Lisbon',price:180,refundable:true,breakfast:true,area:'City centre'},
  {name:'Garden Lodge',city:'Porto',price:115,refundable:true,breakfast:false,area:'Garden district'},
  {name:'Cedofeita Studio',city:'Porto',price:95,refundable:false,breakfast:true,area:'Cedofeita'},
  {name:'Ribeira Rooms',city:'Porto',price:120,refundable:true,breakfast:true,area:'Ribeira'},
  {name:'Palacio Hotel',city:'Porto',price:190,refundable:true,breakfast:true,area:'City centre'}
];
if(new URLSearchParams(location.search).has('reverse'))hotels.reverse();
const main=document.querySelector('main');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let view='search',trip={destination:'',check_in:'',check_out:'',guests:'1'};
let filters={budget:0,refundable:false,breakfast:false},selected=null;
let contact={name:'',email:'',message:''},confirmed=false;
const button=(text,id,secondary=false)=>`<button id="${id}" class="${secondary?'secondary':''}">${text}</button>`;
const options=(items,current)=>items.map(([value,label])=>`<option value="${value}" ${String(current)===String(value)?'selected':''}>${label}</option>`).join('');
const tripInfo=()=>`<strong>${esc(trip.destination)} · ${trip.guests} adults</strong><span>${trip.check_in} to ${trip.check_out}</span>`;
const badges=h=>`<span class="pill">${h.refundable?'Free cancellation':'Non-refundable'}</span><span class="pill">${h.breakfast?'Breakfast included':'Breakfast not included'}</span>`;
const hotelInfo=()=>`<p class="eyebrow">${selected.area.toUpperCase()}</p><h2>${selected.name}</h2>${badges(selected)}<p class="muted">Double room for ${trip.guests} adults · €${selected.price} per night</p>`;
const matches=()=>hotels.filter(h=>h.city===trip.destination&&(!filters.budget||h.price<=filters.budget)&&(!filters.refundable||h.refundable)&&(!filters.breakfast||h.breakfast));
// Calendar controls are ordinary page buttons, visible in the accessibility snapshot.
const dateControl=(key,label)=>`<div><label for="${key}-picker">${label}</label><input id="${key}" type="hidden" value="${trip[key]}"><button id="${key}-picker" class="date-field" type="button" data-date-field="${key}" data-date-label="${label}" aria-label="${label}: ${trip[key]||'Choose date'}">${trip[key]||'Choose date'}</button></div>`;
function openCalendar(trigger){
  const key=trigger.dataset.dateField,label=trigger.dataset.dateLabel;
  const initial=trip[key]||trip.check_in;
  const month=initial?new Date(initial+'T12:00:00'):new Date();
  month.setDate(1);
  const dialog=document.createElement('dialog');
  dialog.className='date-picker';dialog.setAttribute('aria-label',label+' calendar');
  document.body.append(dialog);
  const draw=()=>{
    const year=month.getFullYear(),m=month.getMonth(),count=new Date(year,m+1,0).getDate();
    const days=Array.from({length:count},(_,i)=>{
      const day=i+1,date=`${year}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const name=new Date(year,m,day).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
      return `<button type="button" data-date="${date}" aria-label="${name}" aria-pressed="${date===trip[key]}" ${day===1?`style="grid-column:${month.getDay()+1}"`:''}>${day}</button>`;
    }).join('');
    dialog.innerHTML=`<p class="eyebrow">${label}</p><h2 id="calendar-title">${label}: choose a date</h2><div class="calendar-nav"><button type="button" data-month="-1" aria-label="Previous month">&larr;</button><strong aria-live="polite">${month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</strong><button type="button" data-month="1" aria-label="Next month">&rarr;</button></div><div class="calendar-week" aria-hidden="true">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-days">${days}</div><div class="buttons"><button type="button" class="secondary" data-close>Cancel</button></div>`;
  };
  dialog.onclick=e=>{
    const target=e.target.closest('button');if(!target)return;
    if(target.dataset.month){month.setMonth(month.getMonth()+Number(target.dataset.month));draw();dialog.querySelector(`[data-month="${target.dataset.month}"]`).focus();}
    else if(target.dataset.date){
      const input=document.getElementById(key);input.value=target.dataset.date;
      trigger.textContent=input.value;trigger.setAttribute('aria-label',`${label}: ${input.value}`);
      input.dispatchEvent(new Event('input',{bubbles:true}));dialog.close();
    }else if(target.hasAttribute('data-close'))dialog.close();
  };
  dialog.onclose=()=>{dialog.remove();trigger.focus();};
  draw();dialog.showModal();
}
function render(){
  if(view==='search'){
    main.innerHTML=`<section class="hero"><p class="eyebrow">A LITTLE FURTHER FROM THE EVERYDAY</p><h1>Find your next stay.</h1><p class="muted">A city break, a comfortable room, and space for the details that make a trip yours.</p></section><section class="card"><h2>Where are you heading?</h2><form id="search"><div class="search-grid"><div><label for="destination">Destination</label><select id="destination" required>${options([['','Choose a city'],['Lisbon','Lisbon'],['Porto','Porto']],trip.destination)}</select></div>${dateControl('check_in','Check-in')}${dateControl('check_out','Check-out')}<div><label for="guests">Guests</label><select id="guests">${options([['1','1 adult'],['2','2 adults'],['3','3 adults']],trip.guests)}</select></div></div><p id="date-error" class="error" role="status"></p><div class="buttons">${button('Search stays','search-stays')}</div></form></section>`;
    const form=document.querySelector('#search'),submit=document.querySelector('#search-stays');
    const update=()=>{for(const key of Object.keys(trip))trip[key]=document.getElementById(key).value;submit.disabled=!trip.destination||!trip.check_in||!trip.check_out||trip.check_out<=trip.check_in;document.querySelector('#date-error').textContent=trip.check_out&&trip.check_in&&trip.check_out<=trip.check_in?'Check-out must be after check-in.':'';};
    form.querySelectorAll("[data-date-field]").forEach(trigger=>trigger.onclick=()=>openCalendar(trigger));
    form.oninput=update;form.onchange=update;update();
    form.onsubmit=e=>{e.preventDefault();filters={budget:0,refundable:false,breakfast:false};view='results';render();};
  }else if(view==='results'){
    const results=matches();
    main.innerHTML=`<div class="trip"><div>${tripInfo()}</div>${button('Edit search','edit-search',true)}</div><div class="results-layout"><aside class="card filters"><p class="eyebrow">YOUR PREFERENCES</p><h3>Find the right fit</h3><div class="field"><label for="budget">Nightly budget</label><select id="budget">${options([['0','Any price'],['100','€100 per night'],['150','€150 per night'],['200','€200 per night']],filters.budget)}</select></div><label class="check"><input id="refundable" type="checkbox" ${filters.refundable?'checked':''}>Refundable only</label><label class="check"><input id="breakfast" type="checkbox" ${filters.breakfast?'checked':''}>Breakfast included</label></aside><section><h2>Stays in ${trip.destination}</h2><p class="count">${results.length} matching ${results.length===1?'stay':'stays'}</p><div id="results">${results.length?results.map(h=>`<article class="card hotel"><div class="tile" aria-hidden="true">${h.name.split(' ').map(w=>w[0]).join('')}</div><div><p class="eyebrow">${h.area.toUpperCase()}</p><h3>${h.name}</h3>${badges(h)}</div><div class="price">€${h.price}<small>per night · double room</small><button data-hotel="${h.name}">View ${h.name}</button></div></article>`).join(''):'<div class="card empty" id="no-results"><h3>No stays match these preferences</h3><p class="muted">Try different preferences or another destination.</p></div>'}</div></section></div>`;
    document.querySelector('#edit-search').onclick=()=>{view='search';render();};
    document.querySelector('#budget').onchange=e=>{filters.budget=Number(e.target.value);render();};
    for(const key of ['refundable','breakfast'])document.getElementById(key).onchange=e=>{filters[key]=e.target.checked;render();};
    document.querySelectorAll('[data-hotel]').forEach(b=>b.onclick=()=>{selected=hotels.find(h=>h.name===b.dataset.hotel);contact={name:'',email:'',message:''};view='detail';render();});
  }else if(view==='detail'){
    main.innerHTML=`<div class="step">Your stay → Inquiry → Review</div><div class="trip"><div>${tripInfo()}</div>${button('Back to stays','back',true)}</div><div class="detail-layout"><section class="card">${hotelInfo()}<p class="muted">A comfortable base for exploring ${selected.city}, with a double room available for your selected dates.</p><h3>Make your plans</h3><p class="muted">Have an arrival request or a room preference? Prepare an inquiry for the hotel.</p><div class="buttons">${button('Prepare inquiry','prepare')}</div></section><aside class="card"><p class="eyebrow">YOUR ROOM</p><h3>Double room</h3><p class="price">€${selected.price}<small>per night</small></p>${badges(selected)}</aside></div>`;
    document.querySelector('#back').onclick=()=>{view='results';render();};
    document.querySelector('#prepare').onclick=()=>{view='inquiry';render();};
  }else if(view==='inquiry'){
    main.innerHTML=`<div class="step">Your stay → Inquiry → Review</div><h2>Prepare your inquiry</h2><div class="detail-layout"><section class="card"><form id="inquiry"><div class="two-col"><div><label for="name">Full name</label><input id="name" required value="${esc(contact.name)}" autocomplete="off"></div><div><label for="email">Email</label><input id="email" type="email" required value="${esc(contact.email)}" autocomplete="off"></div></div><div class="field"><label for="message">Message to the hotel</label><textarea id="message" required rows="5" placeholder="Ask about your arrival or room preferences">${esc(contact.message)}</textarea></div><div class="buttons">${button('Review inquiry','review')}</div></form></section><aside class="card">${hotelInfo()}<div class="muted">${tripInfo()}</div></aside></div>`;
    const form=document.querySelector('#inquiry'),submit=document.querySelector('#review');
    const update=()=>{for(const key of Object.keys(contact))contact[key]=document.getElementById(key).value;submit.disabled=!form.checkValidity();};
    form.oninput=update;update();
    form.onsubmit=e=>{e.preventDefault();confirmed=false;view='review';render();};
  }else if(view==='review'){
    main.innerHTML=`<div class="step">Your stay → Inquiry → Review</div><h2>Review your inquiry</h2><section class="card">${receipt()}<label class="check"><input id="confirmed" type="checkbox">These travel details are correct.</label><div class="buttons">${button('Edit inquiry','edit-inquiry',true)}${button('Save inquiry','save')}</div></section>`;
    const save=document.querySelector('#save');save.disabled=true;
    document.querySelector('#confirmed').onchange=e=>{confirmed=e.target.checked;save.disabled=!confirmed;};
    document.querySelector('#edit-inquiry').onclick=()=>{view='inquiry';render();};
    save.onclick=()=>{const record={...trip,...contact,hotel:selected.name,nightly_price:selected.price,refundable:selected.refundable,breakfast:selected.breakfast,confirmed};const records=JSON.parse(localStorage.getItem('inquiries')||'[]');records.push(record);localStorage.setItem('inquiries',JSON.stringify(records));view='saved';render();};
  }else if(view==='saved'){
    main.innerHTML=`<section class="card success"><p class="eyebrow">READY FOR YOUR TRIP</p><h1>Inquiry saved.</h1><p class="muted">Your request is ready to share with ${selected.name}.</p><div id="receipt">${receipt()}</div></section>`;
  }
}
function receipt(){return `<dl><dt>Hotel</dt><dd>${selected.name}</dd><dt>Destination</dt><dd>${trip.destination}</dd><dt>Check-in</dt><dd>${trip.check_in}</dd><dt>Check-out</dt><dd>${trip.check_out}</dd><dt>Guests</dt><dd>${trip.guests} adults</dd><dt>Nightly rate</dt><dd>€${selected.price}</dd><dt>Cancellation</dt><dd>${selected.refundable?'Refundable':'Non-refundable'}</dd><dt>Breakfast</dt><dd>${selected.breakfast?'Included':'Not included'}</dd><dt>Guest name</dt><dd>${esc(contact.name)}</dd><dt>Email</dt><dd>${esc(contact.email)}</dd></dl><blockquote>${esc(contact.message)}</blockquote>`;}
render();
