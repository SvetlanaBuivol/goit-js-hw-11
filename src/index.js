import ImagesApiService from './js/api-pixabay';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  imagesContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesApiService = new ImagesApiService();

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);

let lightbox = new SimpleLightbox('.photo-card a', {
  captionDelay: 250,
});

function onFormSubmit(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value;
  imagesApiService.resetPage();
  imagesApiService.getImages().then(appendImagesMarkup);
}

function onLoadMoreClick(e) {
    imagesApiService.getImages().then(appendImagesMarkup);
    lightbox.refresh();
}

function appendImagesMarkup(images) {
  const imageMarkup = images.hits
    .map(
      image => `<div class="photo-card">
        <a class="gallery__link" href="${image.largeImageURL}">
        <img 
        class="gallery__image"
        src="${image.webformatURL}" 
        alt="${image.tags}" 
        loading="lazy" 
        />
        </a>
        <div class="info">
            <p class="info-item">
                <b>Likes ${image.likes}</b>
            </p>
            <p class="info-item">
                <b>Views ${image.views}</b>
            </p>
            <p class="info-item">
                <b>Comments ${image.comments}</b>
            </p>
            <p class="info-item">
                <b>Downloads ${image.downloads}</b>
            </p>
        </div>
    </div>`
    )
    .join('');

  refs.imagesContainer.insertAdjacentHTML('beforeend', imageMarkup);
}



