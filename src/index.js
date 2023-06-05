import ImagesApiService from './js/api-pixabay';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const refs = {
  searchForm: document.querySelector('.search-form'),
  imagesContainer: document.querySelector('.gallery'),
  target: document.querySelector('.js-guard'),
  theEnd: document.querySelector('.end'),
};

refs.theEnd.classList.add('is-hidden');
const imagesApiService = new ImagesApiService();

refs.searchForm.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();

  Notiflix.Loading.pulse('Loading data, please wait...');
  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  clearImagesContainer();
  imagesApiService.resetPage();
  refs.theEnd.classList.add('is-hidden');

  try {
    const images = await imagesApiService.getImages();
    Notiflix.Loading.remove();

    if (imagesApiService.query === '') {
      clearImagesContainer();
      Notiflix.Notify.failure('Please, enter value', {
        position: 'center-center',
      });
      return;
    }

    if (images.totalHits === 0) {
      clearImagesContainer();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images.`);

    appendImagesMarkup(images);
    observer.observe(refs.target);
    gallery.refresh();
  } catch {
    Notiflix.Loading.remove();
    onError();
  }
}

const gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 150,
  loop: false,
});

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
        width=300
         heihgt=300 
        />
       </a>
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${image.likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${image.views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${image.comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${image.downloads}
            </p>
        </div>
    </div>`
    )
    .join('');

  refs.imagesContainer.insertAdjacentHTML('beforeend', imageMarkup);
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

let options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

async function onLoad(entries, observer) {
  if (imagesApiService.currentHits < 40) {
    refs.theEnd.classList.remove('is-hidden');
    return;
  }
  for (const entry of entries) {
    if (entry.isIntersecting) {
      try {
        imagesApiService.incrementPage();
        Notiflix.Loading.pulse('Loading data, please wait...');
        const images = await imagesApiService.getImages();
        appendImagesMarkup(images);
        Notiflix.Loading.remove();
        gallery.refresh();
        console.log(Math.ceil(images.totalHits / 40));

        if (imagesApiService.page === Math.ceil(images.totalHits / 40)) {
          observer.unobserve(refs.target);
          refs.theEnd.classList.remove('is-hidden');
        }
      } catch {
        onError();
      }
    }
  }
}

function onError() {
  Notiflix.Notify.failure('Oops! Something went wrong. Please try again', {
    position: 'center-center',
    clickToClose: true,
  });
}
