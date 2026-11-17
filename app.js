(() => {
  const cfg = window.NEO_ARCH_CONFIG || {};
  window.neoSupabase = (cfg.supabaseUrl && cfg.supabaseKey && window.supabase)
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey)
    : null;
  window.demoSpecies = [
    {id:"demo-1",common_name:"Renard roux",scientific_name:"Vulpes vulpes",class_name:"Mammalia",order_name:"Carnivora",family_name:"Canidae",habitat:"Forêts, campagnes et zones périurbaines",distribution:"Hémisphère nord",diet:"Omnivore opportuniste",conservation_status:"LC",description:"Le renard roux est un mammifère de la famille des Canidés. Très adaptable, il occupe des milieux variés et présente une alimentation diversifiée.",image_url:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=85",published:true},
    {id:"demo-2",common_name:"Éléphant d'Afrique",scientific_name:"Loxodonta africana",class_name:"Mammalia",order_name:"Proboscidea",family_name:"Elephantidae",habitat:"Savanes, forêts claires et zones boisées",distribution:"Afrique subsaharienne",diet:"Herbivore",conservation_status:"EN",description:"Le plus grand animal terrestre actuel. Il joue un rôle écologique important dans la structuration de nombreux habitats africains.",image_url:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=85",published:true},
    {id:"demo-3",common_name:"Hibou grand-duc",scientific_name:"Bubo bubo",class_name:"Aves",order_name:"Strigiformes",family_name:"Strigidae",habitat:"Falaises, forêts et paysages rocheux",distribution:"Eurasie",diet:"Carnivore",conservation_status:"LC",description:"Grand rapace nocturne reconnaissable à ses aigrettes et à ses grands yeux orangés.",image_url:"https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=85",published:true},
    {id:"demo-4",common_name:"Tortue verte",scientific_name:"Chelonia mydas",class_name:"Reptilia",order_name:"Testudines",family_name:"Cheloniidae",habitat:"Eaux tropicales côtières et herbiers marins",distribution:"Océans tropicaux et subtropicaux",diet:"Principalement herbivore à l'âge adulte",conservation_status:"EN",description:"Tortue marine migratrice qui fréquente les herbiers marins et les zones côtières chaudes.",image_url:"https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=85",published:true}
  ];
  window.escapeHTML = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.getSpecies = async (includeUnpublished=false) => {
    if (!window.neoSupabase) return window.demoSpecies.filter(x => includeUnpublished || x.published);
    let q = window.neoSupabase.from("species").select("*").order("created_at",{ascending:false});
    if (!includeUnpublished) q = q.eq("published",true);
    const {data,error} = await q;
    if (error) throw error;
    return data || [];
  };
  window.speciesCard = s => `<a class="species-card" href="espece.html?id=${encodeURIComponent(s.id)}"><div class="card-image" style="background-image:url('${escapeHTML(s.image_url || "")}')"><span class="tag">${escapeHTML(s.class_name || "Espèce")}</span></div><div class="card-info"><div><h3>${escapeHTML(s.common_name)}</h3><p class="latin">${escapeHTML(s.scientific_name)}</p></div><span class="arrow">↗</span></div></a>`;
  document.addEventListener("DOMContentLoaded", async () => {
    const target = document.getElementById("home-species");
    if (!target) return;
    try { const data = (await getSpecies()).slice(0,3); target.innerHTML = data.length ? data.map(speciesCard).join("") : '<p class="muted">Aucune espèce publiée pour le moment.</p>'; }
    catch(e) { target.innerHTML = `<p class="muted">Impossible de charger les espèces : ${escapeHTML(e.message)}</p>`; }
  });
})();