// Kütüphaneler
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

// DOM Referansları
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('#load-more');

let currentQuery = '';
let page = 1;
let perPage = 40;
let totalHits = 0;

const API_KEY = '53911590-e6659ac7d11975246b1e78aef';
const BASE_URL = 'https://pixabay.com/api/';

// SimpleLightbox oluşturup biçimlendirmek için
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// Event listeners
form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);
// Arama fonksiyonu
async function onSearch(event) {
  event.preventDefault();
  const query = event.target.elements.query.value.trim();
  
  // Eğer veri boşsa uyarı mesajı
  if (!query) {
    return iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
  }

  // Yeni arama
  currentQuery = query;
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');
  loader.style.display = 'block';

  try {
    const data = await fetchImages();
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      return iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    }

    renderGallery(data.hits);
    toggleLoadMore();

  } catch (error) {
    console.error(error);
    iziToast.error({
      message: 'Failed to fetch images.',
      position: 'topRight',
    });
  } finally {
    loader.style.display = 'none';
    form.reset();
  }
}

// Daha fazla yükle fonksiyonu
async function onLoadMore() {
  page += 1;
  loadMoreBtn.disabled = true;
  loader.style.display = 'block';

  try {
    const data = await fetchImages();
    renderGallery(data.hits);
    smoothScroll();
    toggleLoadMore();
  } catch (error) {
    console.error(error);
    iziToast.error({
      message: 'Failed to load more images.',
      position: 'topRight',
    });
  } finally {
    loader.style.display = 'none';
    loadMoreBtn.disabled = false;
  }
}

// Resimleri getir fonksiyonu
async function fetchImages() {
  const params = {
    key: API_KEY,
    q: currentQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  };

  const response = await axios.get(BASE_URL, { params });
  return response.data;
}

// Galeriyi görüntüle fonksiyonu
function renderGallery(images) {
  const markup = images.map(createMarkup).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

// Markup oluşturma fonksiyonu
function createMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
  return `
    <li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
      </a>
      <div class="info">
        <p><b>Likes</b> ${likes}</p>
        <p><b>Views</b> ${views}</p>
        <p><b>Comments</b> ${comments}</p>
        <p><b>Downloads</b> ${downloads}</p>
      </div>
    </li>
  `;
}

// Daha fazlasını yükle fonksiyonu
function toggleLoadMore() {
  const shown = page * perPage;
  if (shown >= totalHits) {
    loadMoreBtn.classList.add('is-hidden'); // gizle
    // info mesajı
    if (totalHits > 0) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } else {
    loadMoreBtn.classList.remove('is-hidden'); // göster
  }
}

// smooth kaydırma fonksiyonu
function smoothScroll() {
  const firstCard = gallery.firstElementChild;
  if (!firstCard) return;
  const cardHeight = firstCard.getBoundingClientRect().height;
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}