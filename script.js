const BASE   = 'https://pokeapi.co/api/v2';
const MAX_ID = 1010;

let currentId = 0;

const states = {
  loading: document.getElementById('state-loading'),
  info:    document.getElementById('state-info'),
  error:   document.getElementById('state-error'),
};

const el = {
  id:        document.getElementById('poke-id'),
  name:      document.getElementById('poke-name'),
  img:       document.getElementById('poke-img'),
  type:      document.getElementById('poke-type'),
  weight:    document.getElementById('poke-weight'),
  height:    document.getElementById('poke-height'),
  ability:   document.getElementById('poke-ability'),
  legendary: document.getElementById('poke-legendary'),
  capture:   document.getElementById('poke-capture'),
  zone:      document.getElementById('poke-zone'),
  desc:      document.getElementById('poke-desc'),
};

function showState(name) {
  Object.entries(states).forEach(([k, node]) => {
    node.classList.toggle('hidden', k !== name);
  });
}

async function loadPokemon(id) {
  if (id < 1)      id = MAX_ID;
  if (id > MAX_ID) id = 1;

  showState('loading');

  try {
    const [mainRes, speciesRes, encountersRes] = await Promise.all([
      fetch(`${BASE}/pokemon/${id}`),
      fetch(`${BASE}/pokemon-species/${id}`),
      fetch(`${BASE}/pokemon/${id}/encounters`),
    ]);

    if (!mainRes.ok) throw new Error();
    const data      = await mainRes.json();
    const species   = speciesRes.ok   ? await speciesRes.json()   : null;
    const encounters = encountersRes.ok ? await encountersRes.json() : [];

    currentId = data.id;

    el.id.textContent      = `#${String(data.id).padStart(3, '0')}`;
    el.name.textContent    = data.name.toUpperCase();
    el.weight.textContent  = data.weight;
    el.height.textContent  = data.height
    el.type.textContent    = data.types.map(t => t.type.name.toUpperCase()).join(' / ');
    el.ability.textContent = (data.abilities[0]?.ability?.name || '—').toUpperCase();

    el.img.src = data.sprites.other?.['official-artwork']?.front_default
              || data.sprites.front_default
              || '';

    if (species) {
      el.legendary.textContent = species.is_legendary ? 'YES' : 'NO';
      el.capture.textContent   = `${species.capture_rate}/255`;

      const entry = species.flavor_text_entries.find(e => e.language.name === 'es');
      el.desc.textContent = entry
        ? entry.flavor_text.replace(/\f|\n/g, ' ')
        : '—';
    } else {
      el.legendary.textContent = '—';
      el.capture.textContent   = '—';
      el.desc.textContent      = '—';
    }

    if (encounters.length > 0) {
      el.zone.textContent = encounters[0].location_area.name.replace(/-/g, ' ').toUpperCase();
    } else {
      el.zone.textContent = 'UNKNOWN';
    }

    showState('info');
  } catch {
    showState('error');
    setTimeout(() => showState('info'), 1500);
  }
}

document.getElementById('next').addEventListener('click', () => {
  loadPokemon(currentId + 1);
});

document.getElementById('previous').addEventListener('click', () => {
  loadPokemon(currentId <= 1 ? MAX_ID : currentId - 1);
});

document.getElementById('random').addEventListener('click', () => {
  loadPokemon(Math.floor(Math.random() * MAX_ID) + 1);
});

loadPokemon(1);