document.addEventListener("DOMContentLoaded", () => {
 const $=id=>document.getElementById(id), client=window.neoSupabase;
 const login=$("login-panel"), dash=$("dashboard"), warning=$("setup-warning"), form=$("species-form");
 if(!client){warning.classList.remove("hidden");warning.innerHTML='<b>Configuration nécessaire.</b><br>Pour activer la connexion, crée un projet Supabase puis renseigne <code>js/config.js</code>. Le catalogue public affiche actuellement des données de démonstration ; aucune donnée ajoutée ici ne sera synchronisée sans Supabase.';return;}
 const msg=(id,t,ok=false)=>{ $(id).textContent=t; $(id).className="form-message "+(ok?"success":""); };
 const isAdmin=async()=>{const {data:{user}}=await client.auth.getUser();if(!user)return false;const {data,error}=await client.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();if(error)throw error;$("admin-email").textContent=user.email;return !!data;};
 async function refresh(){
  const {data:{session}}=await client.auth.getSession();
  if(!session){login.classList.remove("hidden");dash.classList.add("hidden");return;}
  try{if(!(await isAdmin())){await client.auth.signOut();msg("login-message","Ce compte n'a pas les droits administrateur.");return;}}
  catch(e){msg("login-message",e.message);return;}
  login.classList.add("hidden");dash.classList.remove("hidden");await loadList();
 }
 $("login-form").addEventListener("submit",async e=>{e.preventDefault();msg("login-message","Connexion…");const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){msg("login-message",error.message);return;}await refresh();});
 $("logout").addEventListener("click",async()=>{await client.auth.signOut();form.reset();$("species-id").value="";await refresh();});
 const fields=["common_name","scientific_name","class_name","order_name","family_name","conservation_status","habitat","distribution","diet","description"];
 async function loadList(){
  const {data,error}=await client.from("species").select("*").order("created_at",{ascending:false});
  if(error){$("admin-list").textContent=error.message;return;}
  $("admin-list").innerHTML=data.length?data.map(s=>`<div class="admin-item"><div><b>${escapeHTML(s.common_name)}</b><p class="latin">${escapeHTML(s.scientific_name)}</p><small>${s.published?"Publié":"Brouillon"}</small></div><div class="item-actions"><button data-edit="${s.id}">Modifier</button><button data-delete="${s.id}">Supprimer</button></div></div>`).join(""):'<p class="muted">Aucune espèce enregistrée.</p>';
  $("admin-list").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>edit(data.find(x=>x.id===b.dataset.edit))));
  $("admin-list").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>remove(b.dataset.delete)));
 }
 function edit(s){$("species-id").value=s.id;fields.forEach(k=>$(k).value=s[k]||"");$("published").checked=!!s.published;$("form-title").textContent="Modifier une espèce";$("cancel-edit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
 $("cancel-edit").addEventListener("click",()=>{form.reset();$("species-id").value="";$("form-title").textContent="Ajouter une espèce";$("cancel-edit").classList.add("hidden");});
 async function remove(id){if(!confirm("Supprimer définitivement cette fiche ?"))return;const {error}=await client.from("species").delete().eq("id",id);if(error)alert(error.message);else await loadList();}
 form.addEventListener("submit",async e=>{
  e.preventDefault();msg("save-message","Enregistrement…");
  const id=$("species-id").value, payload={};fields.forEach(k=>payload[k]=$(k).value.trim()||null);payload.published=$("published").checked;
  const file=$("photo").files[0];
  try{
   if(file){if(file.size>8*1024*1024)throw new Error("Image trop volumineuse (maximum 8 Mo).");const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const {error:upErr}=await client.storage.from("animal-photos").upload(path,file,{upsert:false,contentType:file.type});if(upErr)throw upErr;const {data:urlData}=client.storage.from("animal-photos").getPublicUrl(path);payload.image_url=urlData.publicUrl;}
   let result;if(id)result=await client.from("species").update(payload).eq("id",id);else result=await client.from("species").insert(payload);
   if(result.error)throw result.error;msg("save-message","Fiche enregistrée avec succès.",true);form.reset();$("species-id").value="";$("form-title").textContent="Ajouter une espèce";$("cancel-edit").classList.add("hidden");await loadList();
  }catch(err){msg("save-message",err.message);}
 });
 client.auth.onAuthStateChange(()=>{setTimeout(refresh,0);});refresh();
});