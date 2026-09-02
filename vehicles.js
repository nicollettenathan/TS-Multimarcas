(function(){
  const demo=[
    {id:'demo-1',name:'Toyota Corolla XEi 2.0 Flex',brand:'Toyota',model:'Corolla',version:'XEi 2.0 Flex',year:'2022',model_year:'2023',km:'28.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 119.900',promo_price:'',image:'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'},
    {id:'demo-2',name:'Jeep Compass Longitude 2.0 Flex',brand:'Jeep',model:'Compass',version:'Longitude 2.0 Flex',year:'2021',model_year:'2022',km:'45.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 109.900',promo_price:'R$ 104.900',image:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'},
    {id:'demo-3',name:'Volkswagen T-Cross 200 TSI',brand:'Volkswagen',model:'T-Cross',version:'200 TSI',year:'2023',model_year:'2024',km:'18.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 109.900',promo_price:'',image:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'}
  ];
  function configured(){return window.TS_SUPABASE&&window.TS_SUPABASE.url&&window.TS_SUPABASE.anonKey&&window.supabase}
  function client(){return configured()?window.supabase.createClient(window.TS_SUPABASE.url,window.TS_SUPABASE.anonKey):null}
  async function list(){
    if(!configured()){
      const local=JSON.parse(localStorage.getItem('ts_admin_demo_vehicles')||'null');
      return Array.isArray(local)&&local.length?local:demo;
    }
    const {data,error}=await client().from('vehicles').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    return (data||[]).map(v=>({...v,image:(Array.isArray(v.images)&&v.images[0])||v.image||''}));
  }
  function mainImage(v){return (Array.isArray(v.images)&&v.images[0])||v.image||''}
  function priceHtml(v){
    if(v.promo_price){
      return `<div style="font-size:12px;color:#999;text-decoration:line-through;margin-bottom:3px">${v.price||''}</div><div class="price">${v.promo_price}</div><div style="display:inline-block;margin-top:5px;padding:3px 7px;border-radius:999px;background:#d6a334;color:#111;font-size:10px;font-weight:900">OFERTA</div>`;
    }
    return `<div class="price">${v.price||''}</div>`;
  }
  function card(v,contactHref){
    const sold=v.status==='vendido';
    const year=v.model_year&&v.year!==v.model_year?`${v.year||''}/${v.model_year}`:(v.year||v.model_year||'');
    const details=[year,v.km,v.transmission].filter(Boolean).join(' • ');
    return `<article class="car"><img src="${mainImage(v)}" alt="${v.name||'Veículo'}"><div class="car-body"><h3>${v.name||''}</h3><div class="meta">${details}</div>${priceHtml(v)}${sold?'<span class="btn" style="opacity:.65;pointer-events:none">VENDIDO</span>':`<a class="btn" href="${contactHref||'index.html#contato'}">VER VEÍCULO</a>`}</div></article>`;
  }
  async function render(selector,options={}){
    const el=document.querySelector(selector);if(!el)return;
    try{
      let items=await list();
      items=items.filter(v=>v.status!=='arquivado');
      if(options.featured)items=items.filter(v=>v.featured).slice(0,options.limit||6);
      el.innerHTML=items.map(v=>card(v,options.contactHref)).join('');
    }catch(e){el.innerHTML='<p style="color:#aaa">Não foi possível carregar o estoque agora.</p>';console.error(e)}
  }

  function makeDatalist(id,values){
    let dl=document.getElementById(id);
    if(!dl){dl=document.createElement('datalist');dl.id=id;document.body.appendChild(dl)}
    dl.innerHTML=values.map(v=>`<option value="${String(v).replace(/"/g,'&quot;')}"></option>`).join('');
    return dl;
  }
  function attachList(input,id,values){
    if(!input)return;
    makeDatalist(id,values);
    input.setAttribute('list',id);
    input.setAttribute('autocomplete','off');
  }
  function selectToFreeInput(id,listId,values){
    const el=document.getElementById(id);
    if(!el)return null;
    if(el.tagName==='INPUT'){attachList(el,listId,values);return el}
    const input=document.createElement('input');
    input.id=id;input.className=el.className||'field';input.value=el.value||values[0]||'';
    input.placeholder='Selecione ou digite';
    el.replaceWith(input);
    attachList(input,listId,values);
    return input;
  }
  function installAdminSmartOptions(){
    const brand=document.getElementById('brand');
    const model=document.getElementById('model');
    if(!brand||!model)return;

    const models={
      'Chevrolet':['Onix','Onix Plus','Tracker','Montana','S10','Spin','Cruze','Equinox','Trailblazer'],
      'Volkswagen':['Polo','Virtus','Nivus','T-Cross','Taos','Saveiro','Amarok','Jetta','Tiguan'],
      'Fiat':['Argo','Cronos','Pulse','Fastback','Strada','Toro','Mobi','Fiorino'],
      'Toyota':['Corolla','Corolla Cross','Yaris','Yaris Sedan','Hilux','SW4','RAV4','Camry'],
      'Honda':['City','City Hatch','Civic','HR-V','WR-V','CR-V','Fit'],
      'Hyundai':['HB20','HB20S','Creta','Tucson','Santa Fe','Azera'],
      'Jeep':['Renegade','Compass','Commander','Wrangler','Grand Cherokee'],
      'Nissan':['Kicks','Versa','Sentra','Frontier','March'],
      'Renault':['Kwid','Sandero','Logan','Duster','Oroch','Kardian'],
      'Ford':['Ka','EcoSport','Ranger','Territory','Maverick','Bronco','Mustang'],
      'BMW':['118i','320i','330e','X1','X2','X3','X4','X5'],
      'Mercedes-Benz':['A 200','C 200','C 300','GLA 200','GLC 300','GLE 400'],
      'Audi':['A3','A4','A5','Q3','Q5','Q7'],
      'Kia':['Cerato','Sportage','Sorento','Stonic','Carnival'],
      'Mitsubishi':['ASX','Eclipse Cross','Outlander','L200 Triton','Pajero Sport'],
      'Peugeot':['208','2008','3008','Partner'],
      'Citroën':['C3','C3 Aircross','C4 Cactus','Basalt'],
      'Volvo':['XC40','XC60','XC90','S60'],
      'Caoa Chery':['Tiggo 5X','Tiggo 7','Tiggo 8','Arrizo 6'],
      'BYD':['Dolphin','Dolphin Mini','Song Plus','Song Pro','Yuan Plus','Seal','King'],
      'GWM':['Haval H6','Haval H6 GT','Ora 03','Tank 300'],
      'Porsche':['Macan','Cayenne','911','718','Panamera','Taycan'],
      'Land Rover':['Range Rover Evoque','Discovery Sport','Defender','Range Rover Sport'],
      'Ram':['Rampage','1500','2500','3500']
    };
    const brands=Object.keys(models).concat(['Suzuki','Subaru','Mini','Lexus','Jaguar','JAC','Chery']).sort();
    attachList(brand,'vehicleBrandOptions',brands);

    function updateModels(){
      const typed=brand.value.trim().toLowerCase();
      const key=Object.keys(models).find(k=>k.toLowerCase()===typed);
      const values=key?models[key]:[...new Set(Object.values(models).flat())].sort();
      attachList(model,'vehicleModelOptions',values);
    }
    brand.addEventListener('input',updateModels);
    brand.addEventListener('change',updateModels);
    updateModels();

    attachList(document.getElementById('version'),'vehicleVersionOptions',[
      '1.0','1.0 Flex','1.0 Turbo','1.3 Flex','1.3 Turbo','1.4 Turbo','1.5','1.5 Turbo','1.6 Flex','1.8 Flex','2.0 Flex','2.0 Turbo','2.0 Diesel','Híbrido','Elétrico'
    ]);

    const currentYear=new Date().getFullYear();
    const years=[];for(let y=currentYear+1;y>=1980;y--)years.push(String(y));
    attachList(document.getElementById('year'),'vehicleYearOptions',years);
    attachList(document.getElementById('modelYear'),'vehicleModelYearOptions',years);

    selectToFreeInput('transmission','vehicleTransmissionOptions',['Automático','Manual','CVT','Automatizado','Automático de 6 marchas','Automático de 8 marchas','Automático de 9 marchas']);
    selectToFreeInput('fuel','vehicleFuelOptions',['Flex','Gasolina','Diesel','Híbrido','Híbrido plug-in','Elétrico','Etanol']);
    attachList(document.getElementById('color'),'vehicleColorOptions',['Preto','Branco','Prata','Cinza','Vermelho','Azul','Verde','Marrom','Bege','Dourado','Amarelo','Laranja']);
  }

  function installAdminPromoField(){
    const price=document.getElementById('price');
    if(!price||document.getElementById('promoPrice')) return;
    const holder=price.parentElement;
    if(!holder) return;
    const promo=document.createElement('div');
    promo.innerHTML='<label>Preço promocional <span style="color:#888;font-size:11px">(opcional)</span></label><input class="field" id="promoPrice" placeholder="R$ 109.900"><div style="font-size:11px;color:#bda56c;margin-top:-8px;margin-bottom:12px">Se preenchido, o preço normal aparecerá riscado no site.</div>';
    holder.insertAdjacentElement('afterend',promo);

    const originalForm=window.formDataWithImages;
    if(typeof originalForm==='function'){
      window.formDataWithImages=function(images){
        const data=originalForm(images);
        data.promo_price=(document.getElementById('promoPrice')?.value||'').trim();
        return data;
      };
    }
    const originalEdit=window.editV;
    if(typeof originalEdit==='function'){
      window.editV=function(id){
        originalEdit(id);
        list().then(all=>{
          const v=all.find(x=>String(x.id)===String(id));
          const field=document.getElementById('promoPrice');
          if(field) field.value=v?.promo_price||'';
          const brand=document.getElementById('brand');
          if(brand)brand.dispatchEvent(new Event('change'));
        }).catch(()=>{});
      };
    }
    const originalClear=window.clearForm;
    if(typeof originalClear==='function'){
      window.clearForm=function(){
        originalClear();
        const field=document.getElementById('promoPrice');
        if(field) field.value='';
      };
    }
  }
  window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{installAdminSmartOptions();installAdminPromoField()},0));
  window.TSVehicles={demo,list,render,configured,client,mainImage,priceHtml};
})();
