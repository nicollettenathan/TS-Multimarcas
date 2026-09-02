(()=>{
'use strict';
window.addEventListener('DOMContentLoaded',()=>{
  const qr=document.getElementById('mfaQr');
  const secret=document.getElementById('mfaSecret');
  const msg=document.getElementById('mfaMsg');
  const btn=document.getElementById('mfaEnrollBtn');
  const box=document.getElementById('mfaEnroll');
  if(!qr||!secret||!msg||!btn||!box||!window.TSVehicles?.configured())return;
  let repairing=false;
  async function repair(){
    if(repairing||box.classList.contains('hidden'))return;
    const broken=!qr.getAttribute('src')||!btn.dataset.factorId||/already exists|factor.*exists/i.test(msg.textContent||'');
    if(!broken)return;
    repairing=true;
    try{
      const sb=TSVehicles.client();
      const {data:userData}=await sb.auth.getUser();
      if(!userData?.user)return;
      msg.textContent='Preparando seu QR Code de segurança...';
      const {data:factors,error:listError}=await sb.auth.mfa.listFactors();
      if(listError)throw listError;
      const unverified=[...(factors?.totp||[])].filter(f=>f.status!=='verified');
      for(const factor of unverified){
        const {error}=await sb.auth.mfa.unenroll({factorId:factor.id});
        if(error)throw error;
      }
      const {data,error}=await sb.auth.mfa.enroll({factorType:'totp',friendlyName:'TS Multimarcas Super Admin'});
      if(error)throw error;
      let qrCode=data?.totp?.qr_code||'';
      if(qrCode.trim().startsWith('<svg')) qrCode='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(qrCode);
      qr.src=qrCode;
      secret.textContent=data?.totp?.secret||'';
      btn.dataset.factorId=data?.id||'';
      msg.textContent='QR Code pronto. Escaneie e digite o código de 6 dígitos.';
    }catch(err){
      msg.textContent='Não foi possível gerar o QR Code: '+(err?.message||String(err));
    }finally{repairing=false}
  }
  const observer=new MutationObserver(()=>repair());
  observer.observe(msg,{childList:true,subtree:true,characterData:true});
  setTimeout(repair,700);
});
})();