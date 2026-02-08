const apiURL = 'https://raw.githubusercontent.com/the-user01/rest-countries-frontend-mentor/main/data.json';
const grid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const themeToggle = document.getElementById('theme-toggle');
const detailModal = document.getElementById('detail-modal');
const modalContent = document.getElementById('modal-content');
const backBtn = document.getElementById('back-btn');

let allCountries = [];

async function fetchCountries() {
    try {
        grid.innerHTML = '<p class="loading">Loading country data... please wait...</p>';

        const res = await fetch(apiURL);
        if (!res.ok) throw new Error(`Server returned status: ${res.status}`);

        const data = await res.json();
        allCountries = data;
        renderCountries(data);
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="loading" style="text-align:center; padding: 20px;">
            <p style="color: red; font-weight: bold; font-size: 1.2rem;">Unable to load data.</p>
            <p style="margin: 10px 0;">Reason: ${error.message}</p>
        </div>`;
    }
}

function renderCountries(countries) {
    grid.innerHTML = '';

    if (countries.length === 0) {
        grid.innerHTML = '<p class="loading">No countries found.</p>';
        return;
    }

    countries.forEach((country, index) => {
        const card = document.createElement('div');
        card.classList.add('country-card');
        card.style.animationDelay = `${Math.min(index * 0.05, 1)}s`;
        card.addEventListener('click', () => showDetails(country));

        const name = country.name || 'Unknown';
        const flag = country.flags ? country.flags.svg : (country.flag || '');
        const population = (country.population !== undefined) ? country.population.toLocaleString() : 'N/A';
        const region = country.region || 'N/A';
        const capital = country.capital || 'N/A';

        card.innerHTML = `
            <div class="flag-container">
                <img src="${flag}" alt="${name} flag" loading="lazy">
            </div>
            <div class="card-body">
                <h3 class="card-title">${name}</h3>
                <div class="card-info">
                    <p>Population: <span>${population}</span></p>
                    <p>Region: <span>${region}</span></p>
                    <p>Capital: <span>${capital}</span></p>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCountries() {
    const searchTerm = searchInput.value.toLowerCase();
    const regionValue = regionFilter.value;

    const filtered = allCountries.filter(country => {
        const name = country.name.toLowerCase();
        const matchesSearch = name.includes(searchTerm);
        const matchesRegion = regionValue === '' || country.region === regionValue;
        return matchesSearch && matchesRegion;
    });

    renderCountries(filtered);
}

function showDetails(country) {
    const flag = country.flags ? country.flags.svg : (country.flag || '');
    const name = country.name;
    const nativeName = country.nativeName || 'N/A';
    const population = (country.population !== undefined) ? country.population.toLocaleString() : 'N/A';
    const region = country.region || 'N/A';
    const subregion = country.subregion || 'N/A';
    const capital = country.capital || 'N/A';
    const tld = country.topLevelDomain ? country.topLevelDomain[0] : 'N/A';

    const currencies = country.currencies
        ? country.currencies.map(c => c.name).join(', ')
        : 'N/A';

    const languages = country.languages
        ? country.languages.map(l => l.name).join(', ')
        : 'N/A';

    const borders = country.borders || [];
    let borderButtons = '';

    if (borders.length > 0) {
        borderButtons = borders.map(code => {
            const borderCountry = allCountries.find(c => c.alpha3Code === code);
            const borderName = borderCountry ? borderCountry.name : code;
            return `<button class="border-btn" onclick="openBorder('${code}')">${borderName}</button>`;
        }).join('');
    } else {
        borderButtons = '<span>None</span>';
    }

    const latlng = country.latlng || [0, 0];

    modalContent.innerHTML = `
        <div class="detail-flex">
            <div class="detail-flag">
                <img src="${flag}" alt="${country.name} flag">
            </div>
            <div class="detail-text">
                <h2 class="detail-title">${name}</h2>
                <div class="detail-info-grid">
                    <div class="detail-info-group">
                        <p>Native Name: <span>${nativeName}</span></p>
                        <p>Population: <span>${population}</span></p>
                        <p>Region: <span>${region}</span></p>
                        <p>Sub Region: <span>${subregion}</span></p>
                        <p>Capital: <span>${capital}</span></p>
                    </div>
                    <div class="detail-info-group">
                        <p>Top Level Domain: <span>${tld}</span></p>
                        <p>Currencies: <span>${currencies}</span></p>
                        <p>Languages: <span>${languages}</span></p>
                    </div>
                </div>
                <div class="border-countries">
                    <strong>Border Countries:</strong>
                    ${borderButtons}
                </div>
            </div>
        </div>
        <div id="map"></div>
    `;

    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        if (window.myMap) {
            window.myMap.remove();
        }

        if (latlng.length === 2) {
            window.myMap = L.map('map').setView(latlng, 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(window.myMap);

            L.marker(latlng).addTo(window.myMap)
                .bindPopup(`<b>${name}</b>`)
                .openPopup();

            window.myMap.invalidateSize();
        } else {
            document.getElementById('map').innerHTML = '<p style="text-align:center; padding: 20px;">Map data not available for this location.</p>';
        }
    }, 100);
}

window.openBorder = (code) => {
    const country = allCountries.find(c => c.alpha3Code === code);
    if (country) showDetails(country);
};

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');

    if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        icon.className = 'fa-regular fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        icon.className = 'fa-regular fa-sun';
        text.textContent = 'Light Mode';
    }
}

searchInput.addEventListener('input', filterCountries);
regionFilter.addEventListener('change', filterCountries);
themeToggle.addEventListener('click', toggleTheme);
function closeModal() {
    detailModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

backBtn.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
        closeModal();
    }
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    icon.className = 'fa-regular fa-sun';
    text.textContent = 'Light Mode';
}

document.body.style.scrollBehavior = 'smooth';

fetchCountries();
