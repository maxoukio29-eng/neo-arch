document.addEventListener("DOMContentLoaded", async () => {
 const grid=document.getElementById("catalogue"), search=document.getElementById("search"), filter=document.getElementById("class-filter"), count=document.getElementById("result-count");
 let all=[];
 const render=()=>{const q=search.value.trim().toLowerCase(), c=filter.value; const rows=all.filter(s=>(!c||s.class_name===c)&&(`${s.common_name} ${s.scientific_name}`.toLowerCase().includes(q))); count.textContent=`${rows.length} ESPÈCE${rows.length>1?"S":""} RÉFÉRENCÉE${rows.length>1?"S":""}`; grid.innerHTML=rows.length?rows.map(speciesCard).join(""):'<p class="muted">Aucun résultat. Essaie une autre recherche.</p>';};
 try{all=await getSpecies();render();}catch(e){grid.innerHTML=`<p class="muted">Erreur de chargement : ${escapeHTML(e.message)}</p>`;count.textContent="ERREUR";}
 search.addEventListener("input",render);filter.addEventListener("change",render);
});