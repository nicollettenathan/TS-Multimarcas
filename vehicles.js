(function(){
  const demo=[
    {id:'demo-1',name:'Toyota Corolla XEi 2.0 Flex',brand:'Toyota',model:'Corolla',version:'XEi 2.0 Flex',year:'2022',model_year:'2023',km:'28.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 119.900',image:'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'},
    {id:'demo-2',name:'Jeep Compass Longitude 2.0 Flex',brand:'Jeep',model:'Compass',version:'Longitude 2.0 Flex',year:'2021',model_year:'2022',km:'45.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 109.900',image:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'},
    {id:'demo-3',name:'Volkswagen T-Cross 200 TSI',brand:'Volkswagen',model:'T-Cross',version:'200 TSI',year:'2023',model_year:'2024',km:'18.000 km',transmission:'Automático',fuel:'Flex',price:'R$ 109.900',image:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',images:['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'],featured:true,status:'disponivel'}
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
  function card(v,contactHref){
    const sold=v.status==='vendido';
    const year=v.model_year&&v.year!==v.model_year?`${v.year||''}/${v.model_year}`:(v.year||v.model_year||'');
    const details=[year,v.km,v.transmission].filter(Boolean).join(' • ');
    return `<article class="car"><img src="${mainImage(v)}" alt="${v.name||'Veículo'}"><div class="car-body"><h3>${v.name||''}</h3><div class="meta">${details}</div><div class="price">${v.price||''}</div>${sold?'<span class="btn" style="opacity:.65;pointer-events:none">VENDIDO</span>':`<a class="btn" href="${contactHref||'index.html#contato'}">VER VEÍCULO</a>`}</div></article>`;
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
  window.TSVehicles={demo,list,render,configured,client,mainImage};
})();
