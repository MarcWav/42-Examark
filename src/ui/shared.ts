export const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const list=(items:string[])=>`<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
