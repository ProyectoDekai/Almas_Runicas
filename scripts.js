let rutaJSON = 'criaturas.json';
const criaturasMap = new Map();
let allCriaturas = [];
let activeTypes = new Set();
let activeBiomes = new Set();
const typeIcons = {
    "pasivos": "fa-solid fa-leaf",
    "domesticables": "fa-solid fa-paw",
    "peces": "fa-solid fa-fish",
    "hostiles": "fa-solid fa-skull",
    "neutral": "fa-solid fa-eye",
    "npc": "fa-solid fa-users",
    "minijefes": "fa-solid fa-hand-fist",
    "jefes": "fa-solid fa-crown"
};
const biomeIcons = {
    "praderas": "fa-solid fa-seedling",
    "bosque_negro": "fa-solid fa-tree",
    "oceano": "fa-solid fa-water",
    "pantano": "fa-solid fa-frog",
    "montañas": "fa-solid fa-mountain",
    "llanuras": "fa-solid fa-wheat-awn",
    "tierras_nubladas": "fa-solid fa-cloud",
    "tierras_de_ceniza": "fa-solid fa-fire-flame-curved",
    "norte_profundo": "fa-solid fa-snowflake",
};

// Función para generar la tabla de drops de una criatura en el detalle
function generarTablaDrops(criatura) {
  const dropsContenedor = document.querySelector('.criatura-descripcion .drops');
  if (!dropsContenedor) return;
  const dropsArray = criatura.drops || [];
  if (dropsArray.length === 0) {
    dropsContenedor.innerHTML = '';
    return;
  }
  const tablaHtml = `
    <table>
      <thead>
        <tr>
          <th>Drops</th>
          <th>0 ★</th>
          <th>1 ★</th>
          <th>2 ★</th>
        </tr>
      </thead>
      <tbody>
        ${dropsArray.map(drop => `
          <tr>
            <td>
              ${drop.img ? `<img src="${drop.img}" alt="${drop.item}" style="width: 30px; vertical-align: middle;">` : ''}
              ${drop.item}
            </td>
            <td>${drop["0_star"] || ''}</td>
            <td>${drop["1_star"] || ''}</td>
            <td>${drop["2_star"] || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  dropsContenedor.innerHTML = tablaHtml;
}

// Para generar la tabla de Uso y Crafteo para los peces
function generarTablaUsoYCrafting(criatura) {
    const infoContenedor = document.querySelector('.criatura-descripcion .drops');
    if (!infoContenedor) return;

    const usageArray = criatura.usage || [];
    const craftingArray = criatura.crafting || [];

    let htmlContent = '';



    if (craftingArray.length > 0) {
        htmlContent += '<h3>Crafteos</h3>';
        htmlContent += '<ul>';
        craftingArray.forEach(item => {
            htmlContent += `<li>${item.item}</li>`;
        });
        htmlContent += '</ul>';
    }

    if (htmlContent === '') {
        htmlContent = '';
    }

    infoContenedor.innerHTML = htmlContent;
}

// Función para renderizar los botones de estrella de una criatura en el detalle
function renderStarButtons(criatura) {
  const botonesEstrellasContenedor = document.querySelector('.criatura-descripcion .botones-estrellas');
  if (!botonesEstrellasContenedor) return;

  botonesEstrellasContenedor.innerHTML = '';

  const hasOneStar = criatura.img && criatura.img['1'];
  const hasTwoStars = criatura.img && criatura.img['2'];

  const btn0 = document.createElement('button');
  btn0.classList.add('btn-estrella');
  btn0.textContent = '0 ★';
  btn0.dataset.estrella = '0';
  botonesEstrellasContenedor.appendChild(btn0);

  if (hasOneStar) {
    const btn1 = document.createElement('button');
    btn1.classList.add('btn-estrella');
    btn1.textContent = '1 ★';
    btn1.dataset.estrella = '1';
    botonesEstrellasContenedor.appendChild(btn1);
  }

  if (hasTwoStars) {
    const btn2 = document.createElement('button');
    btn2.classList.add('btn-estrella');
    btn2.textContent = '2 ★';
    btn2.dataset.estrella = '2';
    botonesEstrellasContenedor.appendChild(btn2);
  }

  btn0.classList.add('activo');
  document.getElementById('imagenCriaturaActual').src = criatura.img['0'];

  botonesEstrellasContenedor.querySelectorAll('.btn-estrella').forEach(button => {
    button.addEventListener('click', function() {
      botonesEstrellasContenedor.querySelectorAll('.btn-estrella').forEach(btn => btn.classList.remove('activo'));
      this.classList.add('activo');
      const estrella = this.dataset.estrella;
      document.getElementById('imagenCriaturaActual').src = criatura.img[estrella];
    });
  });
}

// Muestra los detalles de una criatura en la columna izquierda de la interfaz
function mostrarDetalleCriatura(criatura) {
  const detalleContenedor = document.querySelector('.criatura-descripcion');
  if (!detalleContenedor) return;

  const descripcionHtml = `<p>${criatura.descripcion || ''}</p>`;
  detalleContenedor.innerHTML = `
    <h2>${criatura.nombre}</h2>
    <div class="imagen">
      <img id="imagenCriaturaActual" src="" alt="${criatura.nombre}">
      <div class="botones-estrellas"></div>
    </div>
    <div class="criatura-descripcion-grid">
      <div class="descripcion">${descripcionHtml}</div>
      <div class="drops"></div>
    </div>
  `;

  const botonesEstrellasContenedor = detalleContenedor.querySelector('.botones-estrellas');
  const hideStars = criatura.tipo === 'jefes' ||
                    criatura.tipo === 'minijefes' ||
                    criatura.tipo === 'peces' ||
                    criatura.tipo === 'npc' ||
                    criatura.has_stars === false;

  if (hideStars) {
    botonesEstrellasContenedor.style.display = 'none';
    if (criatura.img && criatura.img['0']) {
        document.getElementById('imagenCriaturaActual').src = criatura.img['0'];
    }
  } else {
    botonesEstrellasContenedor.style.display = 'flex';
    renderStarButtons(criatura);
  }

  // Mostrar drops o uso/crafteo según el tipo de criatura o si tiene datos de uso/crafteo
  if (criatura.tipo === 'peces' || (criatura.usage && criatura.usage.length > 0) || (criatura.crafting && criatura.crafting.length > 0)) {
    generarTablaUsoYCrafting(criatura);
  } else {
    generarTablaDrops(criatura);
  }

  detalleContenedor.classList.add('visible');
  document.querySelector('main').classList.add('detalle-abierto');
}

// Oculta los detalles de la criatura 
function ocultarDetalleCriatura() {
  const detalleContenedor = document.querySelector('.criatura-descripcion');
  if (detalleContenedor) {
    detalleContenedor.classList.remove('visible');
    document.querySelector('main').classList.remove('detalle-abierto');
  }
}

// Función para obtener una lista de tipos únicos de criaturas de todos los datos cargados
function getUniqueTypes(creatures) {
  const types = new Set();
  creatures.forEach(c => types.add(c.tipo));
  const orderedTypes = ["pasivos", "domesticables", "peces", "hostiles", "neutral", "npc", "minijefes", "jefes"]; // Añadir tipos en inglés
  return orderedTypes.filter(type => types.has(type));
}

// Función para obtener una lista de biomas únicos de todas las criaturas cargadas
function getUniqueBiomes(creatures) {
  const biomes = new Set();
  creatures.forEach(c => biomes.add(c.bioma));
  const orderedBiomes = ["praderas", "bosque_negro", "oceano", "pantano", "montañas", "llanuras", "tierras_nubladas", "tierras_de_ceniza", "norte_profundo"];  
  return orderedBiomes.filter(biome => biomes.has(biome));
}
function actualizarTituloPrincipal() {
    const contenedor = document.getElementById('contenedor-titulo');
    if (!contenedor) return;
    let titulo = contenedor.querySelector('h1');
    if (!titulo) {
        titulo = document.createElement('h1');
        contenedor.appendChild(titulo);
    }
    if (rutaJSON === 'criaturas.json') {
        titulo.textContent = 'Almas Rúnicas';
    } else {
        titulo.textContent = 'Runic Souls';
    }
}
function actualizarTituloCriaturas() {
    const titulo = document.getElementById('titulo-criaturas');
    if (!titulo) return;
    if (rutaJSON === 'criaturas.json') {
        titulo.textContent = 'Criaturas';
    } else {
        titulo.textContent = 'Creatures';
    }
}
// Función para crear dinámicamente las secciones de bioma (encabezados h3 y grids div)
function createBiomeSections(uniqueBiomes) {
    const criaturasTarjetasDiv = document.querySelector('.criatura-tarjetas');
    criaturasTarjetasDiv.innerHTML = '<h2 id="titulo-criaturas"></h2>';

    uniqueBiomes.forEach(biome => {
        const header = document.createElement('h3');
        // Traducir los nombres de bioma para mostrar
        let formattedBiome = biome.replace(/_/g, ' ');
        if (rutaJSON === 'criaturas.json') { // Si está en español
            if (biome === 'black_forest') formattedBiome = 'Bosque Negro';
            if (biome === 'ocean') formattedBiome = 'Océano';
            if (biome === 'swamp') formattedBiome = 'Pantano';
            if (biome === 'mountains') formattedBiome = 'Montañas';
            if (biome === 'plains') formattedBiome = 'Llanuras';
            if (biome === 'mistlands') formattedBiome = 'Tierras Nubladas';
            if (biome === 'ashlands') formattedBiome = 'Tierras de Ceniza';
            if (biome === 'deep_north') formattedBiome = 'Norte Profundo';
            if (biome === 'meadows') formattedBiome = 'Praderas';
        } else if (rutaJSON === 'criatures.json') { // Si está en inglés
            if (biome === 'bosque_negro') formattedBiome = 'Black Forest';
            if (biome === 'oceano') formattedBiome = 'Ocean';
            if (biome === 'pantano') formattedBiome = 'Swamp';
            if (biome === 'montañas') formattedBiome = 'Mountains';
            if (biome === 'llanuras') formattedBiome = 'Plains';
            if (biome === 'tierras_nubladas') formattedBiome = 'Mistlands';
            if (biome === 'tierras_de_ceniza') formattedBiome = 'Ashlands';
            if (biome === 'norte_profundo') formattedBiome = 'Deep North';
            if (biome === 'praderas') formattedBiome = 'Meadows';
        }
        header.textContent = formattedBiome.charAt(0).toUpperCase() + formattedBiome.slice(1).toLowerCase();
        header.id = `header-${biome}`;
        header.classList.add('biome-header');
        criaturasTarjetasDiv.appendChild(header);

        const gridDiv = document.createElement('div');
        gridDiv.id = `grid-${biome}`;
        gridDiv.classList.add('grid-criaturas');
        criaturasTarjetasDiv.appendChild(gridDiv);
    });
}

// Función para crear dinámicamente los botones de filtro
function createFilterButtons(uniqueTypes, uniqueBiomes) {
    const filtrosDiv = document.querySelector('.filtros');
    filtrosDiv.innerHTML = '';

    const typeFiltersContainer = document.createElement('div');
    typeFiltersContainer.classList.add('filter-row');
    typeFiltersContainer.classList.add('type-filters');
    filtrosDiv.appendChild(typeFiltersContainer);

    uniqueTypes.forEach(type => {
        const button = document.createElement('button');
        button.classList.add('filtro-btn');
        button.dataset.filterCategory = 'tipo';
        button.dataset.filterValue = type;
        button.innerHTML = `<i class="${typeIcons[type] || 'fa-solid fa-question'}"></i>`;
        // Traducir los títulos de los botones
        let translatedType = type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        if (rutaJSON === 'criaturas.json') { // Si está en español
            if (type === 'passive') translatedType = 'Pasivo';
            if (type === 'tameable') translatedType = 'Domesticable';
            if (type === 'fish') translatedType = 'Pez';
            if (type === 'hostile') translatedType = 'Hostil';
            if (type === 'neutral') translatedType = 'Neutral';
            if (type === 'minibosses') translatedType = 'Mini Jefes';
            if (type === 'bosses') translatedType = 'Jefes';
        } else if (rutaJSON === 'criatures.json') { // Si está en inglés
            if (type === 'pasivos') translatedType = 'Passive';
            if (type === 'domesticables') translatedType = 'Tameable';
            if (type === 'peces') translatedType = 'Fish';
            if (type === 'hostiles') translatedType = 'Hostile';
            if (type === 'neutral') translatedType = 'Neutral';
            if (type === 'minijefes') translatedType = 'Minibosses';
            if (type === 'jefes') translatedType = 'Bosses';
        }
        button.title = translatedType;
        typeFiltersContainer.appendChild(button);
    });

    const biomeFiltersContainer = document.createElement('div');
    biomeFiltersContainer.classList.add('filter-row');
    biomeFiltersContainer.classList.add('biome-filters');
    filtrosDiv.appendChild(biomeFiltersContainer);

    uniqueBiomes.forEach(biome => {
        const button = document.createElement('button');
        button.classList.add('filtro-btn');
        button.dataset.filterCategory = 'bioma';
        button.dataset.filterValue = biome;
        button.innerHTML = `<i class="${biomeIcons[biome] || 'fa-solid fa-question'}"></i>`;
        // Traducir los títulos de los botones
        let translatedBiome = biome.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        if (rutaJSON === 'criaturas.json') { // Si está en español
            if (biome === 'meadows') translatedBiome = 'Praderas';
            if (biome === 'black_forest') translatedBiome = 'Bosque Negro';
            if (biome === 'ocean') translatedBiome = 'Océano';
            if (biome === 'swamp') translatedBiome = 'Pantano';
            if (biome === 'mountains') translatedBiome = 'Montañas';
            if (biome === 'plains') translatedBiome = 'Llanuras';
            if (biome === 'mistlands') translatedBiome = 'Tierras Nubladas';
            if (biome === 'ashlands') translatedBiome = 'Tierras de Ceniza';
            if (biome === 'deep_north') translatedBiome = 'Norte Profundo';
        } else if (rutaJSON === 'criatures.json') { // Si está en inglés
            if (biome === 'praderas') translatedBiome = 'Meadows';
            if (biome === 'bosque_negro') translatedBiome = 'Black Forest';
            if (biome === 'oceano') translatedBiome = 'Ocean';
            if (biome === 'pantano') translatedBiome = 'Swamp';
            if (biome === 'montañas') translatedBiome = 'Mountains';
            if (biome === 'llanuras') translatedBiome = 'Plains';
            if (biome === 'tierras_nubladas') translatedBiome = 'Mistlands';
            if (biome === 'tierras_de_ceniza') translatedBiome = 'Ashlands';
            if (biome === 'norte_profundo') translatedBiome = 'Deep North';
        }
        button.title = translatedBiome;
        biomeFiltersContainer.appendChild(button);
    });

    filtrosDiv.querySelectorAll('.filtro-btn').forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
}

// Manejador de clics para los botones de filtro
function handleFilterClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.filterCategory;
    const value = button.dataset.filterValue;

    if (category === 'tipo') {
        if (activeTypes.has(value)) {
            activeTypes.delete(value);
        } else {
            activeTypes.add(value);
        }
    } else if (category === 'bioma') {
        if (activeBiomes.has(value)) {
            activeBiomes.delete(value);
        } else {
            activeBiomes.add(value);
        }
    }

    button.classList.toggle('activo');
    applyFilters();
}

// Función para aplicar los filtros activos y actualizar las criaturas mostradas
function applyFilters() {
    let filteredCreatures = allCriaturas;

    if (activeTypes.size > 0) {
        filteredCreatures = filteredCreatures.filter(criatura => activeTypes.has(criatura.tipo));
    }

    if (activeBiomes.size > 0) {
        filteredCreatures = filteredCreatures.filter(criatura => activeBiomes.has(criatura.bioma));
    }

    renderCriaturas(filteredCreatures);
}

// Renderiza las criaturas en los grids correspondientes
function renderCriaturas(creaturesToRender) {
  document.querySelectorAll('.grid-criaturas').forEach(grid => grid.innerHTML = '');

  document.querySelectorAll('.biome-header').forEach(header => {
    header.style.display = 'none';
  });

  const displayedBiomes = new Set();

  creaturesToRender.forEach(criatura => {
    const gridId = `grid-${criatura.bioma}`;
    const contenedor = document.getElementById(gridId);

    if (contenedor) {
      if (!displayedBiomes.has(criatura.bioma)) {
        const biomeHeader = document.getElementById(`header-${criatura.bioma}`);
        if (biomeHeader) {
          biomeHeader.style.display = 'block';
          displayedBiomes.add(criatura.bioma);
        }
      }

      const card = document.createElement('div');
      card.classList.add('criatura-card');
      card.classList.add(`tipo-${criatura.tipo.toLowerCase().replace(/\s/g, '-')}`);
      card.dataset.nombre = criatura.nombre;

      const imgHtml = criatura.img && criatura.img['0'] ? `<img src="${criatura.img['0']}" alt="${criatura.nombre}">` : '';

      const nombre = criatura.nombre;
      const isLong = nombre.length > 10;
      const nombreHtml = isLong
        ? `<div class="criatura-nombre marquee"><span>${nombre}</span></div>`
        : `<div class="criatura-nombre">${nombre}</div>`;

      card.innerHTML = `
        ${imgHtml}
        ${nombreHtml}
      `;

      card.addEventListener('click', () => {
        const criaturaSeleccionada = criaturasMap.get(criatura.nombre);
        if (criaturaSeleccionada) {
          mostrarDetalleCriatura(criaturaSeleccionada);
        }
      });

      contenedor.appendChild(card);
    }
  });
}

// Añadir esta sección en scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const btnIdiomaDiv = document.querySelector('.btn_idioma');
    if (btnIdiomaDiv) {
        const idiomaButton = document.createElement('button');
        idiomaButton.id = 'toggle-idioma-btn';
        idiomaButton.textContent = 'ES/EN';
        idiomaButton.classList.add('btn-esen');

        idiomaButton.addEventListener('click', () => {
            // Alternar la ruta del JSON
            if (rutaJSON === 'criaturas.json') {
                rutaJSON = 'criatures.json';
            } else {
                rutaJSON = 'criaturas.json';
            }
            // Reiniciar la aplicación con los nuevos datos
            initApp();
        });

        btnIdiomaDiv.appendChild(idiomaButton);
    }
});

// Función de inicialización de la aplicación, se ejecuta al cargar el DOM
async function initApp() {
  try {
    const response = await fetch(rutaJSON);
    if (!response.ok) {
      throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
    }
    const data = await response.json();
    allCriaturas = data;

    criaturasMap.clear(); 
    data.forEach(criatura => criaturasMap.set(criatura.nombre, criatura));

    // Limpiar los filtros activos 
    activeTypes.clear();
    activeBiomes.clear();

    const uniqueTypes = getUniqueTypes(allCriaturas);
    const uniqueBiomes = getUniqueBiomes(allCriaturas);

    createBiomeSections(uniqueBiomes);
    actualizarTituloPrincipal();
    actualizarTituloCriaturas();
    createFilterButtons(uniqueTypes, uniqueBiomes);
    renderCriaturas(allCriaturas);

    if (allCriaturas.length > 0) {
        const criaturaInicial = criaturasMap.get(allCriaturas[0].nombre);
        if (criaturaInicial) {
            mostrarDetalleCriatura(criaturaInicial);
        }
    }
  } catch (error) {
    console.error('Error al cargar la aplicación:', error);
  }
}

document.addEventListener('DOMContentLoaded', initApp);