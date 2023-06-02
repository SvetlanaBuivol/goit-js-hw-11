import ImagesApiService from './js/api-pixabay';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const refs = {
  searchForm: document.querySelector('.search-form'),
  imagesContainer: document.querySelector('.gallery'),
  // loadMoreBtn: document.querySelector('.load-more'),
  target: document.querySelector('.js-guard'),
  theEnd: document.querySelector('.end'),
};

const imagesApiService = new ImagesApiService();

refs.searchForm.addEventListener('submit', onFormSubmit);
// refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);

async function onFormSubmit(e) {
  e.preventDefault();

  Notiflix.Loading.pulse('Loading data, please wait...')
  imagesApiService.query = e.currentTarget.elements.searchQuery.value;
  imagesApiService.resetPage();

  try {
    const images = await imagesApiService.getImages();
    Notiflix.Loading.remove();

    if (imagesApiService.query === '') {
      Notiflix.Notify.failure('Please, enter value', {
        position: 'center-center',
      });
      return;
    }
    
    if (images.totalHits === 0) {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.")
      return;
    }
    Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images.`)
    clearImagesContainer();
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

// function onLoadMoreClick(e) {
//   imagesApiService.getImages().then(images => {
//     appendImagesMarkup(images);
//     gallery.refresh();
//   });
// }

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
  rootMargin: '300px',
  threshold: 1.0,
}

let observer = new IntersectionObserver(onLoad, options);

async function onLoad(entries, observer) {
  Notiflix.Loading.pulse('Loading data, please wait...');
  for (const entry of entries) {
    if (entry.isIntersecting) {
      try {
      const images = await imagesApiService.getImages();
      appendImagesMarkup(images);
      Notiflix.Loading.remove();
      gallery.refresh();
      if (imagesApiService.currentHits >= images.totalHits) {
        observer.unobserve(refs.target);
        refs.theEnd.classList.remove('is-hidden');
        }
      } catch {
        onError();
        }
    }
  }
};

function onError() {
  Notiflix.Notify.failure('Oops! Something went wrong. Please try again', {
          position: 'center-center',
          clickToClose: true,
    });
}

